require('dotenv').config()
const express = require('express')
const cors = require('cors')
const CryptoJS = require('crypto-js')
const bodyParser = require('body-parser')
const pinoHTTP = require('pino-http')
const { logger } = require('./logging/logger')
const { compress } = require('compress-json')
const { initializeStorage } = require('./storage/firebase')
const {
  proposals,
  users,
  voting,
} = require('./routes/index')

// Init our express app and default port
const backendApp = express()

// Allow requests from localhost/network
backendApp.use(cors({
  origin: [
    'http://localhost',
    'http://localhost:8080',
    'https://vote.vitc.org',
    'https://vitamincoin-dao-tools--testnet-im1b4u6g.web.app',
  ]
}))

// Use json middleware
backendApp.use(bodyParser.urlencoded({ extended: false }))
backendApp.use(bodyParser.json({limit: '2gb'}))

// Authorization
backendApp.use('', (req, res, next) => {
  // console.log('BACKEND CALLED - PORT:', new URL(req.url, `http://${req.headers.host}`).port)
  if (req.headers.authorization) {
    // Decrypt auth key
    const decryptedBytes = CryptoJS.AES.decrypt(
      req.headers.authorization,
      process.env.AUTH_KRIPT_KEY,
    )
    const decryptedKey = decryptedBytes.toString(CryptoJS.enc.Utf8)
    if (decryptedKey === process.env.AUTH_KEY_DECRYPTED) {
      next()
    } else {
      res.sendStatus(403)
    }
  } else {
    res.sendStatus(404)
  }
})

// Base route
backendApp.get('/', async (req, res) => {
  res.status(200).json(compress({
    message: "Hello from VITCGovernance's backend API!",
  }))
})

// Initialize backend cache/storage
initializeStorage()

// Use collection routes
backendApp.use(proposals)
// Use user/login routes
backendApp.use(users)
// Use voting routes
backendApp.use(voting)

// Pino HTTP Logger
backendApp.use(
  pinoHTTP({
    logger,
  })
)

// Log uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(err)
  process.exit(1)
})

// Log unhandled rejections
process.on('unhandledRejection', (err) => {
  logger.error(err)
  process.exit(1)
})


// Export our backend express app
module.exports = backendApp
