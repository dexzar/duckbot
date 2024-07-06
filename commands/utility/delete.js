const { SlashCommandBuilder } = require('discord.js');
const { REST, Routes } = require('discord.js');

const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  cooldown: 5,
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('delete')
    .setDescription('Deletes a command.')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The command to delete.')
        .setRequired(true)),
  async execute(interaction) {
    const commandName = interaction.options.getString('command', true).toLowerCase();
    const guildId = process.env.GUILD_ID;
    
    if (!guildId) {
      return interaction.reply('GUILD_ID is not defined in the environment variables.');
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

    try {
      const commands = await rest.get(Routes.applicationGuildCommands(interaction.client.user.id, guildId));
      
      const command = commands.find(cmd => cmd.name === commandName);

      if (!command) {
        return interaction.reply(`No command found with the name \`${commandName}\`.`);
      }

      await rest.delete(
        Routes.applicationGuildCommand(interaction.client.user.id, guildId, command.id),
      );

      console.log(`Successfully deleted command with name: ${commandName}`);
      await interaction.reply({ content: `Command \`${commandName}\` was successfully deleted.`, ephemeral: true});
    } catch (error) {
      console.error(`Error deleting command with name: ${commandName}`);
      console.error(error);
      await interaction.reply({ content: `There was an error while deleting the command \`${commandName}\`:\n\`${error.message}\``, ephemeral: true })
    }
  },
};
