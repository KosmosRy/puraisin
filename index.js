require("dotenv").config();
require("log-timestamp");
const bodyParser = require("body-parser");
const uid = require("uid-safe");
const jwt = require("jsonwebtoken");
const {fetchJson, getRequest, postMessage, puraisuDB} = require("kosmos-utils");
const express = require("express");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
const path = require("path");
const csurf = require("csurf");
const moment = require("moment-timezone");

const mode = process.env.MODE || "PROD";
const secure = process.env.SECURE ? process.env.SECURE === "true" : mode === "PROD";
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

app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({extended: false}));
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
    } else {
        return req.session.loggedIn;
    }
};

const decodeJwt = jwtToken => {
    try {
        return jwt.verify(jwtToken, clientSecret);
    } catch (err) {
        console.error(err);
        return null;
    }
};

const createSessionInfo = async token => {
    if (mode === "DEV") {
        console.log("Dev-mode, ei käydä oikeasti slackissa");
        return {
            name: "Pekka Puraisija",
            nickName: process.env.DEV_PURAISIJA || "pp",
            picture: "https://emoji.slack-edge.com/T02MLKTA0/trollface/8c0ac4ae98.png"
        };
    }
    const profileResponse = await fetchJson(getRequest("users.profile.get", token));
    if (!profileResponse.ok) {
        console.error(profileResponse);
        throw new Error("profileResponse not OK");
    }

    const {real_name, display_name, image_48} = profileResponse.profile;
    return {
        name: real_name,
        nickname: display_name,
        picture: image_48
    };
};

const render = (res, page, params) =>
    res.render("template.ejs", Object.assign({}, params, {page}));

const fail = (res, reason, status = 500)  => {
    res.render("template.ejs", {
        page: "fail",
        reason: reason || "Hupsista, saatana!"
    }, (err, html) => {
        res.status(status).send(html);
    });
};

app.get('/', async (req, res) => {
    if (!isLoggedIn(req)) {
        const loginState = await uid(18);
        req.session.loginState = loginState;
        render(res, "login", {
            title: "Kirjaudu Puraisimeen!",
            scopes,
            clientId,
            state: loginState,
            redirectUrl: encodeURIComponent(redirectUrl)
        });
    } else {
        let sessionInfo;
        if (req.cookies.puraisusession) {
            sessionInfo = decodeJwt(req.cookies.puraisusession);
        } else {
            console.log("Uusi sessio, haetaan infot Slackista");
            try {
                sessionInfo = await createSessionInfo(req.session.token);
            } catch (err) {
                console.error("Profiilitietojen haku epäonnistui, syynä mahdollisesti hapantunut access token");
                console.error("Ohjataan sisäänkirjautumissivulle");
                console.error(err);
                req.session.destroy(() =>
                    fail(res, "Profiilitietojen haku epäonnistui, syynä mahdollisesti hapantunut access token", 401));
                return;
            }
            res.cookie("puraisusession", jwt.sign(sessionInfo, clientSecret, { notBefore: 0 }), {
                httpOnly: true,
                secure
            });
        }

        let page;
        const context = {
            realName: sessionInfo.name,
            avatar: sessionInfo.picture,
            loggedIn: true
        };

        if (req.session.tattis) {
            context.type = req.session.type;
            context.content = req.session.content;
            delete req.session.tattis;
            delete req.session.type;
            delete req.session.content;
            page = "tattis";
        } else {
            context.csrfToken = req.csrfToken();
            page = "index";
        }

        render(res, page, context);
    }
});

app.get("/logout", (req, res) => {
    req.session.destroy(() => res.clearCookie("puraisusession").redirect("/"));
});

app.get("/auth/redirect", async (req, res) => {
    const loginState = req.session.loginState;
    delete req.session.loginState;
    if (!req.query.error && loginState && req.query.state === loginState && req.query.code) {
        try {
            const query = `client_id=${clientId}&client_secret=${clientSecret}&code=${req.query.code}&redirect_uri=${redirectUrl}`;
            const authResponse = await fetchJson(new Request(`https://slack.com/api/oauth.access?${query}`));
            console.log(authResponse);
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

app.listen(app.get('port'), function () {
    console.log('Node app is running on port: ', app.get('port'));
});

app.post('/submit-data', async (req, res) => {
    if (!isLoggedIn(req)) {
        fail(req, "Elä kuule yritä ilman sessiota", 401);
        return;
    }

    let sessionInfo;
    if (req.cookies.puraisusession) {
        sessionInfo = decodeJwt(req.cookies.puraisusession);
    } else {
        fail(res, "Session data puuttuu", 401);
        return;
    }

    /*
    päästetään läpi ilman sanitointia, slack ja express sanitoivat syötteet automaattisesti
    ja sql-injektiot vältetään prepared statementeilla. Pitää muistaa sitten itse sanitoida
    arvot tarpeen mukaan
    */
    const {type, content, location, info, postfestum} = req.body;
    const isPf = !!postfestum;
    let coordinates = !isPf ? req.body.coordinates : null;
    let coordLoc = "";

    let tz;
    try {
        moment.tz(req.body.tz);
        tz = req.body.tz;
    } catch (e) {}

    if (coordinates) {
        try {
            const coordJson = JSON.parse(coordinates);
            const {latitude, longitude, accuracy} = coordJson;             
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

    const slackMsg = `${type}${isPf ? "-postfestum" : ""};${content};${location}${coordLoc}${info ? ";" + info : ""}`;
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

    // fire up query!
    try {
        await db.insertPuraisu(req.session.userId, type, content, location, info, isPf, coordinates, tz);
        req.session.tattis = true;
        req.session.type = type;
        req.session.content = content;
        res.redirect("/");
    } catch (err) {
        console.error(err);
        fail(res, err);
    }
});

