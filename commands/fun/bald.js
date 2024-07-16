const { SlashCommandBuilder } = require('discord.js')

// To do
/* 1. User can only set bald once per day
/* 3. Other users can bald check others, if there is no user it won't save
/* 4. Other users can bald check others, if there is no user limit this to 5x a day
/* 5. Setup logging for highest of the month
/*    -> Do this by pushing the user bald score of the day if put in to monthly board
/*     -> If lower or same, do nothing
/*     -> If higher, override
/* 6. Create command to get highest of the month (top5/10?)
/* 7. Repeat 5/6 for year
/* 8. Create db for year entries, only add scores of top 10 with name and score
*/

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
    const baldScore = profileData.bald
    const baldDate = profileData.baldDate

    let bald = Math.floor(Math.random() * 101)

    const target = interaction.options.getString('target')
    if (target) {
      await interaction.reply(`${target} is ${bald}% bald.`)
    } else {
      await interaction.reply(
        `${interaction.user.username} is ${baldScore}% bald.  ${baldDate.toISOString().split('T')[0]}`
      )
    }
  }
}
