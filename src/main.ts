import * as dotenv from 'dotenv';
dotenv.config();

import { Logger } from 'bot-framework';
import { TimeBot } from './modules/bot.js';
import { Store } from './support/store.js';

// Main level logger
const logger = new Logger("Server");

// Redis DB
const redisHost = process.env.REDIS_HOST;
const redisPort = Number(process.env.REDIS_PORT);
Store.init(redisHost, redisPort);

// Bot services
const discordToken = process.env.DISCORD_TOKEN;
TimeBot.init(discordToken);

// Set logger to handle global rejections
logger.registerAsGlobal();
logger.info(`Server started`);