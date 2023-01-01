import 'dayjs/locale/fi';
import Head from 'next/head';
import Signin from '../components/Signin';
import { GetServerSideProps, NextPage } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './api/auth/[...nextauth]';
import { useEffect } from 'react';
import App from '../components/App';
import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import relativeTime from 'dayjs/plugin/relativeTime';
import { AppInfo, Binge } from '../types/common';
import { getUserStatus } from '../utils/lib';
import { isSlackSession } from '../utils/session';
import { useRouter } from 'next/router';

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
  const session = await unstable_getServerSession(req, res, authOptions);
  if (isSlackSession(session)) {
    const { id, user } = session;
    const userStatus = await getUserStatus(id);

    return {
      props: {
        appProps: {
          appInfo: {
            realName: user.name,
            avatar: user.image,
          },
          userStatus,
        },
      },
    };
  }

  return {
    props: {},
  };
};

const Index: NextPage<AppProps> = ({ appProps }) => {
  const { replace, asPath } = useRouter();

  useEffect(() => {
    if (appProps) {
      const intervalId = setInterval(() => {
        void replace(asPath, undefined, {
          scroll: false,
        });
      }, 30000);
      return () => {
        clearInterval(intervalId);
      };
    }
  }, [appProps, asPath, replace]);

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
