'use client';
import { type FC, useState } from 'react';
import { type AppInfo, type Binge, type BiteInfo } from '../types/common';
import { submitBite } from '../utils/api';
import { Alert } from './Alert';
import { BiteForm } from './BiteForm';
import { Heading } from './Heading';
import Image from 'next/image';
import Link from 'next/link';
import { frontPageContainer, loadingContainer } from './FrontPage.css';
import { usePathname, useRouter } from 'next/navigation';
import { BiteDoneMessage } from './BiteDoneMessage';

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
  const [lastContent, setLastContent] = useState('');
  const [error, setError] = useState<string>();

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const { refresh, replace } = useRouter();
  const path = usePathname();

  const handleSubmit = async (data: BiteInfo) => {
    try {
      setLoading(true);
      setBiteDone(false);
      await submitBite(data);
      setBiteDone(true);
      setLastContent(data.content);
      setError(undefined);
      replace(path ?? '/');
    } catch (reason) {
      console.error(reason);
      setError((reason as Error).message || 'No mikähän tässä nyt on');
    } finally {
      setLoading(false);
    }
  };

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

      <BiteDoneMessage
        biteDone={biteDone}
        setBiteDone={setBiteDone}
        permillage={permillage}
        lastContent={lastContent}
      />

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
