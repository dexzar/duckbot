const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  cooldown: 5,
  data: new SlashCommandBuilder()
      .setName('bald')
      .setDescription('See how bald you are today!')
      .addUserOption(option =>
        option
          .setName('target')
          .setDescription('Choose a user to bald check')),
    async execute(interaction) {
      let bald = Math.floor(Math.random() * 101)

      await interaction.reply(`${interaction.user.username} is ${bald}% bald.`)
    }
}