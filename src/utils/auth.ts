import type { JWT } from 'next-auth/jwt';
import { addHours, isAfter, parseJSON } from 'date-fns';
import { getServerSession, type NextAuthOptions, type Session } from 'next-auth';
import SlackProvider from '../providers/slack';
import config from './config';
import type { AuthedUser, SlackSession, SlackToken } from '../types/slack';
import { type GetServerSidePropsContext } from 'next';
import { type NextApiRequest, type NextApiResponse } from 'next/dist/shared/lib/utils';
import { getProfile } from './actions';

const addProfileToToken = async (id: string, accessToken: string, token: JWT) => {
  const profile = await getProfile(id, accessToken);
  if (profile) {
    const { display_name: displayName, real_name: realName, image_512: picture } = profile;
    token.name = displayName ?? realName;
    token.picture = picture;
    token.profileUpdated = new Date().toISOString();
  }
  return token;
};

const profileExpired = (profileUpdated?: string) =>
  !profileUpdated || isAfter(new Date(), addHours(parseJSON(profileUpdated), 1));

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    SlackProvider({
      clientId: config.slack.clientId,
      clientSecret: config.slack.clientSecret,
    }),
  ],
  session: {
    maxAge: 24 * 60 * 60 * 365,
  },
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        const { access_token: accessToken, id } = account.authed_user as AuthedUser;
        token.userToken = accessToken;
        token.sub = id;
        token.botToken = account.access_token;
        await addProfileToToken(id, account.access_token ?? '', token);
      } else {
        const slackToken = token as SlackToken;
        if (profileExpired(slackToken.profileUpdated)) {
          await addProfileToToken(slackToken.sub, slackToken.botToken, token);
        }
      }
      return token;
    },
    async session({ session, token }) {
      const { userToken, botToken, sub } = token as SlackToken;
      const slackSession = session as SlackSession;
      slackSession.userToken = userToken;
      slackSession.botToken = botToken;
      slackSession.id = sub;
      return slackSession;
    },
  },
} satisfies NextAuthOptions;

export const auth = async (
  ...args:
    | [GetServerSidePropsContext['req'], GetServerSidePropsContext['res']]
    | [NextApiRequest, NextApiResponse]
    | []
): Promise<Session | null> => getServerSession(...args, authOptions);

export const isSlackSession = (session?: Session | null): session is SlackSession => {
  if (session) {
    const { id, botToken } = session as SlackSession;
    return !!id && !!botToken;
  }
  return false;
};
