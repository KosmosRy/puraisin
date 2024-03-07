'use server';
import { auth, isSlackSession } from '../utils/auth';
import { getCachedLastBite } from '../utils/cache';
import { type BiteInfo } from '../types/common';
import { submitBite } from '../utils/server';

const checkAuth = async () => {
  const session = await auth();
  if (!isSlackSession(session)) {
    throw new Error('Not authenticated');
  }
  return session;
};

export const getLastBiteAction = async () => {
  const session = await checkAuth();
  return getCachedLastBite(session.id);
};

export const submitBiteAction = async (biteInfo: BiteInfo) => {
  const session = await checkAuth();
  return submitBite(biteInfo, session);
};
