const { SlashCommandBuilder } = require('discord.js')

module.exports = {
  data: new SlashCommandBuilder()
      .setName('bald')
      .setDescription('See how bald you are today!'),
    async execute(interaction) {
      let bald = Math.floor(Math.random() * 101)

      await interaction.reply(`${interaction.user.username} is ${bald}% bald.`)
    }
}