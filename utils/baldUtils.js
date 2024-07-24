const {
  CommandUsage,
  DailyBald,
  MonthlyBald,
  YearlyBald,
  GlobalLeaderboard
} = require('../models/schema')

const logCommandUsage = async (userId, commandName) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

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
  currentDate.setHours(0, 0, 0, 0)

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

    // Update monthly and yearly records
    const month = currentDate.getMonth() + 1
    const year = currentDate.getFullYear()

    // Update or create monthly bald record
    await MonthlyBald.findOneAndUpdate(
      { userId, month, year },
      { $max: { highestBald: baldScore } },
      { upsert: true, new: true }
    )

    // Update or create yearly bald record
    await YearlyBald.findOneAndUpdate(
      { userId, year },
      { $max: { highestBald: baldScore } },
      { upsert: true, new: true }
    )

    // Update global leaderboard
    let globalRecord = await GlobalLeaderboard.findOneAndUpdate(
      { year },
      {
        $push: {
          highestDailyBald: { userId, date: currentDate, baldValue: baldScore },
          highestMonthlyBald: { userId, month, baldValue: baldScore },
          highestYearlyBald: { userId, baldValue: baldScore }
        }
      },
      { upsert: true, new: true }
    )

    // Ensure only top 10 entries
    const limitTop10 = (arr) =>
      arr.sort((a, b) => b.baldValue - a.baldValue).slice(0, 10)

    globalRecord.highestDailyBald = limitTop10(globalRecord.highestDailyBald)
    globalRecord.highestMonthlyBald = limitTop10(
      globalRecord.highestMonthlyBald
    )
    globalRecord.highestYearlyBald = limitTop10(globalRecord.highestYearlyBald)

    await globalRecord.save()

    return { baldData, isNew: true }
  }

  return { baldData, isNew: false }
}

const checkCommandUsageLimit = async (userId, commandName) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

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
