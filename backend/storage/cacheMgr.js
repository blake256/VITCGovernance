require('dotenv').config()
const Redis = require('ioredis')

// Cache manager
const cacheMgr = new Redis({
  keyPrefix: 'VITCGovernance:',
  password: process.env.REDIS_AUTH_KEY,
})

/**
 *
 */
async function getCacheData(name) {
  return cacheMgr.get(name)
}

/**
 *
 */
async function setCacheData(name, newData) {
  return cacheMgr.setex(name, 60, JSON.stringify(newData))
}

module.exports = {
  getCacheData,
  setCacheData,
}
