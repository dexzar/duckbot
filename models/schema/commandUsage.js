const mongoose = require('mongoose')

const commandUsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  date: { type: Date, required: true },
  commandName: { type: String, required: true },
  commandCount: { type: Number, required: true, default: 1 }
})

const CommandUsage = mongoose.model('Command_usage', commandUsageSchema)

module.exports = CommandUsage
