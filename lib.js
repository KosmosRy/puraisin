const differenceInSeconds = require("date-fns/difference_in_seconds");
const {Pool, types} = require("pg");
types.setTypeParser(1700, 'text', parseFloat);

const bodyWater = 0.806;
const bodyWaterConstantMale = 0.58;
const metabolismConstantMale = 0.015 / 3600;
const swedishMultiplier = 1.2;
const permillageConvertion = 10;
const persW = 1.0;

const a = persW * metabolismConstantMale * permillageConvertion;

const defaultBite = () => ({
    currentPct: 0,
    timeTillSober: 0,
    lastBite: null,
    bingeStart: null
});

const processBite = (prevBite, bite) => {
    let { currentPct, timeTillSober, lastBite, bingeStart } = prevBite || defaultBite();
    const { ts, portion, weight } = bite;
    if (lastBite) {
        currentPct = Math.max(currentPct - a * differenceInSeconds(ts, lastBite), 0);
    }
    if (portion) {
        if (currentPct === 0) {
            bingeStart = ts;
        }
        const b = (bodyWater * permillageConvertion * swedishMultiplier) / (bodyWaterConstantMale * (weight || 85.5));
        currentPct += b * portion;
        lastBite = ts;
    }
    if (currentPct === 0) {
        bingeStart = null;
    }
    timeTillSober = currentPct / a;
    return { currentPct, timeTillSober, lastBite, bingeStart };
};

exports.currentStatus = (prevBite = defaultBite()) => processBite(prevBite, {ts: new Date()});

exports.processBite = processBite;

exports.processBinge = (bites, prevBite) => {
    if (!bites || !bites.length) {
        return defaultBite();
    }
    return bites.reduce((prev, curr) => processBite(prev, curr), prevBite || defaultBite());
};

exports.burnFactor = a;

const puraisuDB = (connectionString, source) => {
    const pool = new Pool({connectionString});

    const insertPuraisu = (user, type, content, location, info, pf, coordinates, portion, timestamp = new Date(), tzoffset = 0) => {
        console.log("Inserting puraisu");
        return pool.query(
            `INSERT INTO puraisu (type, content, location, info, source, biter, postfestum, coordinates, timestamp, portion, weight, tzoffset)
            SELECT $1, $2, $3, $4, $5, $6::varchar(32), $7, $8, $9, $10, coalesce((select weight from megafauna where biter = $6), 85.5), $11`,
            [type, content, location, info, source, user, pf, coordinates, timestamp, portion, tzoffset]
        );
    };

    const getBites = async (userId, since) => {
        const rs = await pool.query(
            `SELECT timestamp AS ts, portion, weight::decimal
             FROM puraisu
             WHERE biter = $1
               AND ($2::timestamp IS NULL OR timestamp > $2)
             ORDER BY timestamp`, [userId, since]
        );
        return rs.rows;
    };

    return {
        pool, insertPuraisu, getBites
    };
};

exports.puraisuDB = puraisuDB;
