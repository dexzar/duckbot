const { SlashCommandBuilder } = require('discord.js');
const path = require('node:path');
const { loadCommands } = require('../../utils/load-commands');

module.exports = {
  cooldown: 5,
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads a command.')
    .addStringOption(option =>
      option.setName('command')
        .setDescription('The command to reload.')
        .setRequired(true)),
  async execute(interaction) {
    const commandName = interaction.options.getString('command', true).toLowerCase();
    const command = interaction.client.commands.get(commandName);

    if (!command) {
      return interaction.reply({ content: `There is no command with the name \`${commandName}\`!`, ephemeral: true });
    }

    const commandsPath = path.join(__dirname, '../../commands');

    if (!command.category || !command.data.name) {
      return interaction.reply({ content: `Invalid command structure for \`${commandName}\`.`, ephemeral: true });
    }

    const commandPath = path.join(commandsPath, `${command.category}/${command.data.name}.js`);

    try {
      delete require.cache[require.resolve(commandPath)];
      loadCommands(interaction.client, commandsPath); // Reload all commands

      const newCommand = interaction.client.commands.get(commandName);
      if (!newCommand) {
        return interaction.reply({ content: `Failed to reload command \`${commandName}\`.`, ephemeral: true });
      }

      await interaction.reply({ content: `Command \`${newCommand.data.name}\` was reloaded!`, ephemeral: true });
    } catch (error) {
      console.error(`Error reloading command from path: ${commandPath}`, error);
      await interaction.reply({ content: `There was an error while reloading a command \`${command.data.name}\`:\n\`${error.message}\``, ephemeral: true });
    }
  },
};