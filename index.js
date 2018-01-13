const {Pool} = require('pg');
const bodyParser = require("body-parser");
const uid = require("uid-safe");
const jwt = require("jsonwebtoken");
const {fetchJson, getRequest, postMessage, getChannels} = require("./libs/utils");
const session = require("express-session");
const pgSession = require("connect-pg-simple")(session);
require("isomorphic-fetch");
require("dotenv").config();

const mode = process.env.MODE;
const pool = new Pool({connectionString: process.env.DATABASE_URL});

const scopes = "users.profile:read,chat:write:user,channels:read";
const clientId = process.env.AUTH_CLIENT_ID;
const clientSecret = process.env.AUTH_CLIENT_SECRET;
const redirectUrl = process.env.AUTH_REDIRECT_URL;

const app = require('express')();

app.set("view engine", "pug");
app.set("views", "./views");
app.set('port', (process.env.PORT || 5000));
app.use(express.static(path.join(__dirname, 'static')));
app.use(bodyParser.urlencoded({extended: false}));

app.use(require("cookie-parser")());
app.use(session({
    store: new pgSession({
        pool
    }),
    secret: clientSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 365 * 24 * 60 * 60 * 1000
    }
}));

const encodeState = state => jwt.sign({
    data: state
}, clientSecret, {
    expiresIn: "5m",
    notBefore: 0
});

const isLoggedIn = req => {
    if (mode === "DEV") {
        if (!req.session.loggedIn) {
            Object.assign(req.session, {
                loggedIn: true,
                token: "token",
                userId: "user_id",
                teamId: "team_id",
                realName: "Pekka Puraisija",
                displayName: process.env.DEV_PURAISIJA || "pp"
            });
        }
        return true;
    } else {
        return req.session.loggedIn;
    }
};

const decodeState = token => {
    try {
        return jwt.verify(token, clientSecret).data;
    } catch (err) {
        console.error(err);
        return null;
    }
};

app.get('/', (req, res) => {
    if (!isLoggedIn(req)) {
        res.redirect("/login.html");
    } else {
        res.render("index", {
            title: "Pikapuraisin",
            realName: req.session.realName,
            avatar: req.session.avatar
        });
    }
});

app.get("/login.html", async (req, res) => {
    if (isLoggedIn(req)) {
        res.redirect("/");
        return;
    }
    const sessionState = await uid(18);
    res.cookie("puraisuState", encodeState(sessionState), { httpOnly: true, maxAge: 300000 }).render('login', {
        scopes,
        clientId,
        state: sessionState,
        redirectUrl: encodeURIComponent(redirectUrl)
    })
});

app.get("/auth/redirect", async (req, res) => {
    const fail = err => {
        if (err) {
            console.error(err);
        }
        res.redirect("/fail");
    };

    const cookieState = decodeState(req.cookies.puraisuState);
    res.clearCookie("puraisuState");
    if (!req.query.error && cookieState && req.query.state === cookieState && req.query.code) {
        try {
            const authResponse = await fetchJson(new Request(
                `https://slack.com/api/oauth.access?client_id=${clientId}&client_secret=${clientSecret}&code=${req.query.code}`
            ));
            console.log(authResponse);
            if (!authResponse.ok) {
                fail("authResponse not OK");
            }

            const profileResponse = await fetchJson(getRequest("users.profile.get", authResponse.access_token));
            console.log(profileResponse);
            if (!profileResponse.ok) {
                fail("profileResponse not OK");
            }

            const [channelId] = await getChannels(authResponse.access_token)
                .then(channels => Object.entries(channels).find(([id, o]) => o.name === "hiekkalaatikko"));
            console.log(channelId);

            const {real_name, display_name, image_32} = profileResponse.profile;
            Object.assign(req.session, {
                loggedIn: true,
                token: authResponse.access_token,
                userId: authResponse.user_id,
                teamId: authResponse.team_id,
                realName: real_name,
                displayName: display_name,
                avatar: image_32,
                channelId
            });
            req.session.save();

            res.redirect("http://localhost:5000");

        } catch (err) {
            fail(err);
        }
    } else {
        console.error(req.query.error || "Joku virhe");
        res.status(401).send("Meeppä pois");
    }
});

app.listen(app.get('port'), function () {
    console.log('Node app is running on port: ', app.get('port'));
});

app.post('/submit-data', async (request, response) => {
    if (!isLoggedIn(request)) {
        response.status(401).end();
        return;
    }

    const type = request.body.type;
    const content = request.body.content;
    const location = request.body.location;
    const source = "ppapp";
    const biter = request.session.displayName;
    const info = request.body.info;

    if (request.session.channelId) {
        postMessage({
            channel: request.session.channelId,
            text: `${type};${content};${location}`,
            as_user: true
        }, request.session.token).catch(err => console.error(err));
    }

    // fire up query!
    try {
        await pool.query(
            "INSERT INTO puraisu (type, content, location, source, biter, info) VALUES($1, $2, $3, $4, $5, $6)",
            [type, content, location, source, biter, info]);
        response.sendFile('tattis.html', {root: __dirname});
    } catch (err) {
        response.status(500).end();
    }
});
