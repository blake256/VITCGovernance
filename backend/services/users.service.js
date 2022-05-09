const { compress, decompress } = require('compress-json')
const {
  firestoreAuth,
  isUserWhitelisted,
} = require('../storage/firebase')


/***************************|
|        POST Routes        |
|__________________________*/


/**
 *
 */
async function requestLogin(req, res) {
  const { payload } = decompress(req.body)
  const { accounts } = payload.params[0]

  if (accounts && accounts[0]) {
    const address = accounts[0]
    const whitelisted = isUserWhitelisted(address)
    const token = await firestoreAuth.createCustomToken(address, {
      whitelisted: whitelisted,
    })

    if (token.error) {
      res.status(403).json(compress({
        message: 'Error Generating User Token',
      }))
    }

    res.status(200).json(compress({
      token: token,
      user: {
        address: address,
        whitelisted: whitelisted,
      },
    }))
  } else {
    res.status(403).json(compress({
      message: 'Invalid Wallet Payload',
    }))
  }
}


module.exports = {
  requestLogin,
}
