const mongoose = require('mongoose')

const dailyBaldSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
      unique: true,
      index: true
    },
    date: { type: Date, required: true },
    baldValue: { type: Number, required: true, min: 0, max: 100 }
  },
  { timestamps: true }
)

const DailyBald = mongoose.model('Daily_Bald', dailyBaldSchema)

module.exports = DailyBald
