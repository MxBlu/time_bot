import { CommandBuilder, CommandProvider, LogLevel, Logger, sendCmdReply } from "bot-framework";
import { SlashCommandBuilder } from "discord.js";
import { Store } from "../support/store.js";
import { ChatInputCommandInteraction } from "discord.js";
import { formatInTimeZone } from "date-fns-tz";

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
        )
    ];
  }

  public provideHelpMessage(): string {
    return "/time <user> - Gets the time for a given user.";
  }

  public async handle(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild;
    let user = interaction.options.getUser('user');

    // If user is not provided, provide current time for user
    if (user == null) {
      user = interaction.user;
    }

    // Get the timezone from the user
    const timezone = await Store.getTimeZone(guild.id, user.id);
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
}