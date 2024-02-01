import { FC } from 'react';
import Head from 'next/head';
import App from '../components/App';
import Signin from '../components/Signin';

const Page: FC = () => {
  const appInfo = {
    realName: 'realName',
    avatar: '/favicon.png',
  };
  const userStatus = {
    permillage: 0,
  };

  return (
    <div>
      <Head>
        <title>Pikapuraisin</title>
      </Head>

      {appInfo ? <App appInfo={appInfo} userStatus={userStatus} /> : <Signin />}
    </div>
  );
};

export default Page;
