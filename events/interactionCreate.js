const { Events, Collection } = require('discord.js')
const { Profile, CommandUsage } = require('../models/schema')

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (!interaction.isChatInputCommand()) return

    let profileData
    try {
      profileData = await Profile.findOne({ userId: interaction.user.id })
      if (!profileData) {
        profileData = await Profile.create({
          userId: interaction.user.id,
          userName: interaction.user.username
        })
      }
    } catch (err) {
      console.log(err)
      return interaction.reply({
        content: 'There was an error while fetching your profile data.',
        ephemeral: true
      })
    }

    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) {
      console.error(`No command matching ${interaction.commandName} was found.`)
      return
    }

    const { cooldowns } = interaction.client

    if (!cooldowns.has(command.data.name)) {
      cooldowns.set(command.data.name, new Collection())
    }

    const now = Date.now()
    const timestamps = cooldowns.get(command.data.name)
    const defaultCooldownDuration = 3
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000

    if (timestamps.has(interaction.user.id)) {
      const expirationTime =
        timestamps.get(interaction.user.id) + cooldownAmount

      if (now < expirationTime) {
        const expiredTimestamp = Math.round(expirationTime / 1000)
        return interaction.reply({
          content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${expiredTimestamp}:R>.`,
          ephemeral: true
        })
      }
    }

    timestamps.set(interaction.user.id, now)
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount)

    try {
      await command.execute(interaction, profileData)
    } catch (error) {
      console.error(error)
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: 'There was an error while executing this command!',
          ephemeral: true
        })
      } else {
        await interaction.reply({
          content: 'There was an error while executing this command!',
          ephemeral: true
        })
      }
    }
  }
}
