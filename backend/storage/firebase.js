require('dotenv').config()
const admin = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getAuth } = require('firebase-admin/auth')
const serviceAccount = require(process.env.FIREBASE_KEY_PATH)
const whitelistedAddrsJson = require(process.env.WHITELISTED_ADDRS_PATH)
const {
  getCacheData,
  setCacheData,
} = require ('./cacheMgr')
const {
  handleProposalStart,
  handleProposalEnd,
} = require('../scheduler')
const { newProposalUpdate } = require('../bots/discordBot')

// Global Containers
// Proposals
let proposalsMap = null
let proposalStats = {
  totalNumProposals: 0,
  totalActiveProposals: 0,
  totalClosedProposals: 0,
}

// Voting
let votingMap = null

// Firebase App Init
const backendFirebaseApp = admin.initializeApp({
  credential: admin.cert(serviceAccount),
})

// Firestore
const firestoreDB = getFirestore(backendFirebaseApp)
firestoreDB.settings({ ignoreUndefinedProperties: true })

// Firestore Doc Refs
const proposalsMapDocRef = firestoreDB.collection('proposals').doc('proposals-map')
const proposalStatsDocRef = firestoreDB.collection('stats').doc('proposal-stats')
const votingMapDocRef = firestoreDB.collection('voting').doc('voting-map')

// Firebase Auth
const firestoreAuth = getAuth(backendFirebaseApp)

// Whitelisted Addrs List
const whitelistedAddrsList = Object.values(whitelistedAddrsJson)


/*********************|
|        Utils        |
|____________________*/

/**
 *
 */
 async function initializeStorage() {
  console.log('Initializing Backend Storage...')

  //
  proposalsMap = (await proposalsMapDocRef.get()).data()
  await setCacheData('proposalsMap', proposalsMap)

  //
  proposalStats = (await proposalStatsDocRef.get()).data()
  await setCacheData('proposalStats', proposalStats)

  //
  votingMap = (await votingMapDocRef.get()).data()
  await setCacheData('votingMap', votingMap)

  //
  await checkForOverdueProposals()
}

/**
 *
 */
async function checkForOverdueProposals() {
  console.log('Looking for any proposals that ended...')

  //
  if (!proposalsMap) {
    proposalsMap = (await proposalsMapDocRef.get()).data()
  }

  const proposalsArr = Object.values(proposalsMap)
  for (let i = 0; i < proposalsArr.length; ++i) {
    const proposalObj = proposalsArr[i]
    if (proposalObj) {
      if (proposalObj.status === 'Active') {
        const proposalID = proposalObj.proposalID
        const endDateTimeStr = proposalObj.endDate
        if (hasDatePassed(endDateTimeStr)) {
          console.log('Overdue Proposal found, handling now: ', proposalID)
          await handleProposalEnd(proposalID)
          console.log(`Proposal ${proposalID} is now closed.`)
        } else {
          console.log(`Rescheduling ${proposalID} onEnded callback`)
          handleProposalStart(proposalID, new Date(parseInt(endDateTimeStr, 10)))
          newProposalUpdate(proposalObj)
        }
      }
    }
  }
}

/**
 *
 */
 function hasDatePassed(endDateTimeStr = '') {
  if (endDateTimeStr === '') {
    return false
  }

  const today = new Date()
  const endDateTime = parseInt(endDateTimeStr, 10)
  if (today.getTime() > endDateTime) {
    return true
  }

  return false
}


/*************************|
|        Proposals        |
|________________________*/


/**
 *
 */
 async function getProposalStats() {
  if (!proposalStats) {
    const cacheProposalStats = await getCacheData('proposalStats')
    if (!cacheProposalStats) {
      proposalStats = (await proposalStatsDocRef.get()).data()
    } else {
      proposalStats = cacheProposalStats
    }
  }

  return true
}

/**
 *
 */
async function getProposalsMap() {
  if (!proposalsMap) {
    const cacheProposalsMap = await getCacheData('proposalsMap')
    if (!cacheProposalsMap) {
      proposalsMap = (await proposalsMapDocRef.get()).data()
    } else {
      proposalsMap = cacheProposalsMap
    }
  }

  return proposalsMap
}

/**
 *
 */
async function getProposalByID(proposalID) {
  if (!proposalsMap) {
    await getProposalsMap()
  }

  return proposalsMap[`${proposalID}`]
}

/**
 *
 */
 async function setProposalByID(newProposal) {
  if (!proposalsMap) {
    await getProposalsMap()
  }

  if (proposalsMap) {
    proposalsMap[`${newProposal.proposalID}`] = newProposal
    setCacheData('proposalsMap', proposalsMap)
    return proposalsMapDocRef.set(proposalsMap, { merge: true })
  }

  return null
}

/**
 *
 */
async function getProposalOptionsByID(proposalID) {
  if (!proposalsMap) {
    await getProposalsMap()
  }

  return proposalsMap[`${proposalID}`].options
}

/**
 *
 */
async function checkIfProposalEndedByID(proposalID) {
  if (!proposalsMap) {
    await getProposalsMap()
  }

  if (!proposalsMap[`${proposalID}`].endDate) {
    return undefined
  }

  if (hasDatePassed(proposalsMap[`${proposalID}`].endDate)) {
    return true
  }

  return false
}

/**
 * Store a new proposal in Firestore
 */
