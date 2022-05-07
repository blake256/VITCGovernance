require('dotenv').config()
const admin = require('firebase-admin/app')
const { getFirestore } = require('firebase-admin/firestore')
const { getStorage } = require('firebase-admin/storage')
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
// User
let userMap = null
let userKeys = []

// Firebase App Init
const backendFirebaseApp = admin.initializeApp({
  credential: admin.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_DEFAULT_BUCKET_PATH,
})

// Firestore
const firestoreDB = getFirestore(backendFirebaseApp)
firestoreDB.settings({ ignoreUndefinedProperties: true })

// Firestore Doc Refs
const proposalsMapDocRef = firestoreDB.collection('proposals').doc('proposals-map')
const proposalStatsDocRef = firestoreDB.collection('stats').doc('proposal-stats')
const votingMapDocRef = firestoreDB.collection('voting').doc('voting-map')
const userMapDocRef = firestoreDB.collection('users').doc('user-map')

// Firebase Auth
const firestoreAuth = getAuth(backendFirebaseApp)

// Asset/File Storage
// const fileStorage = getStorage(backendFirebaseApp)
// const defaultBucket = fileStorage.bucket()

// Whitelisted Addrs List
const whitelistedAddrsList = Object.values(whitelistedAddrsJson)


/*********************|
|        Utils        |
|____________________*/


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

/**
 *
 */
// async function getDataURLByID(fileName = '', expireTimeMins = 0) {
//   if (fileName === '') {
//     return null
//   }
// 
//   let msExpireTime = 0
//   if (expireTimeMins <= 0) {
//     // Default expire time of 4 hours 20 minutes
//     msExpireTime = Date.now() + (260 * 60 * 1000)
//   } else {
//     msExpireTime = Date.now() + (expireTimeMins * 60 * 1000)
//   }
// 
//   // Get a v4 signed URL for reading the file
//   // These opts allow temporary read access (15 mins)
//   return defaultBucket.file(fileName).getSignedUrl({
//     version: 'v4',
//     action: 'read',
//     expires: msExpireTime,
//   })
// }

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
          const endDateTime = parseInt(endDateTimeStr, 10)
          const schedulerRes = handleProposalStart(proposalID, new Date(endDateTime))
          // console.log(`Proposal ${proposalID} Rescheduled: `, schedulerRes)
        }
      }
    }
  }

  // Check what jobs are scheduled
  // console.log('scheduledJobs: ', nodeSchedule.scheduledJobs)
}

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
  userMap = (await userMapDocRef.get()).data()
  userKeys = Object.keys(userMap)
  await setCacheData('userMap', userMap)
  await setCacheData('userKeys', userKeys)
  // console.log('userKeys: ', userKeys)

  //
  await checkForOverdueProposals()
}

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


/*************************|
|        Proposals        |
|________________________*/


/**
 *
 */
async function getProposalsMap() {
  if (!proposalsMap) {
    console.log('getProposalsMap() proposalsMap is NULL - Reading Cache...')
    proposalsMap = await getCacheData('proposalsMap')
    console.log('getProposalsMap() Cache Read')
  }

  return proposalsMap
}

/**
 *
 */
async function getProposalByID(proposalID) {
  if (!proposalsMap) {
    const cacheProposalsMap = await getCacheData('proposalsMap')
    if (!cacheProposalsMap) {
      proposalsMap = (await proposalsMapDocRef.get()).data()
    } else {
      proposalsMap = cacheProposalsMap
    }
  }

  return proposalsMap[`${proposalID}`]
}

/**
 *
 */
async function getProposalOptionsByID(proposalID) {
  if (!proposalsMap) {
    const cacheProposalsMap = await getCacheData('proposalsMap')
    if (!cacheProposalsMap) {
      proposalsMap = (await proposalsMapDocRef.get()).data()
    } else {
      proposalsMap = cacheProposalsMap
    }
  }

  return proposalsMap[`${proposalID}`].options
}

/**
 *
 */
