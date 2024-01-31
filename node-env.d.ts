declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      CHANNEL_ID: string;
      CLIENT_ID: string;
      CLIENT_SECRET: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_NAME: string;
      DB_USER: string;
      DB_PASSWORD: string;
      SUPPRESS_SLACK_REPORT?: string;
    }
  }
}

export {};
