import Vue from 'vue'
import Vuex from 'vuex'
import Connector from '@vite/connector'
import { AvatarGenerator } from 'random-avatar-generator'
import eventBus from '@/utils/events/eventBus'
import { requestLogin, sendVcTx } from '@/utils/api/apiUtils'
import { signOutCurrentUser } from '@/firebase/firebase'

const { accountBlock } = require('@vite/vitejs')

const { createAccountBlock } = accountBlock

// const { WS_RPC } = require('@vite/vitejs-ws')
// const { ViteAPI, abi } = require('@vite/vitejs')
//
const proposalsContract = require('@/utils/contract/contractInfo')
//
// Vite Connect Server URL
const BRIDGE = 'wss://viteconnect.thomiz.dev/'
//
// // Vite Provider (Subscriptions) URL
// const TEST_WS_NET = 'wss://buidl.vite.net/gvite/ws'
// // const LIVE_WS_NET = 'wss://node.vite.net/gvite/ws'
// // const VITE_WSS = process.env.NODE_ENV === 'production' ? LIVE_WS_NET : TEST_WS_NET
// const VITE_WSS = TEST_WS_NET

// Adding window event listener on blur
// window.addEventListener('blur', () => {
//   console.log('[EVENT] blur')
// })

// Adding window event listener on focus
// window.addEventListener('focus', () => {
//   console.log('[EVENT] focus')
// })

