import { FC, useEffect, useRef, useState } from 'react';
import { AppInfo, Binge, BiteInfo } from '../types/common';
import { submitBite } from '../utils/api';
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

export const FrontPage: FC<FpProps> = ({
  info,
  initialUserStatus: { permillage, bingeStart, lastBite, timeTillSober },
}) => {
  const { realName, avatar } = info;
  const [loading, setLoading] = useState(false);
  const [biteDone, setBiteDone] = useState(false);
  const biteDoneRef = useRef<HTMLDivElement>(null);
  const [lastContent, setLastContent] = useState('');
  const [error, setError] = useState<string>();

  const { refresh, replace } = useRouter();

  const handleSubmit = async (data: BiteInfo) => {
    try {
      setLoading(true);
      setBiteDone(false);
      await submitBite(data);
      setBiteDone(true);
      setLastContent(data.content);
      setError(undefined);
      await replace('/');
      // await setUserStatus(submitBite(data));
    } catch (reason) {
      console.error(reason);
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
