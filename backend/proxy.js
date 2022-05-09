require('dotenv').config()
const express = require('express')
const cors = require('cors')
const CryptoJS = require('crypto-js')
const { createProxyMiddleware } = require('http-proxy-middleware')

// Init our express app and default port
const proxyApp = express()

// Allow requests from localhost/network
proxyApp.use(cors({
  origin: [
    'http://localhost',
    'http://localhost:8080',
    'https://vote.vitc.org',
    'https://vitamincoin-dao-tools--testnet-qqxn31qr.web.app',
  ]
}))

// Authorization
proxyApp.use('', (req, res, next) => {
  // console.log('PROXY CALLED - PORT:', new URL(req.url, `http://${req.headers.host}`).port)
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

// Proxy endpoints:
// Base
proxyApp.use('/', createProxyMiddleware({
  target: `http://localhost:${process.env.API_PORT}`,
  changeOrigin: true,
  pathRewrite: {
      [`^/`]: '',
  },
}))

// Create proposal
proxyApp.use('/create-proposal', createProxyMiddleware({
  target: `http://localhost:${process.env.API_PORT}`,
  changeOrigin: true,
  pathRewrite: {
      [`^/create-proposal`]: '',
  },
}))

// Submit vote
proxyApp.use('/submit-vote', createProxyMiddleware({
  target: `http://localhost:${process.env.API_PORT}`,
  changeOrigin: true,
  pathRewrite: {
      [`^/submit-vote`]: '',
  },
}))

// Request Login
proxyApp.use('/request-login', createProxyMiddleware({
  target: `http://localhost:${process.env.API_PORT}`,
  changeOrigin: true,
  pathRewrite: {
      [`^/request-login`]: '',
  },
}))


// Export our proxy express app
module.exports = proxyApp
