const mongoose = require('mongoose')

const globalLeaderboardSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    highestDailyBald: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Profile',
          required: true
        },
        date: { type: Date, required: true },
        baldValue: { type: Number, required: true, min: 0, max: 100 }
      }
    ],
    highestMonthlyBald: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Profile',
          required: true
        },
        month: { type: Number, required: true },
        baldValue: { type: Number, required: true, min: 0, max: 100 }
      }
    ],
    highestYearlyBald: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Profile',
          required: true
        },
        baldValue: { type: Number, required: true, min: 0, max: 100 }
      }
    ]
  },
  { timestamps: true }
)

const GlobalLeaderboard = mongoose.model(
  'Global_Bald_Leaderboard',
  globalLeaderboardSchema
)

module.exports = GlobalLeaderboard
