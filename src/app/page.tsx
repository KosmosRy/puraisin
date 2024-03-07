import { type FC } from 'react';
import { auth, isSlackSession } from '../utils/auth';
import { redirect } from 'next/navigation';
import { appContainer, copyright } from './page.css';
import { FrontPage } from '../components/FrontPage';
import { getYear } from 'date-fns';
import { cachedLastBite } from '../utils/actions';

const Page: FC = async () => {
  const session = await auth();

  if (!isSlackSession(session)) {
    return redirect('/auth/signin');
  }

  const appInfo = {
    realName: session.user?.name ?? 'Anonyymi',
    avatar: session.user?.image ?? '/favicon.png',
  };

  const lastBite = await cachedLastBite(session.id)();

  return (
    <div className={appContainer}>
      <FrontPage info={appInfo} lastBite={lastBite} />
      <footer className={copyright}>&copy; Apin Heristäjät {getYear(new Date())}</footer>
    </div>
  );
};

export default Page;
