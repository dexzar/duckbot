const dotenv = require('dotenv');
dotenv.config();

const fs = require('node:fs')
const path = require('node:path')
const { Client, Collection, GatewayIntentBits } = require('discord.js')
const { loadCommands } = require('./utils/load-commands')
const { loadEvents } = require('./utils/load-events')
const client = new Client({ intents: [GatewayIntentBits.Guilds] })

client.cooldowns = new Collection()
client.commands = new Collection()

const commandsPath = path.join(__dirname, 'commands');
loadCommands(client, commandsPath);

const eventsPath = path.join(__dirname, 'events')
loadEvents(client, eventsPath)

client.login(process.env.TOKEN)