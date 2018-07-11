const moment = require("moment");

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
    let { currentPct, timeTillSober, lastBite } = prevBite ? prevBite : defaultBite();
    const { ts, portion } = bite;
    if (lastBite) {
        currentPct = Math.max(currentPct - a * moment(ts).diff(lastBite, "seconds"), 0);
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
    return bites.reduce((prev, curr) => processBite(weight, prev, curr), prevBite ? prevBite : defaultBite());
};