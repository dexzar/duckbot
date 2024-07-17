const mongoose = require('mongoose')

const profileSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userName: { type: String, required: true }
})

const Profile = mongoose.model('user_profile', profileSchema)

module.exports = Profile
