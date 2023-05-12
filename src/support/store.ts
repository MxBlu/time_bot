import { Dependency, Logger } from 'bot-framework';
import IORedis, { Redis } from 'ioredis';

/*
  API class to interact with underlying storage implementation
  In this case, Redis

  Schema:
  TODO: Write up a schema. Pls namespace is with timebot_* cause this is a shared Redis
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
 
}

export const Store = new StoreImpl();
export const StoreDependency = new Dependency("Store");