const fs = require('node:fs')
const path = require('node:path')

/**
 * Load commands from the specified directory and its subdirectories.
 * @param {Client} client - The Discord.js client.
 * @param {string} commandsPath - The path to the commands directory.
 */
function loadCommands(client, commandsPath) {
  const commandFolders = fs.readdirSync(commandsPath)

  for (const folder of commandFolders) {
    const folderPath = path.join(commandsPath, folder)
    const commandFiles = fs
      .readdirSync(folderPath)
      .filter((file) => file.endsWith('.js'))
    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file)
      const command = require(filePath)
      if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command)
      } else {
        console.log(
          `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
        )
      }
    }
  }
}

module.exports = { loadCommands }
