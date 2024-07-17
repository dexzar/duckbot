// To do
/* [🗸] 1. User can only set bald once per day
/* [🗸] 4. Other users can bald check others, if there is no user limit this to 5x a day
/* [] 5. Setup logging for highest of the month
/*    []-> Do this by pushing the user bald score of the day if put in to monthly board
/*     []-> If lower or same, do nothing
/*     []-> If higher, override
/* []6. Create command to get highest of the month (top5/10?)
/* []7. Repeat 5/6 for year
/* []8. Create db for year entries, only add scores of top 10 with name and score
*/

const { SlashCommandBuilder } = require('discord.js')
const { CommandUsage, Bald } = require('../../models/schema') // Import the required schemas

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
    let baldData

    try {
      const commandUsageData = await CommandUsage.findOne({
        userId: profileData._id,
        commandName: 'bald',
        date: new Date().setHours(0, 0, 0, 0)
      })
      if (commandUsageData && commandUsageData.commandCount >= 5) {
        return interaction.reply({
          content: 'You have used the command too many times today.'
        })
      }

      baldData = await Bald.findOne({
        userId: profileData._id,
        date: new Date().setHours(0, 0, 0, 0)
      })
      if (!baldData) {
        baldScore = Math.floor(Math.random() * 101)
        baldData = await Bald.create({
          userId: profileData._id,
          date: new Date().setHours(0, 0, 0, 0),
          dayBald: baldScore,
          monthBald: baldScore,
          yearBald: baldScore
        })
      } else {
        baldScore = baldData.dayBald
      }
    } catch (err) {
      console.log(err)
      return interaction.reply({
        content: 'There was an error while fetching your bald score.',
        ephemeral: true
      })
    }

    await logCommandUsage(profileData._id, 'bald')

    if (target) {
      await interaction.reply(`${target} is ${baldScore}% bald.`)
    } else {
      await interaction.reply(
        `${interaction.user.username} is ${baldScore}% bald.`
      )
    }
  }
}

async function logCommandUsage(userId, commandName) {
  let today = new Date().setHours(0, 0, 0, 0)

  await CommandUsage.deleteMany({
    commandName,
    date: { $lt: today }
  })

  await CommandUsage.findOneAndUpdate(
    { userId, date: today, commandName },
    { $inc: { commandCount: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
}