async function storeProposalFirebase(newProposal) {
  if (!newProposal.proposalID) {
    return null
  }

  // 1) Init voting stats object
  const voteStatsInit = {
    totalVotes: 0,
    totalVotingPower: 0,
    optionStats: new Array(newProposal.numOptions).fill({
      optionTotalVotes: 0,
      optionTotalVotingPower: 0,
    }),
    results: {
      winningOptionName: '',
      winningOptionIndex: 0,
    },
    castedVotes: [],
    voterList: [],
  }

  // 2) Add new voting stats object
  const tempVotingMapObj = {}
  const voteIDString = `${newProposal.proposalID}`
  tempVotingMapObj[voteIDString] = voteStatsInit
  if (!votingMap) {
    await getVotingMap()
  }
  votingMap[voteIDString] = voteStatsInit
  setCacheData('votingMap', votingMap)
  votingMapDocRef.set(tempVotingMapObj, { merge: true })

  // 3) Update proposal stats
  if (!proposalStats) {
    await getProposalStats()
  }
  ++proposalStats.totalActiveProposals
  ++proposalStats.totalNumProposals
  proposalStatsDocRef.set(proposalStats)
  setCacheData('proposalStats', proposalStats)

  // 4) Update proposals map
  return setProposalByID(newProposal)
}

/**
 * Handle updating docs after a proposal has ended
 */
async function onProposalEnd(proposal, proposalID, proposalResults, optionStats, totalVotingPower) {
  if (!proposal) {
    return null
  }

  // 1) Update proposals map
  const proposalObj = proposal
  proposalObj.status = 'Closed'
  setProposalByID(proposalObj)

  // 2) Update proposal stats
  if (!proposalStats) {
    await getProposalStats()
  }
  --proposalStats.totalActiveProposals
  ++proposalStats.totalClosedProposals
  proposalStatsDocRef.set(proposalStats)
  setCacheData('proposalStats', proposalStats)

  // 3) Update voting stats
  if (!votingMap) {
    await getVotingMap()
  }
  const voteIDString = `${proposalID}`
  const tempVotingMapObj = {}
  tempVotingMapObj[voteIDString] = votingMap[voteIDString]
  tempVotingMapObj[voteIDString].optionStats = optionStats
  tempVotingMapObj[voteIDString].totalVotingPower = totalVotingPower
  tempVotingMapObj[voteIDString].results = proposalResults
  votingMap[voteIDString] = tempVotingMapObj[voteIDString]
  setCacheData('votingMap', votingMap)

  return votingMapDocRef.set(tempVotingMapObj, { merge: true })
}

/**
 *
 */
async function getCurrProposalStats() {
  if (!proposalStats) {
    console.log('getCurrProposalStats() proposalStats is NULL - Reading Cache...')
    proposalStats = await getCacheData('proposalStats')
    console.log('getCurrProposalStats() Cache Read')
  }

  return proposalStats
}


/*********************|
|        Users        |
|____________________*/


/**
 * Check if a user is whitelisted admin
 */
function isUserWhitelisted(walletAddr) {
  if (!walletAddr || walletAddr === '') {
    return false
  }

  if (whitelistedAddrsList.includes(walletAddr)) {
    return true
  }

  return false
}

/**
 * Check if user voted for proposal already
 */
async function hasUserVotedByID(walletAddr, proposalID) {
  if (!walletAddr || walletAddr === '' || !proposalID || proposalID === '') {
    return null
  }

  if (!votingMap) {
    await getVotingMap()
  }

  if (votingMap[`${proposalID}`] && votingMap[`${proposalID}`].voterList) {
    return votingMap[`${proposalID}`].voterList.includes(walletAddr)
  }

  return null
}


/**********************|
|        Voting        |
|_____________________*/


/**
 *
 */
 async function getVotingMap() {
  if (!votingMap) {
    const cacheVotingMap = await getCacheData('votingMap')
    if (!cacheVotingMap) {
      votingMap = (await votingMapDocRef.get()).data()
    } else {
      votingMap = cacheVotingMap
    }
  }

  return true
}

/**
 * Store a new vote in Firestore
 */
async function storeVoteFirebase(newVote) {
  const { voterAddr, proposalID, votingPowers } = newVote
  const voteIDString = `${proposalID}`

  //
  if (!votingMap) {
    await getVotingMap()
  }

  if (votingMap && votingMap[voteIDString]) {
    if (!votingMap[voteIDString].castedVotes || !votingMap[voteIDString].optionStats) {
      return null
    }

    for (let i = 0; i < votingPowers.length; ++i) {
      if (votingPowers[i]) {
        const votingPower = parseFloat(votingPowers[i])
        const parsedPower = votingPower ? (votingPower / 100) : 0
        if (parsedPower > 0) {
          ++votingMap[voteIDString].optionStats[i].optionTotalVotes
          votingMap[voteIDString].optionStats[i].optionTotalVotingPower += parsedPower
        }
      }
    }

    votingMap[voteIDString].castedVotes.push({
      timestamp: new Date(),
      voterAddr: voterAddr,
      votingPowers: votingPowers,
    })

    ++votingMap[voteIDString].totalVotes
    votingMap[voteIDString].voterList.push(voterAddr)

    setCacheData('votingMap', votingMap)
    return votingMapDocRef.set(votingMap, { merge: true })
  }

  return null
}

/**
 *
 */
async function getVotingStatsByID(proposalID) {
  if (!votingMap) {
    await getVotingMap()
  }

  return votingMap[`${proposalID}`]
}


module.exports = {
  firestoreDB,
  firestoreAuth,
  hasDatePassed,
  checkIfProposalEndedByID,
  initializeStorage,
  getProposalsMap,
  getProposalByID,
  getProposalOptionsByID,
  storeProposalFirebase,
  onProposalEnd,
  getCurrProposalStats,
  storeVoteFirebase,
  getVotingStatsByID,
  isUserWhitelisted,
  hasUserVotedByID,
}
