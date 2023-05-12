import { CommandBuilder, CommandProvider, LogLevel, Logger, sendCmdReply } from "bot-framework";
import { AutocompleteInteraction, SlashCommandBuilder } from "discord.js";
import { ChatInputCommandInteraction } from "discord.js";
import { formatInTimeZone } from "date-fns-tz";
import { Timezones } from "../support/timezones.js";

export class TimezoneCommand implements CommandProvider<ChatInputCommandInteraction> {
  logger: Logger;

  constructor() {
    this.logger = new Logger("TimezoneCommand");
  }

  public provideCommands(): CommandBuilder[] {
    return [
      new SlashCommandBuilder()
        .setName('timezone')
        .setDescription('Gets the time for a timezone or individual')
        .addStringOption(builder => 
          builder.setName('timezone')
            .setDescription('Timezone')
            .setAutocomplete(true)
            .setRequired(true)
        )
    ];
  }

  public provideHelpMessage(): string {
    return "/time (<user>) (<timezone>) - Gets the time for a timezone or individual.";
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const timezone = interaction.options.getString('timezone');

    // Make sure the timezone is a supported one
    if (!Timezones.isValid(timezone)) {
      sendCmdReply(interaction, 'Error: Invalid timezone', this.logger, LogLevel.TRACE);
      return;
    }

    // Generate message to send
    const message = `${timezone} - ` + formatInTimeZone(new Date(), timezone, `EEE do MMM, hh:mm aaa`);
    // Send message
    this.logger.info(`Got time: timezone=${timezone}`);
    interaction.reply(message);
  }

  public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
    const partial = interaction.options.getString('timezone');
    // Get timezones matching the partial query
    let suggestions = Timezones.search(partial);
    // Get the top 5
    suggestions = suggestions.slice(0, 5);

    this.logger.trace(`Generated suggestions: partial=${partial}`);
    // Return the suggestions
    interaction.respond(suggestions.map(s => ({
      name: s,
      value: s
    })));
  }
}