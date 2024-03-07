'use client';
import { type FC, useCallback, useEffect, useReducer, useState } from 'react';
import type { AppInfo, Binge, Bite, BiteInfo } from '../types/common';
import { Alert } from './Alert';
import { BiteForm } from './BiteForm';
import Image from 'next/image';
import { frontPageContainer, loadingContainer } from './FrontPage.css';
import { BiteDoneMessage } from './BiteDoneMessage';
import { Heading } from './Heading';
import { getLastBiteAction, submitBiteAction } from '../app/actions';
import { lastBiteToBinge } from '../utils/client';

interface FpProps {
  info: AppInfo;
  lastBite: Bite | null;
}

type BingeAction =
  | {
      type: 'binge';
      payload: Binge;
    }
  | { type: 'bite'; payload: Bite | null };

const bingeReducer = (_: Binge, action: BingeAction): Binge => {
  switch (action.type) {
    case 'binge':
      return action.payload;
    case 'bite':
      return lastBiteToBinge(action.payload);
  }
};

export const FrontPage: FC<FpProps> = ({ info, lastBite }) => {
  const [binge, dispatch] = useReducer(bingeReducer, lastBite, lastBiteToBinge);
  const [loading, setLoading] = useState(false);
  const [biteDone, setBiteDone] = useState(false);
  const [lastContent, setLastContent] = useState('');
  const [error, setError] = useState<string>();

  const biteAction = useCallback((payload: Bite | null) => {
    dispatch({ type: 'bite', payload });
  }, []);

  const bingeAction = useCallback((payload: Binge) => {
    dispatch({ type: 'binge', payload });
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      void getLastBiteAction().then(biteAction);
    }, 30000);
    return () => {
      interval && clearInterval(interval);
    };
  });

  const { permillage } = binge;

  const handleSubmit = async (data: BiteInfo) => {
    try {
      setLoading(true);
      setBiteDone(false);
      bingeAction(await submitBiteAction(data));
      setBiteDone(true);
      setLastContent(data.content);
      setError(undefined);
    } catch (reason) {
      console.error(reason);
      setError((reason as Error).message || 'No mikähän tässä nyt on');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={frontPageContainer}>
      <Heading info={info} binge={binge} />

      {loading && (
        <div className={loadingContainer}>
          <Image src="/loading.gif" alt="Loading" width={40} height={40} />
        </div>
      )}

      <BiteDoneMessage
        biteDone={biteDone}
        setBiteDone={setBiteDone}
        permillage={permillage}
        lastContent={lastContent}
      />

      {error && (
        <Alert variant="danger">
          Viduiks män, syy: &quot;{error}&quot;. Verestä sivu ja kokeile uudestaan, tai jotain
        </Alert>
      )}

      <BiteForm submitBite={handleSubmit} />
    </div>
  );
};
