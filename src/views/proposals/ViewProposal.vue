<template>
  <v-row
    v-if="currProposal"
  >
    <v-col
      cols="12"
      md="12"
    >
      <v-row>
        <v-col
          cols="12"
          class="mb-6"
        >
          <v-card>
            <!-- ADD STATUS CHIP & ROW HERE -->
            <v-btn
              :depressed="false"
              plain
              class="go-back-btn"
              @click="goBackClickHandler()"
            >
              Go Back
            </v-btn>
            <v-row class="ma-0 pb-5 px-2">
              <v-col
                cols="12"
                class="align-text-center"
              >
                <h1
                  :class="$vuetify.breakpoint.mobile ? 'mobile-proposal-title' : ''"
                >
                  {{ currProposal.title }}
                </h1>
              </v-col>
            </v-row>
            <v-col
              cols="12"
              sm="12"
              :class="$vuetify.breakpoint.mobile ? 'ml-2 mr-3' : 'ml-2 mr-2'"
            >
              <h3>
                Description
              </h3>
              <span class="body-1 mr-2">{{ currProposal.description }}</span>
            </v-col>
            <v-col
              cols="12"
              class="ml-2 mr-2"
            >
              <h3>
                Creator
              </h3>
              <span class="body-1">
                <a
                  :href="`https://vitcscan.com/address/${currProposal.creator}`"
                  target="_blank"
                  rel="nofollow"
                >
                  {{ proposalCreatorParsed }}
                </a>
              </span>
            </v-col>
            <v-col
              v-if="currProposal.urlLink"
              cols="12"
              class="ml-2 mr-2"
            >
              <h3>
                URL
              </h3>
              <span class="body-1">
                <a
                  :href="currProposal.urlLink"
                  target="_blank"
                  rel="nofollow"
                >
                  {{ currProposal.urlLink }}
                </a>
              </span>
            </v-col>
            <v-col
              v-if="currProposal.keywords"
              cols="12"
              class="ml-2 mr-2"
            >
              <h3>
                Keywords
              </h3>
              <v-chip
                v-for="(keywordObj, keywordInd) in currProposal.keywords"
                :key="keywordInd"
                class="ma-2"
                color="primary"
              >
                {{ keywordObj.toString() }}
              </v-chip>
            </v-col>
            <v-col
              v-if="currProposal.publishDateFormatted"
              cols="12"
              class="ml-2 mr-2"
            >
              <h3>
                Publish Date
              </h3>
              <span class="body-1">{{ currProposal.publishDateFormatted }}</span>
            </v-col>
            <v-col
              v-if="currProposal.endDateFormatted"
              cols="12"
              class="ml-2 mr-2"
            >
              <h3>
                End Date
              </h3>
              <span class="body-1">{{ currProposal.endDateFormatted }}</span>
            </v-col>
            <v-col
              cols="12"
              class="ml-2 mr-2"
            >
              <h3>
                Voting Type
              </h3>
              <span class="body-1">{{ currProposal.votingType }}</span>
            </v-col>
            <v-col
              cols="12"
              sm="12"
              class="ml-2 mr-2"
            >
              <div
                v-if="currProposal.votingTokens"
              >
                <h3>
                  Voting Tokens
                </h3>
                <v-badge
                  v-for="(tokenObj, tokenIndex) in currProposal.votingTokens"
                  :key="tokenIndex"
                  :label="tokenObj.tokenName"
                  :value="hover[tokenIndex]"
                  :content="tokenObj.tokenName"
                  bottom
                >
                  <v-hover v-model="hover[tokenIndex]">
                    <v-avatar
                      v-if="tokenObj.tokenLogoURL.length > 0"
                    >
                      <img
                        :src="tokenObj.tokenLogoURL"
                        :alt="tokenObj.tokenName"
                      >
                    </v-avatar>
                    <v-avatar
                      v-else
                      size="44"
                      rounded
                      class="elevation-1 mt-3 ml-5"
                    >
                      {{ tokenObj.tokenName }}
                    </v-avatar>
                  </v-hover>
                </v-badge>
              </div>
            </v-col>

            <v-divider
              class="divider-margin-class"
              :class="$vuetify.breakpoint.mobile ? 'divider-margin-mobile' : 'divider-margin-desktop'"
            ></v-divider>

            <voting-results-widget></voting-results-widget>

            <div v-if="isValidToVote()">
              <template v-if="!hasUserVoted()">
                <voting-ballot-form
                  :votingTokens="currProposal.votingTokens"
                  :votingType="currProposal.votingType"
                  :proposalOptions="currProposal.options"
                  @onSubmitVote="submitVoteHandler"
                >
                </voting-ballot-form>
              </template>
            </div>

            <!-- Stepper Desktop -->
            <v-row
              v-if="!$vuetify.breakpoint.mobile && isSubmitting"
            >
              <v-col
                cols="4"
                md="4"
                align="center"
                class="stepper-card-flex"
              >
                <v-card
                  outlined
                  elevation="10"
                  class="mt-4 mb-4"
                  color="primary"
                >
                  <v-stepper
                    v-model="submitProgressStep"
                    vertical
                    class="pt-2 pb-5"
                  >
                    <div
                      v-for="(stepObj, stepIndex) in stepperSteps"
                      :key="stepIndex"
                    >
                      <v-stepper-step
                        :rules="[() => {
                          if (submitProgressStep !== stepIndex) {
                            return true
                          }

                          return false
                        }]"
                        :complete="stepObj.complete"
                        :step="(stepIndex + 1).toString()"
                      >
                        {{ stepObj.complete ? stepObj.afterText : submitProgressStep === stepIndex ? stepObj.duringText : stepObj.beforeText }}
                      </v-stepper-step>
                    </div>
                  </v-stepper>
                </v-card>
              </v-col>
            </v-row>

            <!-- Stepper Mobile -->
            <div
              v-if="$vuetify.breakpoint.mobile && isSubmitting"
            >
              <v-dialog
                v-model="isSubmitting"
                :overlay-opacity="0.85"
              >
                <v-row
                  align="center"
                  justify="space-around"
                >
                  <v-stepper
                    v-model="submitProgressStep"
                    vertical
                  >
                    <div
                      v-for="(stepObj, stepIndex) in stepperSteps"
                      :key="stepIndex"
                    >
                      <v-stepper-step
                        :rules="[() => {
                          if (submitProgressStep !== stepIndex) {
                            return true
                          }

                          return false
                        }]"
                        :complete="stepObj.complete"
                        :step="(stepIndex + 1).toString()"
                      >
                        {{ stepObj.complete ? stepObj.afterText : submitProgressStep === stepIndex ? stepObj.duringText : stepObj.beforeText }}
                      </v-stepper-step>
                    </div>
                  </v-stepper>
                </v-row>
              </v-dialog>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-col>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import eventBus from '@/utils/events/eventBus'
