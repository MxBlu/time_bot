import { Logger } from "bot-framework";
import Fuse from "fuse.js";

class TimezonesImpl {
  logger: Logger;

  fuse: Fuse<string>;

  constructor() {
    this.logger = new Logger("Timezones");
    this.init();
  }

  private init() {
    this.fuse = new Fuse(Intl.supportedValuesOf('timeZone'));
  }

  public search(query: string): string[] {
    return this.fuse.search(query).map(r => r.item);
  }
}

export const Timezones = new TimezonesImpl();