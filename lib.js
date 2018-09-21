const differenceInSeconds = require("date-fns/difference_in_seconds");
const {Pool} = require("pg");

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
    weight: 85.5
});

const processBite = (prevBite, bite) => {
    const b = (bodyWater * permillageConvertion * swedishMultiplier) / (bodyWaterConstantMale * bite.weight);
    let { currentPct, timeTillSober, lastBite } = prevBite || defaultBite();
    const { ts, portion } = bite;
    if (lastBite) {
        currentPct = Math.max(currentPct - a * differenceInSeconds(ts, lastBite), 0);
    }
    currentPct += b * portion;
    timeTillSober = currentPct / a;
    if (portion) {
        lastBite = ts;
    }
    return { currentPct, timeTillSober, lastBite };
};

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

    const insertPuraisu = (user, type, content, location, info, pf, coordinates, portion, timestamp = new Date()) => {
        console.log("Inserting puraisu");
        return pool.query(
            `INSERT INTO puraisu (type, content, location, info, source, biter, postfestum, coordinates, timestamp, portion, weight)
            SELECT $1, $2, $3, $4, $5, $6::varchar(32), $7, $8, $9, $10, coalesce((select weight from megafauna where biter = $6), 85.5)`,
            [type, content, location, info, source, user, pf, coordinates, timestamp, portion]
        );
    };

    const getBites = async (userId, since) => {
        const rs = await pool.query(
            `SELECT timestamp AS ts, portion, weight
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