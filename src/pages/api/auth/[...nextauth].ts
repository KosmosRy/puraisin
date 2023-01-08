import SlackProvider from '../../../providers/slack';
import NextAuth, { AuthOptions } from 'next-auth';
import { AuthedUser, SlackSession, SlackToken } from '../../../types/slack';
import config from '../../../utils/config';
import { getProfile } from '../../../utils/lib';
import { JWT } from 'next-auth/jwt';
import { addHours, isAfter, parseJSON } from 'date-fns';

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

export const authOptions: AuthOptions = {
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
};

export default NextAuth(authOptions);