async function checkIfProposalEndedByID(proposalID) {
  if (!proposalsMap) {
    const cacheProposalsMap = await getCacheData('proposalsMap')
    if (!cacheProposalsMap) {
      proposalsMap = (await proposalsMapDocRef.get()).data()
    } else {
      proposalsMap = cacheProposalsMap
    }
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
 *
 */
async function setProposalByID(newProposal) {
  const tempProposalMapObj = {}
  const proposalIDString = `${newProposal.proposalID}`
  tempProposalMapObj[proposalIDString] = newProposal
  if (proposalsMap) {
    proposalsMap[proposalIDString] = newProposal
  }
  setCacheData('proposalsMap', proposalsMap)

  return proposalsMapDocRef.set(tempProposalMapObj, { merge: true })
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
    castedVotes: {},
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
 * Check if wallet addr is new
 */
async function isNewUser(walletAddr) {
  if (!walletAddr || walletAddr === '') {
    return false
  }

  if (!userKeys) {
    if (!userMap) {
      const cacheUserKeys = await getCacheData('userKeys')
      if (!cacheUserKeys) {
        userMap = (await userMapDocRef.get()).data()
        userKeys = Object.keys(userMap)
      } else {
        userKeys = cacheUserKeys
      }
    } else {
      userKeys = Object.keys(userMap)
    }
  }

  if (!userKeys.includes(walletAddr)) {
    return true
  }

  return false
}

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
 *
 */
async function storeNewUser(walletAddr) {
  if (!walletAddr || walletAddr === '') {
    return null
  }

  if (!userKeys) {
    if (!userMap) {
      const cacheUserKeys = await getCacheData('userKeys')
      if (!cacheUserKeys) {
        userMap = (await userMapDocRef.get()).data()
        userKeys = Object.keys(userMap)
      } else {
        userKeys = cacheUserKeys
      }
    } else {
      userKeys = Object.keys(userMap)
    }
  }

  if (userKeys.includes(walletAddr)) {
    return null
  }

  // 1) Init voting stats object
  const userObjInit = {
    proposalsVotedOn: [],
  }

  // 2) Add new voting stats object
  const tempUserMapObj = {}
  const userIDString = `${walletAddr}`
  tempUserMapObj[userIDString] = userObjInit
  userMap[userIDString] = userObjInit
  setCacheData('userMap', userMap)

  return userMapDocRef.set(tempUserMapObj, { merge: true })
}

/**
 *
 */
async function updateVotedOnByUser(walletAddr, proposalID) {
  if (!walletAddr || !proposalID || walletAddr === '' || proposalID === '') {
    return null
  }

  if (!userKeys) {
    if (!userMap) {
      const cacheUserKeys = await getCacheData('userKeys')
      if (!cacheUserKeys) {
        userMap = (await userMapDocRef.get()).data()
        userKeys = Object.keys(userMap)
      } else {
        userKeys = cacheUserKeys
      }
    } else {
      userKeys = Object.keys(userMap)
    }
  }

  let tempUserMapObj = {}
  const userIDString = `${walletAddr}`
  tempUserMapObj[userIDString] = userMap[userIDString]
  tempUserMapObj[userIDString].proposalsVotedOn.push(proposalID)
  userMap[userIDString] = tempUserMapObj[userIDString]
  setCacheData('userMap', userMap)

  // Update user custom claims
  await firestoreAuth.setCustomUserClaims(walletAddr, {
    whitelisted: isUserWhitelisted(walletAddr),
    proposalsVotedOn: userMap[userIDString].proposalsVotedOn,
  })

  return userMapDocRef.set(tempUserMapObj, { merge: true })
}

/**
 *
 */
async function getProposalsVotedOnByUser(walletAddr) {
  if (!walletAddr || walletAddr === '') {
    return []
  }

  if (!userKeys) {
    if (!userMap) {
      const cacheUserKeys = await getCacheData('userKeys')
      if (!cacheUserKeys) {
        userMap = (await userMapDocRef.get()).data()
        userKeys = Object.keys(userMap)
      } else {
        userKeys = cacheUserKeys
      }
    } else {
      userKeys = Object.keys(userMap)
    }
  }

  if (!userKeys.includes(walletAddr)) {
    return []
  }

  return userMap[walletAddr].proposalsVotedOn
}

/**
 * Check if user voted for proposal already
 */
async function hasUserVotedByID(walletAddr, proposalID) {
  if (!walletAddr || walletAddr === '' || !proposalID || proposalID === '') {
    return false
  }

  const proposalsVotedOn = await getProposalsVotedOnByUser(walletAddr)
  if (proposalsVotedOn.includes(proposalID)) {
    return true
  }

  return false
}


/**********************|
|        Voting        |
|_____________________*/


/**
 * Store a new vote in Firestore
 */
async function storeVoteFirebase(newVote) {
  const { voterAddr, proposalID, votingPowers } = newVote
  let tempVotingMapObj = {}
  let proposalVotingStats = null
  const voteIDString = `${proposalID}`

  //
  if (!votingMap) {
    await getVotingMap()
  }

  if (votingMap[voteIDString]) {
    proposalVotingStats = votingMap[voteIDString]
  }

  if (proposalVotingStats) {
    const { castedVotes, optionStats, totalVotes } = proposalVotingStats

    //
    const newStatTotals = []
    for (let i = 0; i < votingPowers.length; ++i) {
      const optionTotalVotes = optionStats[i].optionTotalVotes
      const optionTotalPowers = optionStats[i].optionTotalVotingPower

      if (votingPowers[i]) {
        const votingPower = parseInt(votingPowers[i], 10)
        const parsedPower = votingPower ? (votingPower / 100) : 0
        newStatTotals[i] = {
          optionTotalVotes: optionTotalVotes + 1,
          optionTotalVotingPower: optionTotalPowers + parsedPower,
        }
      } else {
        newStatTotals[i] = {
          optionTotalVotes: optionTotalVotes,
          optionTotalVotingPower: optionTotalPowers,
        }
      }
    }

    //
    castedVotes[`${voterAddr}`] = {
      timestamp: new Date(),
      votingPowers: votingPowers,
    }

    //
    tempVotingMapObj[voteIDString] = proposalVotingStats
    tempVotingMapObj[voteIDString].totalVotes = (totalVotes + 1)
    tempVotingMapObj[voteIDString].optionStats = newStatTotals
    tempVotingMapObj[voteIDString].castedVotes = castedVotes
    votingMap[voteIDString] = tempVotingMapObj[voteIDString]
    setCacheData('votingMap', votingMap)

    //
    await updateVotedOnByUser(voterAddr, proposalID)
  }

  return votingMapDocRef.set(tempVotingMapObj, { merge: true })
}

/**
 *
 */
function getVotingStatsByID(proposalID) {
  return votingMap[`${proposalID}`]
}


module.exports = {
  firestoreDB,
  firestoreAuth,
  hasDatePassed,
  checkIfProposalEndedByID,
  initializeStorage,
  // getDataURLByID,
  getProposalsMap,
  getProposalByID,
  getProposalOptionsByID,
  storeProposalFirebase,
  onProposalEnd,
  getCurrProposalStats,
  storeVoteFirebase,
  getVotingStatsByID,
  isNewUser,
  isUserWhitelisted,
  getProposalsVotedOnByUser,
  hasUserVotedByID,
  storeNewUser,
}
