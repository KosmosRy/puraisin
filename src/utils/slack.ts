import { WebClient } from '@slack/web-api';

export const slackClient = new WebClient(process.env.BOT_TOKEN);
