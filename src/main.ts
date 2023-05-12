import * as dotenv from 'dotenv';
dotenv.config();

import { Logger } from 'bot-framework';

// Main level logger
const logger = new Logger("Server");

// Set logger to handle global rejections
logger.registerAsGlobal();
logger.info(`Server started`);