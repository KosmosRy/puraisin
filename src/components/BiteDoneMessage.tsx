'use client';
import { FC, useEffect, useRef } from 'react';
import { Alert } from './Alert';
import { biteDoneContainer } from './FrontPage.css';

interface Props {
  biteDone: boolean;
  setBiteDone: (biteDone: boolean) => void;
  lastContent: string;
  permillage: number;
}

export const BiteDoneMessage: FC<Props> = ({ biteDone, setBiteDone, lastContent, permillage }) => {
  const biteDoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const elem = biteDoneRef.current;
    if (biteDone && elem) {
      const transitionListener = () => {
        setBiteDone(false);
      };
      setTimeout(() => (elem.style.opacity = '0'));
      elem.addEventListener('transitionend', transitionListener, true);
      return () => {
        elem.removeEventListener('transitionend', transitionListener, true);
      };
    }
  }, [biteDone]);

  if (biteDone) {
    return (
      <Alert variant="success" ref={biteDoneRef} className={biteDoneContainer}>
        <>
          Toppen! Raportoit puraisun &quot;{lastContent}&quot;, jonka juotuasi olet noin{' '}
          {permillage.toFixed(2)} promillen humalassa.
          <br />
          {permillage > 0.5 && <strong>Muista jättää ajaminen muille!</strong>}
        </>
      </Alert>
    );
  }

  return null;
};
