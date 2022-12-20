import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Timezone from 'dayjs/plugin/timezone';

export interface SlackConfig {
  botToken: string;
  clientId: string;
  clientSecret: string;
  channelId: string;
}

export interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface Config {
  slack: SlackConfig;
  db: DbConfig;
}

const parseNumber = (value: string) => {
  const numVal = parseInt(value, 10);
  if (isNaN(numVal)) {
    throw new Error(`Invalid value (${value}) for env variable: number expected`);
  }
  return numVal;
};

dayjs.extend(utc);
dayjs.extend(Timezone);
dayjs.tz.setDefault('Europe/Helsinki');

const config: Config = {
  slack: {
    botToken: process.env.BOT_TOKEN,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    channelId: process.env.CHANNEL_ID,
  },
  db: {
    host: process.env.DB_HOST,
    port: parseNumber(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
} as const;

export default config;
