const nodeSchedule = require('node-schedule')

/**
 *
 */
async function handleProposalEnd(proposalID) {
  // REQUIRES START
  const BigNumber = require('bignumber.js')
  const {
    getProposalByID,
    getVotingStatsByID,
    onProposalEnd,
    hasDatePassed,
  } = require('./storage/firebase')
  const {
    getWalletBalanceInfo,
    selfSignCallContract,
  } = require('./vite/walletUtils')
  const { proposalsContract } = require('./vite/contractInfo')
  // REQUIRES END

  //
  const proposalObj = await getProposalByID(proposalID)
  if (proposalObj && proposalObj.status === 'Active' && hasDatePassed(proposalObj.endDate)) {
    const votingTokenArr = []
    const proposalResults = {
      winningOptionName: '',
      winningOptionIndex: -1,
    }
    const votingStatsObj = getVotingStatsByID(proposalID)
    if (votingStatsObj) {
      let currTotalVotingPower = 0
      let highestVotingPower = 0
      const votingTokens = Object.values(proposalObj.votingTokens)
      const currOptionStats = Object.values(votingStatsObj.optionStats)
      const currCastedVotes = Object.values(votingStatsObj.castedVotes)
      const castedVotesKeys = Object.keys(votingStatsObj.castedVotes)
      const optionVotingTotals = new Array(currOptionStats.length).fill(0)

      //
      for (let i = 0; i < votingTokens.length; ++i) {
        votingTokenArr.push(votingTokens[i].tokenTTI)
      }

      //
      for (let i = 0; i < currOptionStats.length; ++i) {
        const optionStat = currOptionStats[i]
        const optionStatPower = optionStat.optionTotalVotingPower
        currOptionStats[i].optionTotalVotingPower -= optionStatPower
      }

      //
      for (let i = 0; i < currCastedVotes.length; ++i) {
        //
        const voteObj = currCastedVotes[i]
        if (voteObj) {
          const voterAddr = castedVotesKeys[i]
          let totalVotingPower = 0
          // Possible FIX ME - Do more checks for errors here
          const balancesArr = Object.values((await getWalletBalanceInfo(voterAddr)).balance.balanceInfoMap)
          const votingPowersArr = Object.values(voteObj.votingPowers)

          //
          for (let balanceIndex = 0; balanceIndex < balancesArr.length; ++balanceIndex) {
            const balanceVal = balancesArr[balanceIndex]
            if (votingTokenArr.includes(balanceVal.tokenInfo.tokenId)) {
              totalVotingPower += parseFloat(BigNumber(balanceVal.balance).dividedBy(`1e${balanceVal.tokenInfo.decimals}`))
            }
          }

          //
          for (let powerIndex = 0; powerIndex < votingPowersArr.length; ++powerIndex) {
            const power = votingPowersArr[powerIndex]
            if (power > 0) {
              let newPower = (power / 100) * totalVotingPower
              if (proposalObj.votingType === 'Quadratic') {
                const temp = newPower
                newPower = Math.round(Math.sqrt(temp))
              }

              voteObj.votingPowers[powerIndex] = newPower
              currOptionStats[powerIndex].optionTotalVotingPower += newPower
              optionVotingTotals[powerIndex] = currOptionStats[powerIndex].optionTotalVotingPower
              currTotalVotingPower += newPower
              if (highestVotingPower < currOptionStats[powerIndex].optionTotalVotingPower) {
                proposalResults.winningOptionName = proposalObj.options[powerIndex].optionName
                proposalResults.winningOptionIndex = powerIndex
                highestVotingPower = currOptionStats[powerIndex].optionTotalVotingPower
              }
            }
          }
        }
      }

      //
      const parsedTotalVotingPower = parseInt(currTotalVotingPower, 10)
      const currTotalVotingPowerFixed = parsedTotalVotingPower ? parsedTotalVotingPower : 0

      //
      for (let i = 0; i < optionVotingTotals.length; ++i) {
        const optVal = parseInt(optionVotingTotals[i], 10)
        if (optVal) {
          optionVotingTotals[i] = optVal
        } else {
          optionVotingTotals[i] = 0
        }
      }

      //
      const storeRes = await onProposalEnd(proposalObj, proposalID, proposalResults, currOptionStats, currTotalVotingPower)
      console.log('storeRes: ', storeRes)
      await selfSignCallContract(proposalsContract, 'adminProposalEnd', [
        proposalID,
        currTotalVotingPowerFixed,
        optionVotingTotals,
      ]).catch(()=> {
      })
    }
  }
}

/**
 *
 */
function handleProposalStart(proposalID, endDate) {
  return nodeSchedule.scheduleJob(new Date(endDate), function(){ handleProposalEnd(proposalID) })
}

module.exports = {
  nodeSchedule,
  handleProposalStart,
  handleProposalEnd,
}
