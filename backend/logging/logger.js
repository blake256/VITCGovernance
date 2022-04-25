const fs = require('fs')
const pino = require('pino')
const pinoms = require('pino-multi-stream')

const streams = [
  {
    stream: process.stdout,
  },
  {
    stream: fs.createWriteStream('./VITCGovernance.log', {
      flags: 'a',
    }),
  },
]

const logger = pino(
  {
    prettyPrint: {
      colorize: true,
      levelFirst: true,
      translateTime: "yyyy-dd-mm, h:MM:ss TT",
    },
  },
  pinoms.multistream(streams)
)

module.exports = {
  logger,
}
