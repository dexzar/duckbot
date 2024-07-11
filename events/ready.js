const { REST, Routes, Events } = require('discord.js')
const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  name: Events.ClientReady,
  once: true,
  async execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`)

    await mongoose
      .connect(process.env.MONGO_URI)
      .then(() =>
        console.log('Successfully connected to the Mongoose database.')
      )
      .catch((err) =>
        console.error('Failed to connect to the Mongoose database', err)
      )

    // Ensure GUILD_ID is defined
    const guildId = process.env.GUILD_ID
    if (!guildId) {
      console.error('GUILD_ID is not defined in the environment variables.')
      return
    }

    const commands = []
    client.commands.forEach((command) => {
      commands.push(command.data.toJSON())
    })

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)

    try {
      console.log('Started refreshing application (/) commands.')

      const data = await rest.put(
        Routes.applicationGuildCommands(client.user.id, guildId),
        { body: commands }
      )

      console.log('Successfully reloaded application (/) commands.')
      console.log('Commands and their IDs:')
      data.forEach((command) => {
        console.log(`Name: ${command.name}, ID: ${command.id}`)
      })
    } catch (error) {
      console.error(error)
    }
  }
}