import VotingBallotForm from '@/components/forms/VotingBallotForm.vue'
import { submitVote } from '@/utils/api/apiUtils'
import { hasUserVotedByID, updateUserToken } from '@/firebase/firebase'
import VotingResultsWidget from '@/components/widgets/VotingResultsWidget.vue'

export default {

  components: {
    VotingBallotForm,
    VotingResultsWidget,
  },

  data() {
    return {
      currProposal: null,
      contractParams: null,
      voteData: null,
      isSubmitting: false,
      hasVoted: false,
      stepperSteps: [
        {
          beforeText: 'Submit Form',
          duringText: 'Submitting Form...',
          afterText: 'Form Submitted',
          complete: false,
        },
        {
          beforeText: 'Approve Vite Transaction',
          duringText: 'Awaiting Tx Approval...',
          afterText: 'Transaction Signed',
          complete: false,
        },
        {
          beforeText: 'Store Vote Data',
          duringText: 'Storing New Vote...',
          afterText: 'Vote Data Stored',
          complete: false,
        },
      ],
      proposalCreatorParsed: '',
      submitProgressStep: 0,
      hover: [],
    }
  },

  computed: {
    ...mapState([
      'vbInstance',
      'isWalletConnected',
      'connectedWalletAddr',
      'proposalsMapObj',
      'currProposalID',
      'currProposalVotingStats',
    ]),
    ...mapGetters([
      'getVbInstance',
      'getIsWalletConnected',
      'getConnectedWalletAddr',
      'getProposalsMapObj',
      'getCurrProposalID',
      'getCurrProposalVotingStats',
    ]),
  },

  created() {
    this.onCreated()
  },

  mounted() {
    if (this.currProposalID) {
      this.hasVoted = this.hasUserVoted()
    }
  },

  methods: {
    /**
     *
     */
    hasMissingParams() {
      if (!this.isWalletConnected) {
        return true
      }

      return false
    },

    /**
     *
     */
    hasUserVoted() {
      if (this.hasVoted) {
        return true
      }

      return hasUserVotedByID(this.currProposalID)
    },

    /**
     *
     */
    isValidToVote() {
      if (this.isWalletConnected
          && this.connectedWalletAddr !== ''
          && !this.isSubmitting
          && !this.hasUserVoted()
          && this.currProposal
          && this.currProposal.status === 'Active'
          && this.currProposal.votingTokens
      ) {
        return true
      }

      return false
    },

    /**
     *
     */
    async goBackClickHandler() {
      this.$router.push({
        name: 'home',
      })
    },

    /**
     *
     */
    async handleCallAndSignContract() {
      if (!this.contractParams) {
        return null
      }

      try {
        return this.$store.commit('callContract', {
          methodName: 'submitVote',
          params: this.contractParams,
        })
      } catch (err) {
        if (err) {
          return this.$store.commit('callContract', {
            methodName: 'submitVote',
            params: this.contractParams,
          })
        }
      }

      return null
    },

    /**
     *
     */
    async handleStoreVoteData() {
      if (!this.voteData) {
        return null
      }

      try {
        return submitVote(this.voteData)
      } catch (err) {
        if (err) {
          return submitVote(this.voteData)
        }
      }

      return null
    },

    /**
     *
     */
    async submitVoteHandler(newVote) {
      if (this.hasMissingParams()) {
        console.log('VITCGovernance - Submit Error')

        return
      }

      // Set to currently voting and increment progress stepper
      this.isSubmitting = true
      this.stepperSteps[this.submitProgressStep].complete = true
      ++this.submitProgressStep

      // Make sure voting powers are ints (not strings)
      const votingPowers = []
      for (let i = 0; i < newVote.votingPowers.length; ++i) {
        const powerNum = parseInt(newVote.votingPowers[i], 10)
        if (!Number.isNaN(powerNum)) {
          votingPowers.push(powerNum)
        } else {
          votingPowers.push(0)
        }
      }

      // Initialize vote object
      this.voteData = {
        proposalID: this.currProposal.proposalID,
        voterAddr: this.connectedWalletAddr,
        votingPowers: votingPowers,
      }

      // Contract params array
      this.contractParams = [
        this.voteData.proposalID,
        this.voteData.voterAddr,
        this.voteData.votingPowers,
      ]

      // console.log('[SUBMIT VOTE] voteData: ', this.voteData)
      // console.log('[SUBMIT VOTE] contractParams: ', this.contractParams)
      // console.log('[SUBMIT VOTE] proposalsContract: ', proposalsContract)
      // console.log('[SUBMIT VOTE] vbInstance: ', this.vbInstance.session)

      eventBus.$on('VoteCastedEvent', async receiveBlock => {
        if (receiveBlock) {
          // console.log('[VITCGovernance] CALL TO CONTRACT SUCCESS - blockRes: ', receiveBlock)

          // Increment progress stepper
          this.stepperSteps[this.submitProgressStep].complete = true
          ++this.submitProgressStep

          // Initialize and store new proposal
          const storeRes = await this.handleStoreVoteData()
          if (storeRes) {
            // console.log('[VITCGovernance] NEW VOTE STORED SUCCESSFULLY')
            updateUserToken(this.voteData.proposalID)

            // Increment progress stepper
            this.stepperSteps[this.submitProgressStep].complete = true
            ++this.submitProgressStep
            this.hasVoted = true
            this.isSubmitting = false
          } else {
            this.isSubmitting = false
            this.submitProgressStep = 0
          }
        } else {
          this.isSubmitting = false
          this.submitProgressStep = 0
        }
      })

      // Call and sign contract
      // this.handleCallAndSignContract()
      this.$store.commit('callContract', {
        methodName: 'submitVote',
        params: this.contractParams,
      })
    },

    /**
     *
     */
    async initializeCurrProposal() {
      // console.log('[VIEW PROPOSAL] - initializeCurrProposal()')
      if (this.currProposal) {
        if (this.currProposal.votingTokens) {
          this.hover = new Array(this.currProposal.votingTokens.length).fill(false)
        }

        if (this.currProposal.creator) {
          const addrStr = this.currProposal.creator
          const addrStrLength = addrStr.length
          if (this.$vuetify.breakpoint.mobile) {
            const preSubStr = addrStr.substr(0, 12)
            const postSubStr = addrStr.substr(addrStrLength - 7, addrStrLength)
            this.proposalCreatorParsed = `${preSubStr}...${postSubStr}`
          } else {
            this.proposalCreatorParsed = addrStr
          }
        }
      }
    },

    /**
     *
     */
    onCreated() {
      this.proposalID = this.$route.params.proposalID
      if (!this.currProposal) {
        this.getProposal(this.proposalID)
      } else {
        this.initializeCurrProposal()
      }

      eventBus.$on('on-proposals-map-state-updated', () => {
        this.proposalID = this.$route.params.proposalID
        if (!this.currProposal) {
          this.getProposal(this.proposalID)
        } else {
          this.initializeCurrProposal()
        }
      })

      eventBus.$on('on-voting-map-state-updated', () => {
        this.$store.commit('initializeCurrProposalVotingStats', this.currProposal.proposalID)
      })
    },

    /**
     *
     */
    getProposal(proposalID) {
      // console.log('[VIEW PROPOSAL] - getProposal()')
      if (this.proposalsMapObj && this.proposalsMapObj[proposalID]) {
        this.currProposal = this.proposalsMapObj[proposalID]
      }
      this.$store.commit('setCurrProposal', proposalID)
      this.initializeCurrProposal()
    },

  },
}
</script>

<style lang="scss" scoped>
@import '@braid/vue-formulate/themes/snow/snow.scss';
.center-flex {
  .d-flex {
    margin: unset !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }
}

.stepper-card-flex {
  margin-left: auto;
  margin-right: auto;
}

.cast-vote-submit-btn {
  margin: 20px;
}

.options-row-style {
  margin-top: 10px;
}

.divider-margin-desktop {
  margin: 20px;
}

.divider-margin-mobile {
  margin: 10px;
}

.go-back-btn {
  margin: 10px;
}

.mobile-proposal-title {
  font-size: 16px !important;
}

.mobile-proposal-title {
  font-size: 24px !important;
}
</style>
