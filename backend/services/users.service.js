const { compress, decompress } = require('compress-json')
const {
  firestoreAuth,
  isNewUser,
  isUserWhitelisted,
  storeNewUser,
  getProposalsVotedOnByUser,
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
    let proposalsVotedOn = []
    const address = accounts[0]
    const whitelisted = isUserWhitelisted(address)
    const newUser = await isNewUser(address)

    if (newUser) {
      await storeNewUser(address)
    } else {
      proposalsVotedOn = await getProposalsVotedOnByUser(address)
    }

    const token = await firestoreAuth.createCustomToken(address, {
      whitelisted: whitelisted,
      proposalsVotedOn: proposalsVotedOn,
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
