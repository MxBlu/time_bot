import { DiscordBot } from "bot-framework";
import { StoreDependency } from "../support/store.js";

export class TimeBotImpl extends DiscordBot {
  constructor() {
    super("TimeBot");
  }

  public async init(discordToken: string): Promise<void> {
    // Wait on Store to be ready
    await StoreDependency.await();

    super.init(discordToken);
  }

  public loadProviders(): void {
    // TODO: Add command providers here
  }

  public getHelpMessage(): string {
    return "Time bot - Provides the current time for people across different timezones";
  }
}

export const TimeBot = new TimeBotImpl();
