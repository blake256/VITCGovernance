require('dotenv').config()
const { Client, Intents, MessageEmbed } = require('discord.js')
const {
  getProposalByID,
  getProposalOptionsByID,
} = require('../storage/firebase')

// const viewProposalPath = 'https://vote.vitc.org/proposal/'
const viewProposalPath = 'https://vitamincoin-dao-tools--testnet-qqxn31qr.web.app/proposal/'
const vitcScanAddrPath = 'https://vitcscan.com/address/'

const botIntents = new Intents()
botIntents.add(
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_SCHEDULED_EVENTS,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
  Intents.FLAGS.GUILD_MEMBERS,
  Intents.FLAGS.GUILD_WEBHOOKS,
)
const discordClient = new Client({
  intents: botIntents,
})
discordClient.login(process.env.DISCORD_TOKEN)


/**
 *
 */
async function newProposalUpdate(newProposal) {
  if (!newProposal) {
    return null
  }

  const proposalsChannel = discordClient.channels.cache.get(process.env.PROPOSALS_SERVER_ID)
  if (!proposalsChannel) {
    return null
  }

  const {
    proposalID,
    endDate,
    creator,
    title,
    description,
    numOptions,
    options,
    votingTokens,
    votingType,
  } = newProposal

  const endDateParsed = new Date(parseInt(endDate, 10))
  const newMessage = new MessageEmbed()
  newMessage.setColor('#40c0e6')
  newMessage.setThumbnail(process.env.PROPOSALS_LOGO_PATH)
  newMessage.setTitle(title)
  newMessage.setURL(`${viewProposalPath}${proposalID}`)
  newMessage.setDescription(description)
  const preSubStr = creator.substr(0, 12)
  const postSubStr = creator.substr(creator.length - 7, creator.length)
  newMessage.setAuthor({
    name: `${preSubStr}...${postSubStr}`,
    url: `${vitcScanAddrPath}${creator}`,
  })
  newMessage.addField('Voting Type:', votingType)
  newMessage.addField('End Date:', endDateParsed.toUTCString())

  const votingTokensNames = []
  for (let i = 0; i < votingTokens.length; ++i) {
    votingTokensNames.push(votingTokens[i].tokenName)
  }
  newMessage.addField('Voting Tokens:', votingTokensNames.join([separator = ', ']))
  newMessage.addField('Options:', '\u200b')
  for (let i = 0; i < numOptions; ++i) {
    newMessage.addField(options[i].optionName, '\u200b', true)
  }
  // newMessage.setFooter({
  //   text: 'Some footer text here',
  //   iconURL: 'https://i.imgur.com/AfFp7pu.png',
  // })
  newMessage.setTimestamp()

  proposalsChannel.send({ embeds: [newMessage] })
}

/**
 *
 */
async function newVoteUpdate(newVote) {
  if (!newVote) {
    return null
  }

  const votesChannel = discordClient.channels.cache.get(process.env.VOTES_SERVER_ID)
  if (!votesChannel) {
    return null
  }

  const {
    proposalID,
    voterAddr,
    votingPowers,
  } = newVote

  const newMessage = new MessageEmbed()
  newMessage.setColor('#00b600')
  newMessage.setThumbnail(process.env.VOTES_LOGO_PATH)
  newMessage.setTitle(`New Vote - (${proposalID}):`)
  newMessage.setURL(`${viewProposalPath}${proposalID}`)
  newMessage.setDescription(`New vote submitted on proposal ${proposalID}.`)
  const preSubStr = voterAddr.substr(0, 12)
  const postSubStr = voterAddr.substr(voterAddr.length - 7, voterAddr.length)
  newMessage.setAuthor({
    name: `${preSubStr}...${postSubStr}`,
    url: `${vitcScanAddrPath}${voterAddr}`,
  })

  const proposalOpts = await getProposalOptionsByID(proposalID)
  for (let i = 0; i < votingPowers.length; ++i) {
    newMessage.addField(`${proposalOpts[i].optionName}:`, `${votingPowers[i].toPrecision(3)}%`, true)
  }
  // newMessage.setFooter({
  //   text: 'Some footer text here',
  //   iconURL: 'https://i.imgur.com/AfFp7pu.png',
  // })
  newMessage.setTimestamp()

  votesChannel.send({ embeds: [newMessage] })
}

/**
 *
 */
async function newResultUpdate(newResult) {
  if (!newResult) {
    return null
  }

  const resultsChannel = discordClient.channels.cache.get(process.env.RESULTS_SERVER_ID)
  if (!resultsChannel) {
    return null
  }

  const {
    proposalID,
    proposalResults,
    currOptionStats,
    currTotalVotingPower,
  } = newResult

  const newMessage = new MessageEmbed()
  newMessage.setColor('#b80202')
  newMessage.setThumbnail(process.env.RESULTS_LOGO_PATH)
  newMessage.setURL(`${viewProposalPath}${proposalID}`)
  newMessage.setDescription(`Proposal results are in for ${proposalID}, check out what was voted for most!`)
  newMessage.addField('Winning Option Result:', '\u200b', false)

  if (proposalResults && proposalResults.winningOptionName) {
    if (currOptionStats && currOptionStats[proposalResults.winningOptionIndex]) {
      const winningOptTotalPower = currOptionStats[proposalResults.winningOptionIndex].optionTotalVotingPower
      newMessage.addField(`${proposalResults.winningOptionName} with ${winningOptTotalPower} votes.`, '\u200b')
    }
  }

  const proposalObj = await getProposalByID(proposalID)
  if (proposalObj) {
    newMessage.addField('All Options Results:', '\u200b', false)
    const proposalOpts = proposalObj.options
    newMessage.setTitle(proposalObj.title)
    for (let i = 0; i < currOptionStats.length; ++i) {
      const optVotingPower = currOptionStats[i].optionTotalVotingPower
      newMessage.addField(`${proposalOpts[i].optionName}:`, `${optVotingPower ? optVotingPower : 0}`, true)
    }
  }

  if (currTotalVotingPower) {
    newMessage.addField('Total Voting Power on Proposal:', `${currTotalVotingPower}`)
  }
  // newMessage.setFooter({
  //   text: 'Some footer text here',
  //   iconURL: 'https://i.imgur.com/AfFp7pu.png',
  // })
  newMessage.setTimestamp()

  resultsChannel.send({ embeds: [newMessage] })
}


module.exports = {
  newProposalUpdate,
  newVoteUpdate,
  newResultUpdate,
}
