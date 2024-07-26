const mongoose = require('mongoose')

const dailyBaldSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  date: { type: Date, required: true },
  baldValue: { type: Number, required: true, min: 0, max: 100 }
})

const monthlyBaldSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  highestBald: { type: Number, required: true, min: 0, max: 100 }
})

monthlyBaldSchema.index({ year: 1, month: 1, highestBald: -1 })

const yearlyBaldSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  year: { type: Number, required: true },
  highestBald: { type: Number, required: true, min: 0, max: 100 }
})

yearlyBaldSchema.index({ year: 1, highestBald: -1 })

const globalLeaderboardSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  dailyTop10: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
      baldValue: { type: Number, min: 0, max: 100 },
      date: { type: Date, required: true }
    }
  ],
  monthlyTop10: [
    {
      month: { type: Number, required: true },
      top10: [
        {
          userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
          baldValue: { type: Number, min: 0, max: 100 }
        }
      ]
    }
  ],
  yearlyTop10: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile' },
      baldValue: { type: Number, min: 0, max: 100 }
    }
  ]
})

const DailyBald = mongoose.model('Daily_Bald', dailyBaldSchema)
const MonthlyBald = mongoose.model('Monthly_Bald', monthlyBaldSchema)
const YearlyBald = mongoose.model('Yearly_Bald', yearlyBaldSchema)
const GlobalLeaderboard = mongoose.model(
  'Global_Leaderboard',
  globalLeaderboardSchema
)

module.exports = { DailyBald, MonthlyBald, YearlyBald, GlobalLeaderboard }
