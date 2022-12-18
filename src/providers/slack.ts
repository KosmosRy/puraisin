import { OAuthConfig, OAuthUserConfig } from 'next-auth/providers';
import { AuthResults, SlackProfile } from '../types/slack';
import { TokenSetParameters } from 'openid-client';

export default function Slack<P extends SlackProfile>(options: OAuthUserConfig<P>): OAuthConfig<P> {
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
      request({ tokens }: { tokens: TokenSetParameters }): SlackProfile {
        const user = (tokens as AuthResults).authed_user;
        return {
          botToken: tokens.access_token ?? '',
          userToken: user.access_token,
          id: user.id,
        };
      },
    },

    profile(profile) {
      return profile;
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
