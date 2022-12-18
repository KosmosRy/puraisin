import SlackProvider from '../../../providers/slack';
import NextAuth, { AuthOptions } from 'next-auth';
import { AuthedUser, SlackSession, SlackToken } from '../../../types/slack';
import config from '../../../utils/config';

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
        token.id = id;
        token.botToken = account.access_token;
      }
      return token;
    },
    async session({ session, token }) {
      const { userToken, botToken, id } = token as SlackToken;
      const slackSession = session as SlackSession;
      slackSession.userToken = userToken;
      slackSession.botToken = botToken;
      slackSession.id = id;
      return slackSession;
    },
  },
};

export default NextAuth(authOptions);
