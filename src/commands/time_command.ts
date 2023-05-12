import { CommandBuilder, CommandProvider, LogLevel, Logger, sendCmdReply } from "bot-framework";
import { AutocompleteInteraction, SlashCommandBuilder } from "discord.js";
import { Store } from "../support/store.js";
import { ChatInputCommandInteraction } from "discord.js";
import { formatInTimeZone } from "date-fns-tz";
import { Timezones } from "../support/timezones.js";

export class TimeCommand implements CommandProvider<ChatInputCommandInteraction> {
  logger: Logger;

  constructor() {
    this.logger = new Logger("TimeCommand");
  }

  public provideCommands(): CommandBuilder[] {
    return [
      new SlashCommandBuilder()
        .setName('time')
        .setDescription('Gets the time for a timezone or individual')
        .addUserOption(builder => 
          builder.setName('user')
            .setDescription('User')
            .setRequired(false)
        ).addStringOption(builder => 
          builder.setName('timezone')
            .setDescription('Timezone')
            .setAutocomplete(true)
            .setRequired(false)
        )
    ];
  }

  public provideHelpMessage(): string {
    return "/time (<user>) (<timezone>) - Gets the time for a timezone or individual.";
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild;
    let user = interaction.options.getUser('user');
    let timezone = interaction.options.getString('timezone');

    // Handle if both arguments are provided (we want either or not)
    if (user != null && timezone != null) {
      sendCmdReply(interaction, 'Error: Please provide either or no arguments, not both', this.logger, LogLevel.TRACE);
      return;
    }
    // If neither argument is provided, set user to the calling user
    if (user == null && timezone == null) {
      user = interaction.user;
    }
    // If we have a user after all this, get the timezone from the user
    if (user != null) {
      timezone = await Store.getTimeZone(guild.id, user.id);
    }
    // If we're gotten this far and the timezone is null, we don't have one from the user
    if (timezone == null) {
      sendCmdReply(interaction, 'No timezone available for user', this.logger, LogLevel.INFO);
      return;
    }

    // Generate message to send
    const message = `${timezone} - ` + formatInTimeZone(new Date(), timezone, `EEE do MMM, hh:mm aaa`);
    // Send message
    this.logger.info(`Got time: timezone=${timezone} user=${user}`);
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