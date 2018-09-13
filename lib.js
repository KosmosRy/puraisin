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
    lastBite: null
});

const processBite = (weight, prevBite, bite) => {
    const b = (bodyWater * permillageConvertion * swedishMultiplier) / (bodyWaterConstantMale * weight);
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

exports.processBinge = (weight, bites, prevBite) => {
    if (!bites || !bites.length) {
        return defaultBite();
    }
    return bites.reduce((prev, curr) => processBite(weight, prev, curr), prevBite || defaultBite());
};

exports.burnFactor = a;

const puraisuDB = (connectionString, source) => {
    const pool = new Pool({connectionString});

    const insertPuraisu = (user, type, content, location, info, pf, coordinates, portion, timestamp = new Date()) => {
        console.log("Inserting puraisu");
        return pool.query(
            `INSERT INTO puraisu (type, content, location, info, source, biter, postfestum, coordinates, timestamp, portion) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [type, content, location, info, source, user, pf, coordinates, timestamp, portion]
        );
    };

    const getBites = async (userId, since) => {
        const rs = await pool.query(
            "SELECT timestamp AS ts, portion FROM puraisu " +
            "WHERE biter = $1 " +
            "AND ($2::timestamp IS NULL OR timestamp > $2) " +
            "ORDER BY timestamp", [userId, since]
        );
        return rs.rows;
    };

    return {
        pool, insertPuraisu, getBites
    };
};

exports.puraisuDB = puraisuDB;