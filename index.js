/* global Request:false */
require("dotenv").config();
require("log-timestamp");
const bodyParser = require("body-parser");
const uid = require("uid-safe");
const {fetchJson, getRequest, postMessage} = require("kosmos-utils");
const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const path = require("path");
const addHours = require("date-fns/add_hours");
const csurf = require("csurf");

const mode = process.env.MODE || "PROD";
const secure = process.env.SECURE ? process.env.SECURE === "true" : mode === "PROD";
const {processBinge, processBite, burnFactor, puraisuDB} = require("./lib");
const db = puraisuDB(process.env.DATABASE_URL, "ppapp");

const scopes = "users.profile:read,chat:write:user,channels:read";
const clientId = process.env.AUTH_CLIENT_ID;
const clientSecret = process.env.AUTH_CLIENT_SECRET || uid(4);
const redirectUrl = process.env.AUTH_REDIRECT_URL;
const channelId = process.env.PURAISUT_CHANNEL_ID || "C02NAQFDM"; // oletuksena käytetään #hiekkalaatikko-kanavaa

const app = express();

app.set("view engine", "ejs");
app.set("views", "./views");
app.set('port', (process.env.PORT || 5000));

const sess = {
    store: new pgSession({
        pool: db.pool
    }),
    secret: clientSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 365 * 24 * 60 * 60 * 1000,
        secure
    }
};

if (secure) {
    app.set("trust proxy", 1);
}

app.use(express.static(path.join(__dirname, "frontend/build")));
app.use(bodyParser.json());
app.use(require("cookie-parser")());
app.use(session(sess));
app.use(csurf({}));
app.use((req, res, next) => {
    res.locals.title = "Pikapuraisin";
    res.locals.loggedIn = false;
    next();
});

const isLoggedIn = req => {
    if (mode === "DEV") {
        if (!req.session.loggedIn) {
            Object.assign(req.session, {
                loggedIn: true,
                token: "token",
                userId: "user_id",
                teamId: "team_id"
            });
        }
        return true;
    }
    return req.session.loggedIn;
};

const createSessionInfo = async (token) => {
    let profile;
    if (mode === "DEV") {
        console.log("Dev-mode, ei käydä oikeasti slackissa");
        profile = {
            real_name: "Pekka Puraisija",
            display_name: process.env.DEV_PURAISIJA || "pp",
            image_48: "https://emoji.slack-edge.com/T02MLKTA0/trollface/8c0ac4ae98.png"
        };
    } else {
        const profileResponse = await fetchJson(getRequest("users.profile.get", token));
        if (!profileResponse.ok) {
            console.error(profileResponse);
            throw new Error("profileResponse not OK");
        }
        profile = profileResponse.profile;
    }

    const {real_name, display_name, image_48} = profile;
    return {
        name: real_name,
        nickname: display_name,
        picture: image_48
    };
};

const fail = (res, reason, status = 500)  => {
    res.status(status).send(reason || "Hupsista, saatana!")
};

const sendSessionInfo = (req, res) => {
    const sessionInfo = req.session.sessionInfo;
    const prevBite = sessionInfo.prevBite;
    res.json({
        info: {
            realName: sessionInfo.name,
            avatar: sessionInfo.picture,
            permillage: prevBite.currentPct,
            lastBite: prevBite.lastBite,
            burnFactor,
            csrf: req.csrfToken()
        }
    });
};

app.get("/info", async (req, res) => {
    if (!isLoggedIn(req)) {
        const loginState = await uid(18);
        req.session.loginState = loginState;
        res.json({
            loginInfo: {
                scopes,
                clientId,
                state: loginState,
                redirectUri: encodeURIComponent(redirectUrl)
            }
        });
    } else {
        if (!req.session.sessionInfo) {
            console.log("No session info in session, create");
            try {
                req.session.sessionInfo = await createSessionInfo(req.session.token);
            } catch (err) {
                console.error("Profiilitietojen haku epäonnistui, syynä mahdollisesti hapantunut access token");
                console.error("Ohjataan sisäänkirjautumissivulle");
                console.error(err);
                req.session.destroy(() =>
                    fail(res, "Profiilitietojen haku epäonnistui, syynä mahdollisesti hapantunut access token", 401));
                return;
            }
        }
        req.session.sessionInfo.prevBite = await db.getBites(req.session.userId).then(b => processBinge(85.5, b));
        sendSessionInfo(req, res);
    }
});

