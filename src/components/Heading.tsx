import { formatDistanceToNow, addSeconds } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';
import { fi } from 'date-fns/locale';
import { type FC } from 'react';
import Image from 'next/image';
import {
  headingContainer,
  statusList,
  statusListItem,
  statusRow,
  title,
  userInfo,
  userRow,
} from './Heading.css';
import { SignOutButton } from './SignOutButton';
import type { AppInfo, Binge } from '../types/common';

interface Props {
  info: AppInfo;
  binge: Binge;
}

const formatLastBite = (lastBite: Date) =>
  formatInTimeZone(lastBite, 'Europe/Helsinki', "eeeeee, d.M.yy 'klo' H:mm xxx", { locale: fi });
const formatTimeTillSober = (timeTillSober: number) => {
  if (timeTillSober > 0) {
    return formatDistanceToNow(addSeconds(new Date(), timeTillSober), { locale: fi });
  } else {
    return '-';
  }
};
const formatTimeToNow = (from?: Date) => {
  if (from) {
    return formatDistanceToNow(from, { locale: fi });
  } else {
    return '-';
  }
};

export const Heading: FC<Props> = ({
  info: { realName, avatar },
  binge: { lastBite, permillage, timeTillSober, bingeStart },
}) => {
  return (
    <div className={headingContainer}>
      <div className={userRow}>
        <div>
          <h3 className={title.h3}>Pikapuraisin</h3>
          <h4 className={title.h4}>{realName}, vanha Homo Sapiens!</h4>
        </div>
        <div className={userInfo}>
          <Image src={avatar} title={realName} alt={realName} width={48} height={48} />
          <SignOutButton />
        </div>
      </div>
      <div className={statusRow}>
        <ul className={statusList}>
          {lastBite && (
            <li className={statusListItem}>
              <b>Viime puraisu:</b> {formatLastBite(lastBite)}
            </li>
          )}
          {permillage > 0 && (
            <>
              <li className={statusListItem}>
                <b>Promillemäärä:</b> {permillage.toFixed(2).replace('.', ',')}
                {'\u00A0'}‰
              </li>
              <li className={statusListItem}>
                <b>Rännin pituus:</b> {formatTimeToNow(bingeStart)}
              </li>
              <li className={statusListItem}>
                <b>Selviämisarvio:</b> {formatTimeTillSober(timeTillSober ?? 0)}
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  );
};
