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
const addMinutes = require("date-fns/add_minutes");
const csurf = require("csurf");
const SlackStrategy = require("passport-slack").Strategy;
const passport = require("passport");

const mode = process.env.MODE || "PROD";
const secure = process.env.SECURE ? process.env.SECURE === "true" : mode === "PROD";
const {processBinge, burnFactor, puraisuDB, currentStatus} = require("./lib");
const db = puraisuDB(process.env.DATABASE_URL, "ppapp");

const scope = "users.profile:read,chat:write:user,channels:read";
const clientID = process.env.AUTH_CLIENT_ID;
const clientSecret = process.env.AUTH_CLIENT_SECRET || uid(4);
const redirectUrl = process.env.AUTH_REDIRECT_URL;
const channelId = process.env.PURAISUT_CHANNEL_ID || "C02NAQFDM"; // oletuksena käytetään #hiekkalaatikko-kanavaa

passport.use(new SlackStrategy({
        clientID,
        clientSecret,
        skipUserProfile: true,
        //callbackURL: "/auth/redirect",
        callbackURL: redirectUrl,
        scope
    },
    (accessToken, refreshToken, params, profile, done) => {
        const {access_token, user_id} = params;
        if (access_token && user_id) {
            done(null, {
                token: access_token,
                userId: user_id
            });
        } else {
            done(null, false);
        }
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(id, done) {
    done(null, id);
});

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

const sendUserStatus = async (req, res, prevBite) => {
    let pb = prevBite;
    if (!pb) {
        pb = await db.getBites(req.session.userId).then(b => processBinge(b));
    }
    res.json({
        permillage: pb.currentPct,
        lastBite: pb.lastBite,
        csrf: req.csrfToken(),
        bingeStart: pb.bingeStart
    });
};

const app = express();
app.set('port', (process.env.PORT || 5000));
if (secure) {
    app.set("trust proxy", 1);
}
app.use(express.static(path.join(__dirname, "frontend/build")));
app.use(bodyParser.json());
app.use(session(sess));
app.use(passport.initialize());
app.use(csurf({}));


app.get("/auth/slack", passport.authorize("slack"));
app.get("/auth/redirect", passport.authorize("slack", { failureRedirect: "/"}),
    (req, res) => {
        if (req.account) {
            Object.assign(req.session, req.account, {
                loggedIn: true
            });
            res.redirect("/")
        } else {
            fail(res, "Meeppä pois", 401);
        }
    }
);

app.delete("/logout", (req, res) => {
    req.session.regenerate(() => res.sendStatus(204));
});

app.use((req, res, next) => {
    if (!isLoggedIn(req)) {
        res.sendStatus(401);
    } else {
        next();
    }
});

app.get("/info", async (req, res) => {
    let sessionInfo = req.session.sessionInfo;
    if (!sessionInfo) {
        try {
            sessionInfo = req.session.sessionInfo = await createSessionInfo(req.session.token);
        } catch (err) {
            console.error("Profiilitietojen haku epäonnistui, syynä mahdollisesti hapantunut access token");
            console.error("Ohjataan sisäänkirjautumissivulle");
            console.error(err);
            req.session.regenerate(() => {
                res.sendStatus(401);
            });
            return;
        }
    }
    res.json({
        realName: sessionInfo.name,
        avatar: sessionInfo.picture,
        burnFactor
    });
});

app.get("/user-status", async (req, res) => {
    await sendUserStatus(req, res);
});


app.post('/submit-data', async (req, res) => {
    let prevBite = await db.getBites(req.session.userId).then(b => processBinge(b));
    let currentPermillage = currentStatus(prevBite).currentPct;

    /*
    päästetään läpi ilman sanitointia, slack ja express sanitoivat syötteet automaattisesti
    ja sql-injektiot vältetään prepared statementeilla. Pitää muistaa sitten itse sanitoida
    arvot tarpeen mukaan
    */
    const {content, info, postfestum, tzOffset} = req.body;
    let {pftime, portion} = req.body;
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
    portion = (() => {
        let p = parseFloat(portion.replace ? portion.replace(",", ".") : portion);
        if (isNaN(p)) {
            console.error(`Can't parse portion from ${portion}`);
            return 1;
        }
        return p;
    })();
    const ts = addMinutes(new Date(), -pftime);
    const location = req.body.location === "else" ? req.body.customlocation : req.body.location;
    const alcoholW = Math.round(portion * 12);
    let coordinates = !isPf ? req.body.coordinates : null;
    let coordLoc = "";

    if (coordinates) {
        try {
            const {latitude, longitude, accuracy} = coordinates;
            if (latitude && longitude && accuracy) {
                const gmapUrl = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                coordLoc = ` (<${gmapUrl}|${latitude.toFixed(4)},${longitude.toFixed(4)}>\u00A0±${accuracy.toFixed(0)}m)`;
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
        await db.insertPuraisu(req.session.userId, type, content, location, info, isPf, coordinates, portion, ts, tzOffset);
    } catch (err) {
        console.error(err);
        fail(res, err);
        return;
    }

    prevBite = await db.getBites(req.session.userId).then(b => processBinge(b));
    currentPermillage = prevBite.currentPct;

    const typePostfix = isPf ? `-postfestum (${pftime} min sitten)` : "";
    const slackMsg = `${type}${typePostfix};${content}\u00A0(${alcoholW}\u00A0g);${location}${coordLoc};${currentPermillage.toFixed(2).replace(".", ",")}\u00A0‰${info ? ";" + info : ""}`;
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

    await sendUserStatus(req, res, prevBite);
});

app.listen(app.get('port'), () => {
    console.log('Node app is running on port: ', app.get('port'));
});