// Adding window event listener on beforeunload to sign out current user
window.addEventListener('beforeunload', () => {
  // console.log('[EVENT] beforeUnload - signing user out..')
  signOutCurrentUser()
})

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // Proposals states
    proposals: null,
    proposalsMapObj: null,
    proposalsMapLoaded: false,
    proposalStatuses: null,
    currProposal: null,
    currProposalID: '',
    votingMap: null,
    votingMapLoaded: false,

    // Stats states
    proposalStats: null,
    proposalStatsLoaded: false,
    currProposalVotingStats: {
      totalVotes: 0,
      totalVotingPower: 0,
      winningIndices: [],
      optTotalVotesData: [{
        data: [],
      }],
      optVotingPowerData: [{
        data: [],
      }],
    },
    currVotingStatsLoaded: false,

    // User/Wallet states
    isWalletConnected: false,
    connectedWalletAddr: '',
    vbInstance: null,
    currWalletURI: '',
    currAvatarURL: '',

    // Login Page
    loginSendToPath: '',

    // Contract Subscriptions
    viteProvider: null,
    contractSubRef: null,

  },

  getters: {
    // Proposals getters

    getProposals(state) {
      return state.proposals
    },

    getProposalsMapLoaded(state) {
      return state.proposalsMapLoaded
    },

    getProposalStatuses(state) {
      return state.proposalStatuses
    },

    getProposalsMapObj(state) {
      return state.proposalsMapObj
    },

    getCurrProposal(state) {
      return state.currProposal
    },

    getCurrProposalID(state) {
      return state.currProposalID
    },

    getVotingMap(state) {
      return state.votingMap
    },

    getVotingMapLoaded(state) {
      return state.votingMapLoaded
    },
    // Stats getters

    getProposalStats(state) {
      return state.proposalStats
    },

    getProposalStatsLoaded(state) {
      return state.proposalStatsLoaded
    },

    getCurrProposalVotingStats(state) {
      return state.currProposalVotingStats
    },

    getCurrVotingStatsLoaded(state) {
      return state.currVotingStatsLoaded
    },

    // User/Wallet getters

    getIsWalletConnected(state) {
      return state.isWalletConnected
    },

    getConnectedWalletAddr(state) {
      return state.connectedWalletAddr
    },

    getVbInstance(state) {
      let vbInst = state.vbInstance
      if (!state.vbInstance) {
        vbInst = new Connector({ bridge: BRIDGE })
        // vbInstance connected event
        vbInst.on('connect', async (err, payload) => {
          // console.log('[EVENT] vbInstance CONNECTED')
          const { address } = await requestLogin(payload)

          // Save wallet related states
          state.currAvatarURL = (new AvatarGenerator()).generateRandomAvatar()
          state.isWalletConnected = true
          state.connectedWalletAddr = address
          state.currWalletURI = ''

          // Emit vite wallet connected and user login events
          eventBus.$emit('vite-wallet-connected')
          eventBus.$emit('login-request-successful')

          if (err) {
            // do nothing
          }
        })

        // On Vite wallet disconnected
        vbInst.on('disconnect', err => {
          // console.log('[EVENT] vbInstance DISCONNECTED')
          // Sign out current user
          signOutCurrentUser()

          // Re-init uri and wallet related states
          state.currAvatarURL = ''
          state.isWalletConnected = false
          state.connectedWalletAddr = ''

          // Emit vite wallet disconnected event
          eventBus.$emit('vite-wallet-disconnected')

          if (err) {
            // do nothing
          }
        })
      }

      return vbInst
    },

    getCurrWalletURI(state) {
      return state.currWalletURI
    },

    getCurrAvatarURL(state) {
      return state.currAvatarURL
    },

    getLoginSendToPath(state) {
      return state.loginSendToPath
    },

  },

  mutations: {
    // Init mutations:

    async initializeStore(state) {
      console.log('[Initialize Store]')

      const vbInst = state.vbInstance
      if (!vbInst) {
        state.vbInstance = new Connector({ bridge: BRIDGE })
        // vbInstance connected event
        state.vbInstance.on('connect', async (err, payload) => {
          // console.log('[EVENT] vbInstance CONNECTED')
          const { address } = await requestLogin(payload)

          // Save wallet related states
          state.currAvatarURL = (new AvatarGenerator()).generateRandomAvatar()
          state.isWalletConnected = true
          state.connectedWalletAddr = address
          state.currWalletURI = ''

          // Emit vite wallet connected and user login events
          eventBus.$emit('vite-wallet-connected')
          eventBus.$emit('login-request-successful')

          if (err) {
            // do nothing
          }
        })

        // On Vite wallet disconnected
        state.vbInstance.on('disconnect', err => {
          // console.log('[EVENT] vbInstance DISCONNECTED')
          // Sign out current user
          signOutCurrentUser()

          // Re-init uri and wallet related states
          state.currAvatarURL = ''
          state.isWalletConnected = false
          state.connectedWalletAddr = ''

          // Emit vite wallet disconnected event
          eventBus.$emit('vite-wallet-disconnected')

          if (err) {
            // do nothing
          }
        })
      }

      //
      eventBus.$on('proposals-map-updated', updatedProposalsMap => {
        // console.log('[EVENT] proposals-map-updated')
        if (updatedProposalsMap) {
          state.proposalsMapLoaded = false
          state.proposalsMapObj = updatedProposalsMap
          state.proposals = Object.values(updatedProposalsMap)
          state.proposals.sort((propA, propB) => {
            if (propA.status === propB.status) {
              if (propA.status === 'Active') {
                const propAEndTime = parseInt(propA.endDate, 10)
                const propBEndTime = parseInt(propB.endDate, 10)

                return propAEndTime - propBEndTime
              }

              const propAPublishTime = parseInt(propA.publishDate, 10)
              const propBPublishTime = parseInt(propB.publishDate, 10)

              return propAPublishTime - propBPublishTime
            }

            if (propA.status === 'Closed') {
              return -1
            }

            return 1
          })
          state.proposalsMapLoaded = true
          eventBus.$emit('on-proposals-map-state-updated')
        }
      })

      //
      eventBus.$on('proposal-stats-updated', updatedStats => {
        // console.log('[EVENT] proposal-stats-updated')
        if (updatedStats) {
          state.proposalStatsLoaded = false
          state.proposalStats = updatedStats
          state.proposalStatsLoaded = true
          eventBus.$emit('on-proposal-stats-state-updated')
        }
      })

      //
      eventBus.$on('voting-map-updated', updatedVotingMap => {
        // console.log('[EVENT] voting-map-updated')
        if (updatedVotingMap) {
          state.votingMapLoaded = false
          state.votingMap = updatedVotingMap
          if (state.currProposal) {
            this.commit('initializeCurrProposalVotingStats', state.currProposalID)
          }
          state.votingMapLoaded = true
          eventBus.$emit('on-voting-map-state-updated')
        }
      })

      eventBus.$on('setLoginSendToPath', pathStr => {
        state.loginSendToPath = pathStr
      })

      eventBus.$on('setCurrProposal', proposalID => {
        // console.log('[EVENT] setCurrProposal')
        if (state.proposalsMapObj && state.proposalsMapObj[proposalID]) {
          state.currProposal = state.proposalsMapObj[proposalID]
          state.currProposalID = proposalID
        }
        this.commit('initializeCurrProposalVotingStats', proposalID)
      })

      // Init vite provider connection for subs
      // if (!state.viteProvider) {
      //   try {
      //     state.viteProvider = new ViteAPI(new WS_RPC(VITE_WSS), () => {
      //       // console.log('[LOG]: VITE API CLIENT CONNECTED')
      //     })
      //   } catch (err) {
      //     if (err) {
      //       state.viteProvider = new ViteAPI(new WS_RPC(VITE_WSS), () => {
      //         // console.log('[LOG]: VITE API CLIENT CONNECTED')
      //       })
      //     }
      //   }
      // }

      // New proposal created event sig
      // const proposalCreatedSig = abi.encodeLogSignature(proposalsContract.default.abi, 'ProposalStartedEvent')
      // Vote submitted event sig
      // const voteSubmittedSig = abi.encodeLogSignature(proposalsContract.default.abi, 'ProposalVotedOnEvent')

      // Create Subscription Ref
      // state.contractSubRef = await state.viteProvider.subscribe('createVmlogSubscription', {
      //   'addressHeightRange': {
      //     [proposalsContract.default.address]: {
      //       'fromHeight': '0',
      //       'toHeight': '0',
      //     },
      //   },
      // }).catch(err => {
      //   if (err) {
      //     console.log(err)
      //   }
      // })

      // Handle Events
      // state.contractSubRef.on(async receiveBlock => {
      //   console.log('Receive Block Res: ', receiveBlock)

      //   if (proposalCreatedSig === receiveBlock[0]['vmlog']['topics'][0]) {
      //     const data = Buffer.from(receiveBlock[0]['vmlog']['data'], 'base64').toString('hex')
      //     const log = abi.decodeLog(proposalsContract.default.abi, data, proposalCreatedSig, 'ProposalStartedEvent')
      //     console.log('Proposal Created - Receive Log: ', log)
      //     eventBus.$emit('ProposalStartedEvent', receiveBlock)
      //   } else if (voteSubmittedSig === receiveBlock[0]['vmlog']['topics'][0]) {
      //     const data = Buffer.from(receiveBlock[0]['vmlog']['data'], 'base64').toString('hex')
      //     const log = abi.decodeLog(proposalsContract.default.abi, data, voteSubmittedSig, 'ProposalVotedOnEvent')
      //     console.log('Proposal Voted On - Receive Log: ', log)
      //     eventBus.$emit('ProposalVotedOnEvent', receiveBlock)
      //   }
      // })
    },

    async initializeCurrProposalVotingStats(state) {
      state.currVotingStatsLoaded = false
      const votesData = state.votingMap ? state.votingMap[state.currProposalID] : null
      if (votesData) {
        state.currProposalVotingStats.optTotalVotesData[0].data = []
        state.currProposalVotingStats.optVotingPowerData[0].data = []
        let winningOptPower = 0

        votesData.optionStats.forEach((val, index) => {
          state.currProposalVotingStats.optTotalVotesData[0].data[index] = val.optionTotalVotes
          state.currProposalVotingStats.optVotingPowerData[0].data[index] = val.optionTotalVotingPower.toPrecision(3)
          if (winningOptPower < val.optionTotalVotingPower) {
            winningOptPower = val.optionTotalVotingPower
            state.currProposalVotingStats.winningIndices = new Array(1).fill(index)
          } else if (winningOptPower === val.optionTotalVotingPower) {
            state.currProposalVotingStats.winningIndices.push(index)
          }
        })

        state.currProposalVotingStats.totalVotes = votesData.totalVotes
        state.currProposalVotingStats.totalVotingPower = votesData.totalVotingPower
        state.currVotingStatsLoaded = true

        eventBus.$emit('voting-results-updated', {
          optTotalVotesData: state.currProposalVotingStats.optTotalVotesData[0].data,
          optVotingPowerData: state.currProposalVotingStats.optVotingPowerData[0].data,
        })
      }
    },

    // Proposals mutations:

    setProposals(state, proposals) {
      state.proposals = proposals
    },

    setProposalsMapLoaded(state, loaded) {
      state.proposalsMapLoaded = loaded
    },

    setProposalStatuses(state, statuses) {
      state.proposalStatuses = statuses
    },

    setCurrProposal(state, proposalID) {
      if (state.proposalsMapObj && state.proposalsMapObj[proposalID]) {
        state.currProposal = state.proposalsMapObj[proposalID]
        state.currProposalID = proposalID
      }
    },

    setVotingMap(state, votingMap) {
      state.votingMap = votingMap
    },

    setVotingMapLoaded(state, loaded) {
      state.votingMapLoaded = loaded
    },

    // Stats mutations:

    setProposalStatsLoaded(state, loaded) {
      state.proposalStatsLoaded = loaded
    },

    // User/Wallet mutations:

    setWalletConnected(state, status) {
      state.isWalletConnected = status
    },

    setSelectedAddress(state, newAddress) {
      state.connectedWalletAddr = newAddress
    },

    setVbInstance(state, vbInstance) {
      state.vbInstance = vbInstance
    },

    setCurrWalletURI(state, walletURI) {
      state.currWalletURI = walletURI
    },

    setCurrAvatarURL(state, avatarURL) {
      state.currAvatarURL = avatarURL
    },

    setLoginSendToPath(state, loginSendToPath) {
      state.loginSendToPath = loginSendToPath
    },

    // Contract mutations:

    async callContract(state, callData) {
      if (!state.vbInstance || !state.vbInstance.accounts[0]) {
        console.log('VITCGovernance: ERROR - callContract() vbInstance null')

        return null
      }

      const { methodName, params } = callData
      const block = createAccountBlock('callContract', {
        address: state.vbInstance.accounts[0],
        abi: proposalsContract.default.abi,
        toAddress: proposalsContract.default.address,
        params: params,
        methodName,
        amount: `${0}`,
      })
      const callContractBlock = block.accountBlock

      let sendRes = null
      try {
        sendRes = await sendVcTx(state.vbInstance, {
          block: callContractBlock,
          abi: proposalsContract.default.abi,
        })
      } catch (err) {
        if (err) {
          sendRes = await sendVcTx(state.vbInstance, {
            block: callContractBlock,
            abi: proposalsContract.default.abi,
          })
        }
      }
      // const sendRes = await sendVcTx(state.vbInstance, {
      //   block: callContractBlock,
      //   abi: proposalsContract.default.abi,
      // })

      if (sendRes) {
        if (methodName === 'startProposal') {
          eventBus.$emit('ProposalStartedEvent', sendRes)
        } else if (methodName === 'submitVote') {
          eventBus.$emit('VoteCastedEvent', sendRes)
        }
      }

      return sendRes
    },
  },

  actions: {
    // Proposals actions:

    setProposals({ commit }, proposals) {
      commit('setProposals', proposals)
    },

    setProposalStatuses({ commit }, statuses) {
      commit('setProposalStatuses', statuses)
    },

    setCurrProposal({ commit }, proposalID) {
      commit('setCurrProposal', proposalID)
      commit('initializeCurrProposalVotingStats')
    },

    // User/Wallet actions:

    setSelectedAddress({ commit }, newAddress) {
      commit('setSelectedAddress', newAddress)
    },

    setVbInstance({ commit }, vbInstance) {
      commit('setVbInstance', vbInstance)
    },

    setCurrWalletURI({ commit }, walletURI) {
      commit('setCurrWalletURI', walletURI)
    },

    setLoginSendToPath({ commit }, loginSendToPath) {
      commit('setLoginSendToPath', loginSendToPath)
    },

    // Contract actions:

    callContract({ commit }, callData) {
      commit('callContract', callData)
    },
  },

  modules: {},
})
