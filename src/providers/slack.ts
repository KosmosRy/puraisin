import { OAuthConfig, OAuthUserConfig } from 'next-auth/providers';
import { AuthedUser } from '../types/slack';
import { Profile, TokenSet } from 'next-auth';

export default function Slack(options: OAuthUserConfig<Profile>): OAuthConfig<Profile> {
  return {
    id: 'slack',
    name: 'Slack',
    type: 'oauth',
    authorization: {
      url: 'https://slack.com/oauth/v2/authorize',
      params: {
        scope: 'users.profile:read',
        user_scope: 'chat:write,channels:read,channels:write,groups:read',
      },
    },
    token: 'https://slack.com/api/oauth.v2.access',
    userinfo: {
      request({ tokens }: { tokens: TokenSet }) {
        const user = tokens.authed_user as AuthedUser;
        return {
          sub: user.id,
        };
      },
    },

    profile(profile) {
      return {
        id: profile.sub ?? '',
      };
    },

    style: {
      logo: 'https://raw.githubusercontent.com/nextauthjs/next-auth/main/packages/next-auth/provider-logos/slack.svg',
      logoDark:
        'https://raw.githubusercontent.com/nextauthjs/next-auth/main/packages/next-auth/provider-logos/slack.svg',
      bg: '#fff',
      text: '#000',
      bgDark: '#000',
      textDark: '#fff',
    },
    options,
  };
}
