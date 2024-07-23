const { CommandUsage, Bald } = require('../models/schema')

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
  let baldData = await Bald.findOne({
    userId,
    date: currentDate
  })

  if (!baldData) {
    const baldScore = Math.floor(Math.random() * 101)
    baldData = await Bald.create({
      userId,
      date: currentDate,
      dayBald: baldScore,
      monthBald: baldScore,
      yearBald: baldScore
    })
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

  if (commandUsageData && commandUsageData.commandCount >= 5) {
    return true
  }

  return false
}

module.exports = {
  logCommandUsage,
  getBaldData,
  checkCommandUsageLimit
}
