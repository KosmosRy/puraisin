const {Client} = require('pg');
const bodyParser = require("body-parser");
const uid = require("uid-safe");
const jwt = require("jsonwebtoken");
const {fetchJson, getRequest} = require("./libs/utils");
const session = require("express-session");
require("isomorphic-fetch");
require("dotenv").config();

const mode = process.env.MODE;

const scopes = "users.profile:read,chat:write:user";
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
    secret: clientSecret,
    resave: false,
    saveUninitialized: false
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
        res.sendFile('index.html', {root: __dirname});
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

            const {real_name, display_name, image_32} = profileResponse.profile;
            Object.assign(req.session, {
                loggedIn: true,
                token: authResponse.access_token,
                userId: authResponse.user_id,
                teamId: authResponse.team_id,
                realName: real_name,
                displayName: display_name,
                avatar: image_32
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

app.post('/submit-data', function (request, response) {
    if (!isLoggedIn(request)) {
        response.status(401).end();
        return;
    }

    const type = request.body.type;
    const content = request.body.content;
    const location = request.body.location;
    const source = request.body.source;
    const biter = request.body.biter;
    const info = request.body.info;
	const query1 = {
        name: 'create-puraisu',
        text: 'INSERT INTO puraisu (type, content, location, source, biter, info) VALUES($1, $2, $3, $4, $5, $6) RETURNING type',
        values: [type, content, location, source, biter,info]
    };

	const client = new Client({
	   user: '[username]',
        host: '127.0.0.1',
        database: 'puraisin',
        password: '[password]',
        port: 5432,
	    // {connectionString: process.env.DATABASE_URL}
	})

    // init connection
    client.connect();

    // fire up query! 
    client.query(query1, (err, res) => {
        if (err) {
            console.log(err.stack);
        } else {
            console.log(res.rows[0]);
        }
        response.sendFile('tattis.html', {root: __dirname});
        client.end();
    });

});
