const mongoose = require('mongoose')
const dotenv = require('dotenv')
dotenv.config()

const { getBaldData } = require('../utils/baldUtils')

mongoose.connect(process.env.MONGO_URI_PRODUCTION)

mongoose.connection.once('open', () => {})

async function runTest(numberOfUsers) {
  const userIds = []

  for (let i = 0; i < numberOfUsers; i++) {
    userIds.push(new mongoose.Types.ObjectId())
  }

  for (const userId of userIds) {
    await getBaldData(userId)
  }

  for (const userId of userIds) {
    await getBaldData(userId)
  }

  mongoose.connection.close()
}

runTest(100).catch(console.error)
