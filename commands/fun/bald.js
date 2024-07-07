const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  cooldown: 5,
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('bald')
    .setDescription('See how bald you are today!')
    .addStringOption(option =>
      option
        .setName('target')
        .setDescription('Enter a username or just leave it empty for yourself.')),
  async execute(interaction) {
    let bald = Math.floor(Math.random() * 101);

    const target = interaction.options.getString('target');
    if (target) {
      if (target === 'zood'){
        await interaction.reply(`${target} is 100% bald.`);
      } else {
        await interaction.reply(`${target} is ${bald}% bald.`);
      }
      
    } else {
      await interaction.reply(`${interaction.user.username} is ${bald}% bald.`);
    }
  },
};
