const lib = require("./lib");
const moment = require("moment");
const {Client} = require("pg");

const dbTest = async () => {
    const client = new Client({
        user: "puraisin",
        host: "localhost",
        database: "puraisin",
        password: "puraisin",
        port: 5432,
    });

    try {
        client.connect();
        const puraisut = await client.query("SELECT timestamp FROM puraisu WHERE biter = $1 ORDER BY timestamp", ["U02MLKTA2"]);
        const times = puraisut.rows.map(r => moment(r.timestamp));

        let lastBite = null;
        for (let ts of times) {
            console.log(`Ajanhetkellä ${ts.format()} join alkoholia 1 annoksen verran`);
            lastBite = lib.processBite(85.5, lastBite, {ts, portion: 1});
            console.log(`Alkoholiprosenttini on ${lastBite.currentPct.toFixed(3)}`);
            const dur = moment.duration(lastBite.timeTillSober, "hours");
            console.log(`Selvänä olen seuraavan kerran ${dur.hours()} tunnin ${dur.minutes() % 60} minuutin kuluttua (klo. ${moment(ts).add(dur).format("HH:mm")})`);
            console.log("\n");
        }

        console.log(lib.processBinge(85.5, times.map(ts => ({ts, portion: 1}))));
    } finally {
        client.end();
    }
};

dbTest().then(() => {});





