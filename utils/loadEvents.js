const fs = require('node:fs')
const path = require('node:path')

/**
 * Load commands from the specified directory and its subdirectories.
 * @param {Client} client - The Discord.js client.
 * @param {string} eventsPath - The path to the events directory.
 */
function loadEvents(client, eventsPath) {
  const eventFiles = fs
    .readdirSync(eventsPath)
    .filter((file) => file.endsWith('.js'))

  for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file)
    const event = require(filePath)
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args))
    } else {
      client.on(event.name, (...args) => event.execute(...args))
    }
  }
}

module.exports = { loadEvents }
