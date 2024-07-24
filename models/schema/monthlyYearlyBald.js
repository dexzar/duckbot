const mongoose = require('mongoose')

const monthlyBaldSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
      index: true
    },
    month: { type: Number, required: true }, // 1-12 for January to December
    year: { type: Number, required: true },
    highestBald: { type: Number, required: true, min: 0, max: 100 }
  },
  { timestamps: true }
)

const yearlyBaldSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Profile',
      required: true,
      index: true
    },
    year: { type: Number, required: true },
    highestBald: { type: Number, required: true, min: 0, max: 100 }
  },
  { timestamps: true }
)

const MonthlyBald = mongoose.model('Monthly_Bald', monthlyBaldSchema)
const YearlyBald = mongoose.model('Yearly_Bald', yearlyBaldSchema)

module.exports = { MonthlyBald, YearlyBald }
