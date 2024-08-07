const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const { getBaldData } = require('../utils/baldUtils')
const {
  DailyBald,
  MonthlyBald,
  YearlyBald,
  GlobalLeaderboard
} = require('../models/schema')

mongoose.connect(process.env.MONGO_URI_PRODUCTION)

mongoose.connection.once('open', () => {})

async function insertOlderData(userId, date, baldValue) {
  // Insert older daily bald data
  await DailyBald.create({
    userId,
    date,
    baldValue
  })

  const month = date.getUTCMonth() + 1
  const year = date.getUTCFullYear()

  // Insert older monthly bald data
  await MonthlyBald.findOneAndUpdate(
    { userId, month, year },
    { $max: { highestBald: baldValue } },
    { upsert: true, new: true }
  )

  // Insert older yearly bald data
  await YearlyBald.findOneAndUpdate(
    { userId, year },
    { $max: { highestBald: baldValue } },
    { upsert: true, new: true }
  )

  // Insert into global leaderboard for older data
  let globalLeaderboard = await GlobalLeaderboard.findOne({ year })

  if (!globalLeaderboard) {
    globalLeaderboard = new GlobalLeaderboard({
      year,
      monthlyTop10: [],
      yearlyTop10: [],
      dailyTop10: []
    })
  }

  // Handle monthly top 10
  const existingMonthlyEntryIndex = globalLeaderboard.monthlyTop10.findIndex(
    (entry) =>
      entry.userId.toString() === userId.toString() && entry.month === month
  )

  if (existingMonthlyEntryIndex !== -1) {
    if (
      globalLeaderboard.monthlyTop10[existingMonthlyEntryIndex].baldValue <
      baldValue
    ) {
      globalLeaderboard.monthlyTop10[existingMonthlyEntryIndex].baldValue =
        baldValue
    }
  } else {
    globalLeaderboard.monthlyTop10.push({ userId, month, baldValue })
  }

  globalLeaderboard.monthlyTop10 = globalLeaderboard.monthlyTop10
    .filter((entry) => entry.month === month)
    .sort((a, b) => b.baldValue - a.baldValue)
    .slice(0, 10)

  // Handle yearly top 10
  const existingYearlyEntryIndex = globalLeaderboard.yearlyTop10.findIndex(
    (entry) => entry.userId.toString() === userId.toString()
  )

  if (existingYearlyEntryIndex !== -1) {
    if (
      globalLeaderboard.yearlyTop10[existingYearlyEntryIndex].baldValue <
      baldValue
    ) {
      globalLeaderboard.yearlyTop10[existingYearlyEntryIndex].baldValue =
        baldValue
    }
  } else {
    globalLeaderboard.yearlyTop10.push({ userId, baldValue })
  }

  globalLeaderboard.yearlyTop10 = globalLeaderboard.yearlyTop10
    .sort((a, b) => b.baldValue - a.baldValue)
    .slice(0, 10)

  await globalLeaderboard.save()
}

async function runTest(numberOfUsers) {
  const userIds = []

  for (let i = 0; i < numberOfUsers; i++) {
    userIds.push(new mongoose.Types.ObjectId())
  }

  // Insert older data for the previous year
  const previousYear = new Date()
  previousYear.setUTCFullYear(previousYear.getUTCFullYear() - 1)
  previousYear.setUTCMonth(0)
  previousYear.setUTCDate(1)
  previousYear.setUTCHours(0, 0, 0, 0)

  for (const userId of userIds) {
    const baldValue = Math.floor(Math.random() * 101)
    await insertOlderData(userId, previousYear, baldValue)
  }

  // Simulate the bald check for each user
  for (const userId of userIds) {
    await getBaldData(userId)
  }

  mongoose.connection.close()
}

// Run the test with the specified number of users
runTest(10).catch(console.error)
