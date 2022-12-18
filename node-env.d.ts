declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BOT_TOKEN: string;
      CHANNEL_ID: string;
      SLACK_CLIENT_ID: string;
      SLACK_CLIENT_SECRET: string;
      DB_HOST: string;
      DB_PORT: string;
      DB_NAME: string;
      DB_USER: string;
      DB_PASSWORD: string;
    }
  }
}

export {};
