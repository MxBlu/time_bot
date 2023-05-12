import { CommandBuilder, CommandProvider, LogLevel, Logger, isAdmin, sendCmdReply } from "bot-framework";
import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Timezones } from "../support/timezones.js";
import { Store } from "../support/store.js";

export class SetTimeCommand implements CommandProvider<ChatInputCommandInteraction> {
  logger: Logger;

  constructor() {
    this.logger = new Logger("SetTimeCommand");
  }

  public provideCommands(): CommandBuilder[] {
    return [
      new SlashCommandBuilder()
        .setName('settime')
        .setDescription('Set your timezone for other users to get time from')
        .addStringOption(builder => 
          builder.setName('timezone')
            .setDescription('Timezone')
            .setAutocomplete(true)
            .setRequired(true)
        ).addUserOption(builder => 
          builder.setName('user')
            .setDescription('User - admin only')
            .setRequired(false)
        )
    ];
  }

  public provideHelpMessage(): string {
    return "/settime <timezone> (<user>) - Set your timezone for other users to get time from. Admins can use this to set others' timezones";
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild;
    const timezone = interaction.options.getString('timezone');
    let user = interaction.options.getUser('user');
    // User should only be defined by admins, make sure the current user is an admin
    if (user != null && ! await isAdmin(guild, interaction.user)) {
      sendCmdReply(interaction, 'Error: Not admin', this.logger, LogLevel.TRACE);
      return;
    } else {
      user = interaction.user;
    }
    // Make sure the timezone is a supported one
    if (!Timezones.isValid(timezone)) {
      sendCmdReply(interaction, 'Error: Invalid timezone', this.logger, LogLevel.TRACE);
      return;
    }

    await Store.setTimeZone(guild.id, user.id, timezone);
    sendCmdReply(interaction, `Set timezone for @${user.username} to ${timezone}`, this.logger, LogLevel.INFO);
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