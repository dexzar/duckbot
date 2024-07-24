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

const getBaldData = async (userId) => {
  const currentDate = new Date()
  currentDate.setUTCHours(0, 0, 0, 0)

  const month = currentDate.getUTCMonth() + 1
  const year = currentDate.getUTCFullYear()

  // Remove old daily bald checks
  await DailyBald.deleteMany({ userId, date: { $lt: currentDate } })

  // Fetch or create daily bald data
  let baldData = await DailyBald.findOne({ userId, date: currentDate })

  if (!baldData) {
    const baldScore = Math.floor(Math.random() * 101)
    baldData = await DailyBald.create({
      userId,
      date: currentDate,
      baldValue: baldScore
    })

    // Fetch or create the global leaderboard for the current year
    let globalLeaderboard = await GlobalLeaderboard.findOne({ year })

    if (!globalLeaderboard) {
      globalLeaderboard = new GlobalLeaderboard({
        year,
        monthlyTop10: [],
        yearlyTop10: [],
        dailyTop10: []
      })
    }

    // Clear outdated daily top 10 entries
    globalLeaderboard.dailyTop10 = globalLeaderboard.dailyTop10.filter(
      (entry) =>
        new Date(entry.date).toDateString() === currentDate.toDateString()
    )

    // Handle daily top 10
    const existingDailyEntryIndex = globalLeaderboard.dailyTop10.findIndex(
      (entry) => entry.userId.toString() === userId.toString()
    )

    if (existingDailyEntryIndex !== -1) {
      if (
        globalLeaderboard.dailyTop10[existingDailyEntryIndex].baldValue <
        baldScore
      ) {
        globalLeaderboard.dailyTop10[existingDailyEntryIndex].baldValue =
          baldScore
        globalLeaderboard.dailyTop10[existingDailyEntryIndex].date = currentDate
      }
    } else {
      globalLeaderboard.dailyTop10.push({
        userId,
        baldValue: baldScore,
        date: currentDate
      })
    }

    globalLeaderboard.dailyTop10 = globalLeaderboard.dailyTop10
      .sort((a, b) => b.baldValue - a.baldValue)
      .slice(0, 10)

    // Handle monthly top 10
    const existingMonthlyEntryIndex = globalLeaderboard.monthlyTop10.findIndex(
      (entry) =>
        entry.userId.toString() === userId.toString() && entry.month === month
    )

    if (existingMonthlyEntryIndex !== -1) {
      if (
        globalLeaderboard.monthlyTop10[existingMonthlyEntryIndex].baldValue <
        baldScore
      ) {
        globalLeaderboard.monthlyTop10[existingMonthlyEntryIndex].baldValue =
          baldScore
      }
    } else {
      globalLeaderboard.monthlyTop10.push({
        userId,
        month,
        baldValue: baldScore
      })
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

    // Update monthly and yearly records
    await MonthlyBald.findOneAndUpdate(
      { userId, month, year },
      { highestBald: baldScore },
      { upsert: true, new: true }
    )

    await YearlyBald.findOneAndUpdate(
      { userId, year },
      { $max: { highestBald: baldScore } },
      { upsert: true, new: true }
    )

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
