const mongoose = require('mongoose')

const baldSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  date: { type: Date, required: true },
  dayBald: { type: Number, required: true, min: 0, max: 100 },
  monthBald: { type: Number },
  yearBald: { type: Number }
})

const Bald = mongoose.model('Bald', baldSchema)

module.exports = Bald
