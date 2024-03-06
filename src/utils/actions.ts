'use server';

import {
  addBiter,
  getBites,
  getLastBingeStart,
  getPreviousBite,
  getWeight,
  insertPuraisu,
  updatePuraisu,
} from './db';
import { slackClient } from './slack';
import type { Binge, BiteInfo } from '../types/common';
import type { UsersProfileGetResponse } from '@slack/web-api';
import { auth, isSlackSession } from './auth';
import { subMinutes } from 'date-fns';
import { revalidateTag, unstable_cache } from 'next/cache';
import config from './config';
import {
  type Bite,
  bodyWater,
  bodyWaterConstantMale,
  type CachedBite,
  calcCurrentPermillage,
  calcTimeTillSober,
  permillageConvertion,
  swedishMultiplier,
} from './lib';

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

export const getProfile = async (
  userId: string,
  token: string,
): Promise<UsersProfileGetResponse['profile']> =>
  slackClient.users.profile
    .get({
      token,
      user: userId,
    })
    .then((res) => res.profile);

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

export const cachedLastBite = (id: string): (() => Promise<CachedBite | null>) =>
  unstable_cache(
    async () => {
      const prevBite = await getPreviousBite(id);

      if (!prevBite) {
        return null;
      }

      return {
        ...prevBite,
        ts: prevBite.ts.toISOString(),
        bingeStart: (await getLastBingeStart(id))?.toISOString(),
      };
    },
    [id],
    { tags: [`userStatus-${id}`] },
  );

export const getLastBite = async (): Promise<CachedBite | null> => {
  const session = await auth();
  if (!isSlackSession(session)) {
    return null;
  }
  return cachedLastBite(session.id)();
};

const updateNextBite = async (prevBite: Promise<Bite>, bite: Bite): Promise<Bite> => {
  const { permillage, ts } = await prevBite;
  const currentPermillage = calcCurrentPermillage(permillage, ts, bite.ts);
  const nextPermillage = currentPermillage + getBFactor(bite.weight) * bite.portion;
  const nextType = currentPermillage > 0 && permillage > 0 ? 'p' : 'ep';
  await updatePuraisu(bite.id, nextType, nextPermillage);
  return { ...bite, permillage: nextPermillage };
};

export const submitBite = async (biteInfo: BiteInfo): Promise<Binge> => {
  const session = await auth();
  if (!isSlackSession(session)) {
    throw new Error('Not authenticated');
  }
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

  revalidateTag(`userStatus-${userId}`);

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
