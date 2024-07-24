const mongoose = require('mongoose')

const dailyBaldSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  date: { type: Date, required: true },
  baldValue: { type: Number, required: true }
})

const monthlyBaldSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  highestBald: { type: Number, required: true }
})

const yearlyBaldSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Profile',
    required: true
  },
  year: { type: Number, required: true },
  highestBald: { type: Number, required: true }
})

const globalLeaderboardSchema = new mongoose.Schema({
  year: {
    type: Number,
    required: true
  },
  dailyTop10: [
    {
      date: {
        type: Date,
        required: true
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
      },
      baldValue: {
        type: Number,
        required: true
      }
    }
  ],
  monthlyTop10: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
      },
      month: {
        type: Number,
        required: true
      },
      baldValue: {
        type: Number,
        required: true
      }
    }
  ],
  yearlyTop10: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Profile'
      },
      baldValue: {
        type: Number,
        required: true
      }
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
