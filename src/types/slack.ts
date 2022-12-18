import { TokenSetParameters } from 'openid-client';
import { Profile, Session } from 'next-auth';
import { JWT } from 'next-auth/jwt';

export interface AuthedUser {
  id: string;
  scope: string;
  access_token: string;
  token_type: 'user';
}

export interface AuthResults extends TokenSetParameters {
  app_id: string;
  authed_user: AuthedUser;
  bot_user_ud: string;
  team: { id: string; name: string };
}

export interface SlackProfile extends Profile {
  botToken: string;
  userToken: string;
  id: string;
}

export interface SlackSession extends Session {
  userToken: string;
  botToken: string;
  id: string;
}

export interface SlackToken extends JWT {
  userToken: string;
  botToken: string;
  id: string;
}
