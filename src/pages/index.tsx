import 'dayjs/locale/fi';
import Head from 'next/head';
import Signin from '../components/Signin';
import { GetServerSideProps } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { slackClient } from '../utils/slack';
import { FC } from 'react';
import App from '../components/App';
import { addBiter } from '../utils/db';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Timezone from 'dayjs/plugin/timezone';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AppInfo, Binge } from '../types/common';
import { getUserStatus } from '../utils/lib';
import { isSlackSession } from '../utils/session';

dayjs.extend(localizedFormat);
dayjs.extend(relativeTime);
dayjs.locale('fi');

interface AppProps {
  appProps?: {
    appInfo: AppInfo;
    userStatus: Binge;
  };
}

export const getServerSideProps: GetServerSideProps<AppProps> = async ({ req, res }) => {
  dayjs.extend(utc);
  dayjs.extend(Timezone);
  dayjs.tz.setDefault('Europe/Helsinki');

  const session = await unstable_getServerSession(req, res, authOptions);
  if (isSlackSession(session)) {
    const { id, botToken } = session;
    const profile = await slackClient.users.profile
      .get({
        token: botToken,
        user: id,
      })
      .then((res) => res.profile);
    if (profile) {
      const { display_name: displayName, real_name: realName, image_512: picture } = profile;
      const name = displayName ?? realName;
      await addBiter(id, name);
      const userStatus = await getUserStatus(id);

      return {
        props: {
          appProps: {
            appInfo: {
              realName: name ?? '',
              avatar: picture ?? '',
            },
            userStatus,
          },
        },
      };
    }
  }

  return {
    props: {},
  };
};

const Index: FC<AppProps> = ({ appProps }) => {
  return (
    <div>
      <Head>
        <title>Pikapuraisin</title>
      </Head>

      {appProps ? <App appInfo={appProps.appInfo} userStatus={appProps.userStatus} /> : <Signin />}
    </div>
  );
};

export default Index;