app.delete("/logout", (req, res) => {
    req.session.regenerate(() => res.sendStatus(204));
});

app.get("/auth/redirect", async (req, res) => {
    const loginState = req.session.loginState;
    delete req.session.loginState;
    if (!req.query.error && loginState && req.query.state === loginState && req.query.code) {
        try {
            const query = `client_id=${clientId}&client_secret=${clientSecret}&code=${req.query.code}&redirect_uri=${redirectUrl}`;
            const authResponse = await fetchJson(new Request(`https://slack.com/api/oauth.access?${query}`));
            if (!authResponse.ok) {
                fail(res, "authResponse not OK");
            }

            Object.assign(req.session, {
                loggedIn: true,
                token: authResponse.access_token,
                userId: authResponse.user_id,
                teamId: authResponse.team_id
            });

            res.redirect("/");

        } catch (err) {
            fail(res, err);
        }
    } else {
        console.error(req.query.error || "Joku virhe");
        fail(res, "Meeppä pois", 401);
    }
});

app.listen(app.get('port'), () => {
    console.log('Node app is running on port: ', app.get('port'));
});

app.post('/submit-data', async (req, res) => {
    if (!isLoggedIn(req)) {
        fail(req, "Elä kuule yritä ilman sessiota", 401);
        return;
    }

    let prevBite = await db.getBites(req.session.userId).then(b => processBinge(85.5, b));
    let currentPermillage = processBite(85.5, prevBite, {ts: new Date(), portion: 0}).currentPct;

    /*
    päästetään läpi ilman sanitointia, slack ja express sanitoivat syötteet automaattisesti
    ja sql-injektiot vältetään prepared statementeilla. Pitää muistaa sitten itse sanitoida
    arvot tarpeen mukaan
    */
    const {content, info, postfestum} = req.body;
    let {portion, pftime} = req.body;
    const type = currentPermillage > 0 ? "p" : "ep";
    const isPf = !!postfestum;
    pftime = isPf ? (() => {
        const t = pftime ? parseFloat(pftime.replace(",", ".")) : 0;
        if (isNaN(t)) {
            console.error(`Can't parse postfestum time from ${pftime}`);
            return 0;
        }
        return t;
    })() : 0;
    const ts = addHours(new Date(), -pftime);
    const location = req.body.location === "else" ? req.body.customlocation : req.body.location;
    portion = portion ? (() => {
        const t = parseFloat(portion.replace(",", "."));
        if (isNaN(t)) {
            console.error(`Can't parse portion from ${portion}`);
            return 1;
        }
        return t;
    })() : 1;
    let coordinates = !isPf ? req.body.coordinates : null;
    let coordLoc = "";

    if (coordinates) {
        try {
            const {latitude, longitude, accuracy} = coordinates;
            if (latitude && longitude && accuracy) {
                const gmapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                coordLoc = ` (<${gmapUrl}|${latitude.toFixed(4)},${longitude.toFixed(4)}> ±${accuracy.toFixed(0)}m)`;
            } else {
                coordinates = null;
            }
        } catch (err) {
            coordinates = null;
        }
    } else {
        coordinates = null;
    }

    // fire up query!
    try {
        await db.insertPuraisu(req.session.userId, type, content, location, info, isPf, coordinates, portion, ts);
    } catch (err) {
        console.error(err);
        fail(res, err);
        return;
    }

    prevBite = await db.getBites(req.session.userId).then(b => processBinge(85.5, b));
    currentPermillage = prevBite.currentPct;

    const typePostfix = isPf ? `-postfestum (${pftime} h sitten)` : "";
    const slackMsg = `${type}${typePostfix};${content};${location}${coordLoc};${currentPermillage.toFixed(2).replace(".", ",")}\u00A0‰${info ? ";" + info : ""}`;
    if (mode !== "DEV") {
        postMessage({
            channel: channelId,
            text: `\u{200B}${slackMsg}`,
            unfurl_links: false,
            as_user: true
        }, req.session.token).catch(err => console.error(err));
    } else {
        console.log(`Dev-mode, oltais lähetetty #puraisut-kanavalle: ${slackMsg}`)
    }

    req.session.sessionInfo.prevBite = prevBite;
    sendSessionInfo(req, res);
});

