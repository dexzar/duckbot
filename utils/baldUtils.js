const {
  CommandUsage,
  DailyBald,
  MonthlyBald,
  YearlyBald,
  GlobalLeaderboard
} = require('../models/schema')

const logCommandUsage = async (userId, commandName) => {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  await CommandUsage.deleteMany({
    commandName,
    date: { $lt: today }
  })

  await CommandUsage.findOneAndUpdate(
    { userId, date: today, commandName },
    { $inc: { commandCount: 1 } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  )
}

const clearOldData = async (model, dateField, currentValue) => {
  await model.deleteMany({ [dateField]: { $ne: currentValue } })
}

const updateTop10Leaderboard = async (model, filter, update, sortField) => {
  await model.updateOne(filter, update, { upsert: true })

  const top10 = await model
    .find(filter)
    .sort({ [sortField]: -1 })
    .limit(10)

  await model.deleteMany({ _id: { $nin: top10.map((entry) => entry._id) } })
}

const getBaldData = async (userId) => {
  const currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  const currentYear = currentDate.getUTCFullYear()
  const currentMonth = currentDate.getUTCMonth() + 1

  // Clear old data
  await clearOldData(DailyBald, 'date', currentDate)
  await clearOldData(MonthlyBald, 'year', currentYear)
  await clearOldData(YearlyBald, 'year', currentYear)

  // Get or create the daily bald data
  let baldData = await DailyBald.findOne({ userId, date: currentDate })

  if (!baldData) {
    const baldScore = Math.floor(Math.random() * 101)
    baldData = await DailyBald.create({
      userId,
      date: currentDate,
      baldValue: baldScore
    })

    // Update monthly bald data
    await updateTop10Leaderboard(
      MonthlyBald,
      { userId, month: currentMonth, year: currentYear },
      { $max: { highestBald: baldScore } },
      'highestBald'
    )

    // Update yearly bald data
    await updateTop10Leaderboard(
      YearlyBald,
      { userId, year: currentYear },
      { $max: { highestBald: baldScore } },
      'highestBald'
    )

    // Update global leaderboard for the current year
    let globalLeaderboard = await GlobalLeaderboard.findOne({
      year: currentYear
    })

    if (!globalLeaderboard) {
      globalLeaderboard = new GlobalLeaderboard({
        year: currentYear,
        dailyTop10: [],
        monthlyTop10: [],
        yearlyTop10: []
      })
    }

    // Daily top 10
    globalLeaderboard.dailyTop10.push({
      userId,
      baldValue: baldScore,
      date: currentDate
    })
    globalLeaderboard.dailyTop10 = globalLeaderboard.dailyTop10
      .sort((a, b) => b.baldValue - a.baldValue)
      .slice(0, 10)

    // Monthly top 10
    const monthlyEntry = globalLeaderboard.monthlyTop10.find(
      (entry) => entry.month === currentMonth
    )
    if (monthlyEntry) {
      const existingMonthlyEntryIndex = monthlyEntry.top10.findIndex(
        (entry) => entry.userId.toString() === userId.toString()
      )

      if (existingMonthlyEntryIndex !== -1) {
        if (
          monthlyEntry.top10[existingMonthlyEntryIndex].baldValue < baldScore
        ) {
          monthlyEntry.top10[existingMonthlyEntryIndex].baldValue = baldScore
        }
      } else {
        monthlyEntry.top10.push({ userId, baldValue: baldScore })
      }

      monthlyEntry.top10 = monthlyEntry.top10
        .sort((a, b) => b.baldValue - a.baldValue)
        .slice(0, 10)
    } else {
      globalLeaderboard.monthlyTop10.push({
        month: currentMonth,
        top10: [{ userId, baldValue: baldScore }]
      })
    }

    // Yearly top 10
    const existingYearlyEntryIndex = globalLeaderboard.yearlyTop10.findIndex(
      (entry) => entry.userId.toString() === userId.toString()
    )

    if (existingYearlyEntryIndex !== -1) {
      if (
        globalLeaderboard.yearlyTop10[existingYearlyEntryIndex].baldValue <
        baldScore
      ) {
        globalLeaderboard.yearlyTop10[existingYearlyEntryIndex].baldValue =
          baldScore
      }
    } else {
      globalLeaderboard.yearlyTop10.push({ userId, baldValue: baldScore })
    }

    globalLeaderboard.yearlyTop10 = globalLeaderboard.yearlyTop10
      .sort((a, b) => b.baldValue - a.baldValue)
      .slice(0, 10)

    await globalLeaderboard.save()
    return { baldData, isNew: true }
  }

  return { baldData, isNew: false }
}

const checkCommandUsageLimit = async (userId, commandName) => {
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)

  const commandUsageData = await CommandUsage.findOne({
    userId,
    commandName,
    date: today
  })

  // if (commandUsageData && commandUsageData.commandCount >= 5) {
  //   return true
  // }

  return false
}

module.exports = {
  logCommandUsage,
  getBaldData,
  checkCommandUsageLimit
}
