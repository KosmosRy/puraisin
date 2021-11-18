const lib = require("./lib");
const {Client} = require("pg");
const differenceInHours = require("date-fns/difference_in_hours");
const differenceInMinutes = require("date-fns/difference_in_minutes");
const addSeconds = require("date-fns/add_seconds");
const format = require("date-fns/format");

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
        const times = puraisut.rows.map(r => r.timestamp);

        let lastBite = null;
        for (let ts of times) {
            console.log(`Ajanhetkellä ${ts} join alkoholia 1 annoksen verran`);
            lastBite = lib.processBite(85.5, lastBite, {ts, portion: 1});
            console.log(`Alkoholiprosenttini on ${lastBite.currentPct.toFixed(3)}`);
            const soberAt = addSeconds(lastBite.lastBite, lastBite.timeTillSober);
            console.log(`Selvänä olen seuraavan kerran ${differenceInHours(soberAt, ts)} tunnin ${differenceInMinutes(soberAt, ts) % 60} minuutin kuluttua (klo. ${format(soberAt, "HH:mm")})`);
            console.log("\n");
        }

        console.log(lib.processBinge(85.5, times.map(ts => ({ts, portion: 1}))));
    } finally {
        client.end();
    }
};

dbTest().then(() => {});





