const { SlashCommandBuilder } = require('discord.js')
const { REST, Routes } = require('discord.js')
const fs = require('node:fs')
const path = require('node:path')
const dotenv = require('dotenv')
dotenv.config()

module.exports = {
  cooldown: 5,
  category: 'utility',
  data: new SlashCommandBuilder()
    .setName('deploy')
    .setDescription('Deploys or refreshes application (/) commands.'),
  async execute(interaction) {
    const commands = []
    const foldersPath = path.join(__dirname, '../../commands')
    const commandFolders = fs.readdirSync(foldersPath)

    for (const folder of commandFolders) {
      const commandsPath = path.join(foldersPath, folder)
      const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith('.js'))
      for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file)
        const command = require(filePath)
        if ('data' in command && 'execute' in command) {
          commands.push(command.data.toJSON())
        } else {
          console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
          )
        }
      }
    }

    const rest = new REST({ version: '10' }).setToken(process.env.TOKEN)

    try {
      console.log(
        `Started refreshing ${commands.length} application (/) commands.`
      )
      await interaction.reply({
        content: `Started refreshing ${commands.length} application (/) commands.`,
        ephemeral: true
      })

      const data = await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: commands }
      )

      console.log(
        `Successfully reloaded ${data.length} application (/) commands.`
      )
      await interaction.editReply({
        content: `Successfully reloaded ${data.length} application (/) commands.`
      })
    } catch (error) {
      console.error(error)
      await interaction.editReply({
        content: `There was an error while deploying commands:\n\`${error.message}\``
      })
    }
  }
}
