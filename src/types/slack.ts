import { type Session } from 'next-auth';
import { type JWT } from 'next-auth/jwt';

export interface AuthedUser {
  id: string;
  scope: string;
  access_token: string;
  token_type: 'user';
}

export interface SlackSession extends Session {
  userToken: string;
  botToken: string;
  id: string;
  user: {
    name: string;
    image: string;
  };
}

export interface SlackToken extends JWT {
  userToken: string;
  botToken: string;
  sub: string;
  profileUpdated?: string;
}
