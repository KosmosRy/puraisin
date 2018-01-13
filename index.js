const {Pool} = require('pg');
const bodyParser = require("body-parser");
const uid = require("uid-safe");
const jwt = require("jsonwebtoken");
const {fetchJson, getRequest, postMessage} = require("./libs/utils");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
require("isomorphic-fetch");
require("dotenv").config();

const mode = process.env.MODE || "PROD";
const secure = process.env.SECURE ? process.env.SECURE === "true" : mode === "PROD";
const pool = new Pool({connectionString: process.env.DATABASE_URL});

const scopes = "users.profile:read,chat:write:user,channels:read";
const clientId = process.env.AUTH_CLIENT_ID;
const clientSecret = process.env.AUTH_CLIENT_SECRET;
const redirectUrl = process.env.AUTH_REDIRECT_URL;
const channelId = process.env.PURAISUT_CHANNEL_ID || "C02NAQFDM"; // oletuksena käytetään #hiekkalaatikko-kanavaa

const app = require('express')();

app.set("view engine", "ejs");
app.set("views", "./views");
app.set('port', (process.env.PORT || 5000));

const sess = {
    store: new pgSession({
        pool
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

    const {real_name, display_name, image_32} = profileResponse.profile;
    return {
        name: real_name,
        nickname: display_name,
        picture: image_32
    };
};

const fail = (res, reason, status = 500)  => {
    res.status(status).render("fail", { reason });
};

app.get('/', async (req, res) => {
    if (!isLoggedIn(req)) {
        const loginState = await uid(18);
        req.session.loginState = loginState;
        res.render('login', {
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
        if (req.session.tattis) {
            delete req.session.tattis;
            page = "tattis";
        } else {
            page = "index";
        }

        res.render(page, {
            title: "Pikapuraisin",
            realName: sessionInfo.name,
            avatar: sessionInfo.picture
        });
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
            const authResponse = await fetchJson(new Request(
                `https://slack.com/api/oauth.access?client_id=${clientId}&client_secret=${clientSecret}&code=${req.query.code}`
            ));
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

    const type = req.body.type;
    const content = req.body.content;
    const location = req.body.location;
    const source = "ppapp";
    const biter = sessionInfo.name;
    const info = request.body.info;

    if (mode !== "DEV") {
        postMessage({
            channel: channelId,
            text: `${type};${content};${location}`,
            as_user: true
        }, req.session.token).catch(err => console.error(err));
    } else {
        console.log(`Dev-mode, oltais lähetetty #puraisut-kanavalle: ${type};${content};${location}`)
    }

    // fire up query!
    try {
        await pool.query(
            "INSERT INTO puraisu (type, content, location, source, biter, info) VALUES($1, $2, $3, $4, $5, $6)",
            [type, content, location, source, biter, info]);
        req.session.tattis = true;
        res.redirect("/");
    } catch (err) {
        console.error(err);
        fail(res, err);
    }
});
