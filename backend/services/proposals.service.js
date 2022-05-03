const { WS_RPC } = require('@vite/vitejs-ws')
const { ViteAPI } = require('@vite/vitejs')
const { compress, decompress } = require('compress-json')
const { handleProposalStart } = require('../scheduler')
const {
  getCacheData,
  setCacheData,
} = require ('../storage/cacheMgr')
const {
  storeProposalFirebase,
  hasDatePassed,
  isUserWhitelisted,
} = require('../storage/firebase')


// const TEST_WS_NET = 'wss://buidl.vite.net/gvite/ws'
const LIVE_WS_NET = 'wss://node.vite.net/gvite/ws'
const VITE_WSS = LIVE_WS_NET



/**************************|
|        GET Routes        |
|_________________________*/


/**
 *
 */
async function _connectViteProvider() {
  try {
    return new ViteAPI(new WS_RPC(VITE_WSS), () => {
      // console.log('[LOG]: VITE API CLIENT CONNECTED')
    })
  } catch (err) {
    if (err) {
      return new ViteAPI(new WS_RPC(VITE_WSS), () => {
        // console.log('[LOG]: VITE API CLIENT CONNECTED')
      })
    }
  }

  return null
}

/**
 *
 */
async function _getTokenList() {
  const tokenList = []
  const viteProvider = await _connectViteProvider()
  if (viteProvider) {
    const currTime = new Date()
    const tokenInfo = await viteProvider.request('contract_getTokenInfoList', 0, 250)
    tokenInfo.tokenInfoList.forEach(value => {
      const tokenSymbol = value.tokenSymbol.toString()
      const tokenId = value.tokenId.toString()
      if (!Number.isNaN(value.tokenSymbol)) {
        tokenList.push({
          label: tokenSymbol,
          value: tokenId,
        })
      }
    })
    tokenList.sort((a, b) => a.label.localeCompare(b.label))
    setCacheData('tokenList', tokenList)
    setCacheData('tokenListCachedTime', currTime.getTime())
  }

  return tokenList
}

/**
 *
 */
async function getTokenInfoList(req, res) {
  let tokenList = null
  const currTime = new Date()
  const tokenListCachedTime = await getCacheData('tokenListCachedTime')
  if (tokenListCachedTime) {
    const cachedLastDate = new Date(tokenListCachedTime)
    const hoursSince = Math.abs(currTime - cachedLastDate) / 36e5
    if (hoursSince < 24) {
      const tokenListCached = await getCacheData('tokenList')
      if (tokenListCached) {
        tokenList = tokenListCached
      }
    }
  }

  if (!tokenList) {
    tokenList = await _getTokenList()
  }

  if (tokenList) {
    res.status(200).json(compress({
      tokenList: tokenList,
    }))
  } else {
    res.status(403).json(compress({
      message: "Error - Unable to create Vite provider connection.",
    }))
  }
}


/***************************|
|        POST Routes        |
|__________________________*/


/**
 *
 */
async function createProposal(req, res) {
  const { newProposal } = decompress(req.body)
  if (newProposal) {
    const {
      proposalID,
      endDate,
      creator,
      title,
      description,
      numOptions,
      votingPeriod,
      votingTokens,
    } = newProposal

    // Check #1
    const whitelisted = isUserWhitelisted(creator)
    if (!whitelisted) {
      res.status(403).json(compress({
        message: "Error - Nice Try!",
      }))
    }

    // Check #2
    if (hasDatePassed(endDate)) {
      res.status(403).json(compress({
        message: "Error - Invalid End Date.",
      }))
    }

    // Check #3
    if (!(numOptions && numOptions > 0)
        || !(title && title.length > 0)
        || !(description && description.length > 0)
        || !(votingPeriod && votingPeriod > 0)
        || !votingTokens
    ) {
      res.status(403).json(compress({
        message: "Error - Invalid Proposal Info.",
      }))
    }

    // 1) store in firebase
    const storeFirebaseRes = await storeProposalFirebase(newProposal)
    if (!storeFirebaseRes) {
      res.status(403).json(compress({
        message: "Error Adding Proposal to Firestore",
      }))
    }

    // 2) start proposal event scheduler
    const endDateTime = parseInt(endDate, 10)
    const schedulerRes = handleProposalStart(proposalID, new Date(endDateTime))
    if (!schedulerRes) {
      res.status(403).json(compress({
        message: "Error Scheduling Proposal Events",
      }))
    }

    // 3) send response back
    res.status(200).json(compress({
      proposalID: proposalID,
      storeFirebaseRes: true,
      schedulerRes: true,
    }))
  } else {
    res.status(403).json(compress({
      message: 'Invalid New Proposal Request',
    }))
  }
}


module.exports = {
  getTokenInfoList,
  createProposal,
}
