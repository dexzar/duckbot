const { SlashCommandBuilder } = require('discord.js')
const {
  logCommandUsage,
  getBaldData,
  checkCommandUsageLimit
} = require('../../utils/baldUtils')

module.exports = {
  cooldown: 5,
  category: 'fun',
  data: new SlashCommandBuilder()
    .setName('bald')
    .setDescription('See how bald you are today!')
    .addStringOption((option) =>
      option
        .setName('target')
        .setDescription('Enter a username or just leave it empty for yourself.')
    ),
  async execute(interaction, profileData) {
    const target = interaction.options.getString('target')
    let baldScore

    try {
      const usageLimitExceeded = await checkCommandUsageLimit(
        profileData._id,
        'bald'
      )
      if (usageLimitExceeded) {
        return interaction.reply({
          content: 'You have used the command too many times today.',
          ephemeral: true
        })
      }

      const { baldData, isNew } = await getBaldData(profileData._id)
      baldScore = isNew ? Math.floor(Math.random() * 101) : baldData.baldValue

      if (isNew) {
        baldData.baldValue = baldScore
        await baldData.save()
      }

      await logCommandUsage(profileData._id, 'bald')

      if (target) {
        await interaction.reply(`${target} is ${baldScore}% bald.`)
      } else {
        await interaction.reply(
          `${interaction.user.username} is ${baldScore}% bald.`
        )
      }
    } catch (err) {
      console.error(err)
      return interaction.reply({
        content: 'There was an error while fetching your bald score.',
        ephemeral: true
      })
    }
  }
}
