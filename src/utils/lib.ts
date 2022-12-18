import dayjs from 'dayjs';
import { Binge, BiteInfo } from '../types/common';
import config from './config';
import {
  getBites,
  getLastBingeStart,
  getMegafauna,
  getPreviousBite,
  getWeight,
  insertPuraisu,
  updatePuraisu,
} from './db';
import { SlackSession } from '../types/slack';
import { slackClient } from './slack';

export interface Bite {
  id: number;
  ts: Date;
  permillage: number;
  portion: number;
  weight: number;
}

export interface Biter {
  biter: string;
  weight: number;
  displayName: string;
}

const { channelId } = config.slack;

const bodyWater = 0.806;
const bodyWaterConstantMale = 0.58;
const metabolismConstantMale = 0.015 / 3600;
const swedishMultiplier = 1.2;
const permillageConvertion = 10;
const persW = 1.0;

const burnFactor = persW * metabolismConstantMale * permillageConvertion;

const calcCurrentPermillage = (permillage: number, lastBite?: Date, now = new Date()): number => {
  if (lastBite) {
    return Math.max(0, permillage - burnFactor * dayjs(now).diff(lastBite, 'seconds'));
  }
  return 0;
};

const getBFactor = (weight = 85.5) =>
  (bodyWater * permillageConvertion * swedishMultiplier) / (bodyWaterConstantMale * weight);

const calcTimeTillSober = (currentPct: number) => currentPct / burnFactor;

const addUserToChannel = async (userToken: string) => {
  const usersChannels = await slackClient.users.conversations({
    token: userToken,
    types: 'public_channel,private_channel',
  });
  if (!usersChannels.channels?.find((c) => c.id === channelId)) {
    const { ok } = await slackClient.conversations.join({
      token: userToken,
      channel: channelId,
    });
    if (!ok) {
      throw new Error('Could not join to slack channel');
    }
  }
};

export const getUserStatus = async (userId: string, at?: Date): Promise<Binge> => {
  const prevBite = await getPreviousBite(userId, at);
  if (prevBite) {
    const { permillage, ts } = prevBite;
    const currentPermillage = calcCurrentPermillage(permillage, ts, at);
    const bingeStart = await getLastBingeStart(userId);
    const timeTillSober = calcTimeTillSober(currentPermillage);
    return {
      permillage: currentPermillage,
      lastBite: ts,
      bingeStart,
      timeTillSober,
    };
  }

  return {
    permillage: 0,
  };
};

const updateNextBite = async (prevBite: Promise<Bite>, bite: Bite): Promise<Bite> => {
  const { permillage, ts } = await prevBite;
  const currentPermillage = calcCurrentPermillage(permillage, ts, bite.ts);
  const nextPermillage = currentPermillage + getBFactor(bite.weight) * bite.portion;
  const nextType = currentPermillage > 0 && permillage > 0 ? 'p' : 'ep';
  await updatePuraisu(bite.id, nextType, nextPermillage);
  return { ...bite, permillage: nextPermillage };
};

export const calculateBites = async (): Promise<void> => {
  const megafauna = await getMegafauna();
  for (const biter of megafauna) {
    console.log('Populating old permillages for user', biter.displayName);
    const bites = await getBites(biter.biter);
    await bites.reduce(
      async (prevBite, nextBite, currentIndex) => {
        const nb = await updateNextBite(prevBite, nextBite);
        console.log(`${currentIndex + 1}/${bites.length}: ${nb.permillage}`);
        return nb;
      },
      Promise.resolve({
        id: -999,
        ts: new Date(0),
        permillage: 0,
        portion: 0,
        weight: 0,
      }),
    );
  }
};

export const submitBite = async (user: SlackSession, biteInfo: BiteInfo): Promise<Binge> => {
  const { id: userId, userToken } = user;
  const {
    content,
    info,
    coordinates: coords,
    postfestum,
    pftime = 0,
    tzOffset,
    portion,
    location: loc,
    customLocation,
  } = biteInfo;

  const ts = (postfestum ? dayjs().subtract(pftime, 'minutes') : dayjs()).toDate();
  const origPermillage = (await getUserStatus(userId, ts)).permillage;
  const type = origPermillage > 0 ? 'p' : 'ep';
  const location = loc === 'else' ? customLocation ?? '' : loc;
  const coordinates = !postfestum ? coords ?? null : null;

  const weight = await getWeight(userId);
  const currentPermillage = origPermillage + getBFactor(weight) * portion;

  const bite = await insertPuraisu(
    userId,
    type,
    content,
    location ?? 'Terra incognita',
    info,
    postfestum,
    coordinates,
    portion,
    currentPermillage,
    ts,
    weight,
    tzOffset,
  );

  if (postfestum) {
    const bitesAfter = await getBites(userId, ts);
    await bitesAfter.reduce(
      async (prevBite, nextBite) => updateNextBite(prevBite, nextBite),
      Promise.resolve(bite),
    );
  }

  const binge = await getUserStatus(userId);

  await addUserToChannel(userToken);
  const alcoholW = Math.round(portion * 12);
  let coordLoc = '';
  if (coordinates) {
    const { latitude, longitude, accuracy } = coordinates;
    const gmapUrl = `https://www.google.com/maps/place/${latitude},${longitude}`;
    coordLoc = ` (<${gmapUrl}|${latitude.toFixed(4)},${longitude.toFixed(
      4,
    )}>\u00A0±${accuracy.toFixed(0)}m)`;
  }
  const typePostfix = postfestum ? `-postfestum (${pftime} min sitten)` : '';
  const slackMsg = `${type}${typePostfix};${content}\u00A0(${alcoholW}\u00A0g);${location}${coordLoc};${currentPermillage
    .toFixed(2)
    .replace('.', ',')}\u00A0‰${info ? ';' + info : ''}`;
  await slackClient.chat.postMessage({
    channel: channelId,
    text: `\u{200B}${slackMsg}`,
    unfurl_links: false,
    token: userToken,
  });

  return binge;
};