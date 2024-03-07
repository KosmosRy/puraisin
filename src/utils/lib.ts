import { differenceInSeconds, parseISO } from 'date-fns';
import { type Binge } from '../types/common';

export interface Bite {
  id: number;
  ts: Date;
  permillage: number;
  portion: number;
  weight: number;
  bingeStart?: Date;
}

export interface CachedBite extends Pick<Bite, 'permillage' | 'portion' | 'weight'> {
  ts: string;
  bingeStart?: string;
}

export interface Biter {
  biter: string;
  weight: number;
  displayName: string;
}

export const bodyWater = 0.806;
export const bodyWaterConstantMale = 0.58;
export const swedishMultiplier = 1.2;
export const permillageConvertion = 10;

const metabolismConstantMale = 0.015 / 3600;
const persW = 1.0;
const burnFactor = persW * metabolismConstantMale * permillageConvertion;

export const calcCurrentPermillage = (
  permillage: number,
  lastBite?: Date,
  now = new Date(),
): number => {
  if (lastBite) {
    return Math.max(0, permillage - burnFactor * differenceInSeconds(now, lastBite));
  }
  return 0;
};

export const calcTimeTillSober = (currentPct: number): number => currentPct / burnFactor;

const toDate = (date: Date | string): Date => (date instanceof Date ? date : parseISO(date));

export const lastBiteToBinge = (lastBite: Bite | CachedBite | null): Binge => {
  if (!lastBite) {
    return { permillage: 0 };
  }
  const ts = toDate(lastBite.ts);
  const bingeStart = lastBite.bingeStart ? toDate(lastBite.bingeStart) : undefined;
  const currentPermillage = calcCurrentPermillage(lastBite.permillage, ts);
  const timeTillSober = calcTimeTillSober(currentPermillage);
  return {
    permillage: currentPermillage,
    lastBite: ts,
    bingeStart,
    timeTillSober,
  };
};
