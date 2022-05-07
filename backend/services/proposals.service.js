const { compress, decompress } = require('compress-json')
const { handleProposalStart } = require('../scheduler')
const { newProposalUpdate } = require('../bots/discordBot')
const {
  storeProposalFirebase,
  hasDatePassed,
  isUserWhitelisted,
} = require('../storage/firebase')


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

    // 4) update discord channel 'proposals'
    newProposalUpdate(newProposal)
  } else {
    res.status(403).json(compress({
      message: 'Invalid New Proposal Request',
    }))
  }
}


module.exports = {
  createProposal,
}
