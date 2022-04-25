import Vue from 'vue'
import Vuex from 'vuex'
import Connector from '@vite/connector'
import { AvatarGenerator } from 'random-avatar-generator'
import eventBus from '@/utils/events/eventBus'
import { requestLogin } from '@/utils/api/apiUtils'
import { getTokenInfoList } from '@/utils/contract/contractUtils'
import { signOutCurrentUser } from '@/firebase/firebase'

// Vite Connect Server URL
const BRIDGE = 'wss://viteconnect.thomiz.dev/'

// Adding window event listener on beforeunload to sign out current user
window.addEventListener('beforeunload', signOutCurrentUser)

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

    // Token List
    tokenList: null,
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

    getTokenList(state) {
      return state.tokenList
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
        if (updatedProposalsMap) {
          state.proposalsMapLoaded = false
          state.proposalsMapObj = updatedProposalsMap
          state.proposals = Object.values(updatedProposalsMap)
          state.proposals.sort((propA, propB) => {
            if (propA.status === propB.status) {
              if (propA.status === 'Active') {
                const propAEndTime = parseInt(propA.endDate, 10)
                const propBEndTime = parseInt(propB.endDate, 10)

                return propBEndTime - propAEndTime
              }

              const propAPublishTime = parseInt(propA.publishDate, 10)
              const propBPublishTime = parseInt(propB.publishDate, 10)

              return propBPublishTime - propAPublishTime
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
        if (updatedStats) {
          state.proposalStatsLoaded = false
          state.proposalStats = updatedStats
          state.proposalStatsLoaded = true
          eventBus.$emit('on-proposal-stats-state-updated')
        }
      })

      //
      eventBus.$on('voting-map-updated', updatedVotingMap => {
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
        if (state.proposalsMapObj && state.proposalsMapObj[proposalID]) {
          state.currProposal = state.proposalsMapObj[proposalID]
          state.currProposalID = proposalID
        }
        this.commit('initializeCurrProposalVotingStats', proposalID)
      })

      // Initialize global token list
      state.tokenList = await getTokenInfoList()
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
          state.currProposalVotingStats.optVotingPowerData[0].data[index] = val.optionTotalVotingPower
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

    setTokenList(state, tokenList) {
      state.tokenList = tokenList
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
  },

  modules: {},
})
