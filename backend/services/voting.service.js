const {
  storeVoteFirebase,
  checkIfProposalEndedByID,
  hasUserVotedByID,
} = require('../storage/firebase')
const { compress, decompress } = require('compress-json')



/***************************|
|        POST Routes        |
|__________________________*/


/**
 *
 */
async function submitVote(req, res) {
  const { newVote } = decompress(req.body)
  if (newVote) {
    const { proposalID, voterAddr, votingPowers } = newVote

    // Check #1
    if (!(voterAddr && voterAddr.length > 0)
        || !(proposalID && proposalID.length > 0)
        || !(votingPowers && votingPowers.length > 0)
    ) {
      res.status(403).json(compress({
        message: "Error - Invalid Vote Ballot Parameters.",
      }))
    }

    // Check #2
    let hasNanVals = false
    let atLeastOneSelected = false
    for (let i = 0; i < votingPowers.length; ++i) {
      const parsedVal = parseInt(votingPowers[i], 10)
      if (Number.isNaN(parsedVal)) {
        hasNanVals = true
      } else if (parsedVal) {
        atLeastOneSelected = true
      }
    }
    if (hasNanVals) {
      res.status(403).json(compress({
        message: "Error - NaN Voting Power(s) -- Invalid Vote Ballot Parameters.",
      }))
    }
    if (!atLeastOneSelected) {
      res.status(403).json(compress({
        message: "Error - No Options Selected -- Invalid Vote Ballot Parameters.",
      }))
    }

    // Check #3
    const hasVoted = await hasUserVotedByID(voterAddr, proposalID)
    if (hasVoted) {
      res.status(403).json(compress({
        message: "Error - Wallet address given has already voted on this proposal.",
      }))
    }

    // Check #4
    const hasEnded = await checkIfProposalEndedByID(proposalID)
    if (hasEnded) {
      res.status(403).json(compress({
        message: "Error - Proposal Status === CLOSED",
      }))
    }

    // console.log(`[VOTING API] - ${proposalID} - newVote(${voterAddr}): `, newVote)

    // 1) store in firebase
    const storeFirebaseRes = await storeVoteFirebase(newVote)
    if (!storeFirebaseRes) {
      res.status(403).json(compress({
        message: "Error Adding Vote to Firestore",
      }))
    }

    // 2) send response back
    res.status(200).json(compress({
      proposalID: proposalID,
      voterAddr: voterAddr,
      storeFirebaseRes: true,
    }))
  } else {
    res.status(403).json(compress({
      message: 'Invalid Submit Vote Request',
    }))
  }
}


module.exports = {
  submitVote,
}
