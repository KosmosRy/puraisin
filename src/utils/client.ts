import type { Binge, Bite } from '../types/common';
import { differenceInSeconds } from 'date-fns';
import { burnFactor } from './constants';

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

export const lastBiteToBinge = (lastBite: Bite | null): Binge => {
  if (!lastBite) {
    return { permillage: 0 };
  }
  const ts = lastBite.ts;
  const bingeStart = lastBite.bingeStart;
  const currentPermillage = calcCurrentPermillage(lastBite.permillage, ts);
  const timeTillSober = calcTimeTillSober(currentPermillage);
  return {
    permillage: currentPermillage,
    lastBite: ts,
    bingeStart,
    timeTillSober,
  };
};
