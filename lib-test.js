const lib = require("./lib");
const moment = require("moment");

const times = [
    moment([2018, 4, 25, 7]),
    moment([2018, 4, 25, 9]),
    moment([2018, 4, 25, 9, 5]),
    moment([2018, 4, 25, 9, 19]),
    moment([2018, 4, 25, 9, 35]),
    moment([2018, 4, 25, 9, 40]),
    moment([2018, 4, 25, 9, 45]),
    moment([2018, 4, 25, 10, 15]),
    moment([2018, 4, 25, 10, 18]),
    moment([2018, 4, 25, 11, 40]),
    moment([2018, 4, 25, 12, 32])
];

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

