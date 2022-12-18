import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { AppInfo, Binge, BiteInfo } from '../types/common';
import { getStatus, submitBite } from '../utils/api';
import { Alert } from './Alert';
import { BiteForm } from './BiteForm';
import { Heading } from './Heading';
import Image from 'next/image';
import Link from 'next/link';
import { biteDoneContainer, frontPageContainer, loadingContainer } from './FrontPage.css';
import { useRouter } from 'next/navigation';

interface FpProps {
  info: AppInfo;
  initialUserStatus: Binge;
}

export const FrontPage: FC<FpProps> = ({ info, initialUserStatus }) => {
  const { realName, avatar } = info;
  const [permillage, setPermillage] = useState(initialUserStatus.permillage);
  const [bingeStart, setBingeStart] = useState<Date | undefined>(initialUserStatus.bingeStart);
  const [lastBite, setLastBite] = useState<Date | undefined>(initialUserStatus.lastBite);
  const [timeTillSober, setTimeTillSober] = useState<number | undefined>(
    initialUserStatus.timeTillSober,
  );
  const [loading, setLoading] = useState(false);
  const [biteDone, setBiteDone] = useState(false);
  const biteDoneRef = useRef<HTMLDivElement>(null);
  const [lastContent, setLastContent] = useState('');
  const [error, setError] = useState<string>();

  const { refresh } = useRouter();

  const setUserStatus = useCallback(async (statusPromise: Promise<Binge>) => {
    const userStatus = await statusPromise;
    setPermillage(userStatus.permillage);
    setLastBite(userStatus.lastBite);
    setBingeStart(userStatus.bingeStart);
    setTimeTillSober(userStatus.timeTillSober);
  }, []);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setUserStatus(getStatus()).catch((reason) => {
        setError((reason as Error).message || 'No mikähän tässä nyt on');
      });
    }, 60000);
    return () => {
      clearInterval(intervalId);
    };
  }, [setUserStatus]);

  const handleSubmit = async (data: BiteInfo) => {
    try {
      setLoading(true);
      setBiteDone(false);
      await setUserStatus(submitBite(data));
      setBiteDone(true);
      setLastContent(data.content);
      setError(undefined);
    } catch (reason) {
      console.error(reason);
      setPermillage(0);
      setLastBite(undefined);
      setError((reason as Error).message || 'No mikähän tässä nyt on');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const elem = biteDoneRef.current;
    if (biteDone && elem) {
      const transitionListener = () => setBiteDone(false);
      setTimeout(() => (elem.style.opacity = '0'));
      elem.addEventListener('transitionend', transitionListener, true);
      return () => {
        elem.removeEventListener('transitionend', transitionListener, true);
      };
    }
  }, [biteDone]);

  return (
    <div className={frontPageContainer}>
      <Heading
        realName={realName}
        permillage={permillage}
        timeTillSober={timeTillSober}
        bingeStart={bingeStart}
        lastBite={lastBite}
        avatar={avatar}
      />

      {loading && (
        <div className={loadingContainer}>
          <Image src="/loading.gif" alt="Loading" width={40} height={40} />
        </div>
      )}

      {biteDone && (
        <Alert variant="success" ref={biteDoneRef} className={biteDoneContainer}>
          <>
            Toppen! Raportoit puraisun &quot;{lastContent}&quot;, jonka juotuasi olet noin{' '}
            {permillage.toFixed(2)} promillen humalassa.
            <br />
            {permillage > 0.5 && <strong>Muista jättää ajaminen muille!</strong>}
          </>
        </Alert>
      )}

      {error && (
        <Alert variant="danger">
          Viduiks män, syy: &quot;{error}&quot;.{' '}
          <Link href="/" onClick={refresh}>
            Verestä sivu
          </Link>{' '}
          ja kokeile uudestaan, tai jotain
        </Alert>
      )}

      <BiteForm submitBite={handleSubmit} />
    </div>
  );
};
