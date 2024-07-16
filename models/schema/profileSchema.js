const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
  userId: { type: String, require: true, unique: true },
  userName: { type: String, require: true },
  serverId: { type: String, require: true },
  bald: { type: Number, require: true, maximum: 100, minimum: 0 },
  baldDate: { type: Date, require: true }
})

const model = mongoose.model('duckbot', profileSchema)

module.exports = model
