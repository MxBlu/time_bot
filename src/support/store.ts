import { Dependency, Logger } from 'bot-framework';
import IORedis, { Redis } from 'ioredis';

const REDIS_PREFIX = "timebot_";

/*
  API class to interact with underlying storage implementation
  In this case, Redis

  Schema:
    timebot_<guildid>_<userid> = timezone string set for user
*/
class StoreImpl {
  // Redis client
  rclient: Redis;
  // General logger
  logger: Logger;

  constructor () {
    this.logger = new Logger("Store");
  }

  // Create client and register handlers
  public init(host: string, port: number): void {
    this.rclient = new IORedis(port, host);

    this.rclient.on('error', (err) => {
      this.logger.error(`Redis error: ${err}`);
    });

    this.rclient.once('connect', () => {
      this.logger.info('Redis connected');
      StoreDependency.ready();
    });
  }
  
  public async getTimeZone(guildId: string, userId: string): Promise<string> {
    return await this.rclient.get(REDIS_PREFIX + `${guildId}_${userId}`);
  }

  public async setTimeZone(guildId: string, userId: string, timezone: string): Promise<void> {
    await this.rclient.set(REDIS_PREFIX + `${guildId}_${userId}`, timezone);
  }
}

export const Store = new StoreImpl();
export const StoreDependency = new Dependency("Store");