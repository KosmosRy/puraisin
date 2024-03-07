import {
  addBiter,
  getBites,
  getLastBingeStart,
  getPreviousBite,
  getWeight,
  insertPuraisu,
  updatePuraisu,
} from './db';
import { type Binge, type Bite, type BiteInfo } from '../types/common';
import { subMinutes } from 'date-fns';
import { revalidateTag } from 'next/cache';
import { lastBiteCacheTag } from './cache';
import config from './config';
import { slackClient } from './slack';
import { calcCurrentPermillage, calcTimeTillSober } from './client';
import {
  bodyWater,
  bodyWaterConstantMale,
  permillageConvertion,
  swedishMultiplier,
} from './constants';
import { type SlackSession } from '../types/slack';

export const getLastBite = async (userId: string): Promise<Bite | null> => {
  const prevBite = await getPreviousBite(userId);

  if (!prevBite) {
    return null;
  }

  return {
    ...prevBite,
    bingeStart: await getLastBingeStart(userId),
  };
};

const { channelId } = config.slack;

const getBFactor = (weight = 85.5) =>
  (bodyWater * permillageConvertion * swedishMultiplier) / (bodyWaterConstantMale * weight);

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

const getBinge = async (userId: string, at?: Date): Promise<Binge> => {
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

export const submitBite = async (biteInfo: BiteInfo, session: SlackSession): Promise<Binge> => {
  const {
    id: userId,
    userToken,
    user: { name },
  } = session;
  await addBiter(userId, name);
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

  const ts = postfestum ? subMinutes(new Date(), pftime) : new Date();
  const origPermillage = (await getBinge(userId, ts)).permillage;
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

  const binge = await getBinge(userId);

  revalidateTag(lastBiteCacheTag(userId));

  if (!config.slack.suppressReport) {
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
  }

  return binge;
};
