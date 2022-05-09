<template>
  <v-row>
    <!-- Create new proposal -->
    <v-col
      :class="$vuetify.breakpoint.mobile ? 'create-proposal-form-mobile' : 'create-proposal-form-desktop'"
      cols="12"
      md="12"
    >
      <v-card>
        <v-card-title>Create New Proposal</v-card-title>
        <!-- Form -->
        <div
          v-if="!hasSubmitted"
        >
          <v-card-text>
            <FormulateForm
              v-model="createProposalData"
              :class="$vuetify.theme.dark ? 'formulate-light-text' : ''"
              @submit="submitHandler"
            >
              <div
                v-for="formItem in createProposalSchema"
                :key="formItem.name"
              >
                <FormulateInput
                  v-bind="formItem"
                  @keydown.enter="formItem.name === 'keywordInput' ? onKeywordsEnterPressed() : ''"
                  @keyup.enter.prevent
                >
                  <FormulateInput
                    v-for="childFormItem in formItem.children"
                    :key="childFormItem.name"
                    v-bind="childFormItem"
                    :options="tokenList"
                  />
                </FormulateInput>
                <div
                  v-if="formItem.name === 'keywordInput' && keywordsArr.length > 0"
                  class="keywords-chip-container"
                >
                  <v-chip
                    v-for="(keywordObj, keywordInd) in keywordsArr"
                    :key="keywordInd"
                    close
                    class="ma-2"
                    color="primary"
                    @click:close="onKeywordRemove(keywordInd)"
                  >
                    {{ keywordObj.toString() }}
                  </v-chip>
                </div>
              </div>
              <FormulateInput
                type="submit"
                class="submitFormButtonStyle"
                error-behavior="live"
                :validation="!isWalletConnected ? 'required' : ''"
                validation-name="Vite wallet"
                label="Submit"
                :disabled="hasMissingParams()"
                @keydown.enter.prevent
                @keyup.enter.prevent
              />
            </FormulateForm>
          </v-card-text>
        </div>

        <!-- Stepper Desktop -->
        <v-stepper
          v-if="!$vuetify.breakpoint.mobile && hasSubmitted"
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

        <!-- Stepper Mobile -->
        <div
          v-if="$vuetify.breakpoint.mobile && hasSubmitted"
        >
          <v-dialog
            v-model="hasSubmitted"
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
</template>

<script>
import { nanoid } from 'nanoid'
import { mapState, mapGetters } from 'vuex'
import eventBus from '@/utils/events/eventBus'
import { isUserAdmin } from '@/firebase/firebase'
import { createProposal } from '@/utils/api/apiUtils'
import getTokenList from '@/utils/contract/viteUtils'
import votingTypes from '@/utils/voting/votingController'

export default {
  data() {
    return {
      proposalInfo: null,
      contractParams: null,
      tokenList: [],
      hasSubmitted: false,
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
          beforeText: 'Store New Proposal',
          duringText: 'Storing New Proposal...',
          afterText: 'Proposal Stored',
          complete: false,
        },
      ],
      submitProgressStep: 0,
      createProposalData: {},
      keywordsArr: [],
      createProposalSchema: [
        {
          type: 'select',
          name: 'votingType',
          label: 'Voting Type',
          options: votingTypes,
          class: 'createProposalDropdown',
        },
        {
          type: 'group',
          name: 'votingTokenData',
          label: 'Voting Token(s)',
          'error-behavior': 'live',
          validation: 'required',
          repeatable: true,
          minimum: 1,
          remove: false,
          class: 'createProposalDropdown',
          'add-label': '+ Add Token',
          value: [{}],
          children: [
            {
              type: 'select',
              placeholder: 'Select a token',
              name: 'tokenTTI',
              'error-behavior': 'live',
              validation: 'required',
              'validation-name': 'Voting token',
            },
          ],
        },
        {
          label: 'Proposal Title',
          name: 'title',
          'error-behavior': 'live',
          validation: 'required',
          'validation-name': 'Proposal title',
        },
        {
          label: 'Proposal URL',
          name: 'urlLink',
          'validation-name': 'Proposal link',
        },
        {
          label: 'Voting Period',
          name: 'durationInHours',
          help: 'Please use duration in hours (e.g. 24 = 1 day)',
          'error-behavior': 'live',
          validation: 'required',
          'validation-name': 'Voting period',
        },
        {
          label: 'Proposal Keywords',
          name: 'keywordInput',
          help: 'Press enter after typing each keyword',
          'validation-name': 'Proposal keywords',
        },
        {
          type: 'textarea',
          name: 'description',
          label: 'Description',
          'error-behavior': 'live',
          validation: 'required',
          'validation-name': 'Description',
        },
        {
          type: 'group',
          name: 'optionsData',
          label: 'Options',
          repeatable: true,
          'add-label': '+ Add Option',
          value: [{}],
          children: [
            {
              type: 'text',
              name: 'optionName',
              label: 'Name',
              'error-behavior': 'live',
              validation: 'required',
              'validation-name': 'Option name',
            },
          ],
        },
      ],
    }
  },

  computed: {
    ...mapState([
      'vbInstance',
      'isWalletConnected',
      'connectedWalletAddr',
    ]),
    ...mapGetters([
      'getVbInstance',
      'getIsWalletConnected',
      'getConnectedWalletAddr',
    ]),
  },

  mounted() {
    this.onMounted()
  },

  beforeDestroy() {
    eventBus.$off('ProposalStartedEvent')
  },

  methods: {
    /**
     *
     */
    async onMounted() {
      if (this.tokenList.length < 1) {
        this.tokenList = await getTokenList()
      }
    },

    /**
     *
     */
    hasMissingParams() {
      if (
        !this.isWalletConnected
        || !this.whitelisted()
        || !(this.createProposalData.votingTokenData
            && this.createProposalData.votingTokenData[0].tokenTTI)
        || !(this.createProposalData.title
            && this.createProposalData.title.length > 0)
        || !(this.createProposalData.description
            && this.createProposalData.description.length > 0)
        || !(this.createProposalData.durationInHours
            && this.createProposalData.durationInHours.length > 0)
        || !(this.createProposalData.optionsData
            && this.createProposalData.optionsData[0].optionName
            && this.createProposalData.optionsData[0].optionName.length > 0)
      ) {
        return true
      }

      return false
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
          methodName: 'startProposal',
          params: this.contractParams,
        })
      } catch (err) {
        if (err) {
          return this.$store.commit('callContract', {
            methodName: 'startProposal',
            params: this.contractParams,
          })
        }
      }

      return null
    },

    /**
     *
     */
    async handleStoreProposal() {
      if (!this.proposalInfo) {
        return null
      }

      try {
        return createProposal(this.proposalInfo)
      } catch (err) {
        if (err) {
          return createProposal(this.proposalInfo)
        }
      }

      return null
    },

    /**
     *
     */
    async checkLink(url) {
      return (await fetch(url)).ok
    },

    async parseVotingTokens(votingTokenData = null) {
      const votingTokenArr = []
      for (let i = 0; i < votingTokenData.length; ++i) {
        const votingTokenObj = votingTokenData[i]
        for (let j = 0; j < this.tokenList.length; ++j) {
          const tokenListObj = this.tokenList[j]
          if (tokenListObj.value.includes(votingTokenObj.tokenTTI)) {
            votingTokenArr.push({
              tokenTTI: votingTokenObj.tokenTTI,
              tokenName: tokenListObj.label,
            })
          }
        }
      }

      const votingTokensParsed = votingTokenArr
      if (votingTokensParsed) {
        const votingTokensArrSize = votingTokenArr.length
        for (let i = 0; i < votingTokensArrSize; ++i) {
          let tokenLogoSourceURL = ''
          const votingTokenObj = votingTokenArr[i]
          const tokenSymbol = votingTokenObj.tokenName.toLowerCase()
          const tokenLogoURL = 'https://raw.githubusercontent.com/vitelabs/crypto-info/master/tokens'
          let fullPath = `${tokenLogoURL}/${tokenSymbol}/${votingTokenObj.tokenTTI}.png`
          const isLowerCaseGood = await this.checkLink((fullPath))
          if (isLowerCaseGood) {
            tokenLogoSourceURL = fullPath
          } else {
            fullPath = `${tokenLogoURL}/${tokenSymbol.toUpperCase()}/${votingTokenObj.tokenTTI}.png`
            const isUpperCaseGood = await this.checkLink((fullPath))
            if (isUpperCaseGood) {
              tokenLogoSourceURL = fullPath
            }
          }

          votingTokensParsed[i].tokenLogoURL = tokenLogoSourceURL
        }
      }

      return votingTokensParsed
    },

    /**
     *
     */
    async submitHandler() {
      if (this.hasMissingParams()) {
        console.log('VITCGovernance - Submit Error')

        return
      }

      // Increment progress stepper
      this.hasSubmitted = true
      this.stepperSteps[this.submitProgressStep].complete = true
      ++this.submitProgressStep

      // Grab relevant form data
      const {
        votingTokenData,
        durationInHours,
        title,
        description,
        optionsData,
        votingType,
      } = this.createProposalData

      // Parse voting token array
      const votingTokensParsed = await this.parseVotingTokens(votingTokenData)

      // Set publish/end dates
      const votingPeriod = parseInt(durationInHours, 10)
      const publishDate = new Date()
      const endDate = new Date(publishDate)
      endDate.setHours(endDate.getHours() + votingPeriod)
      const endDateStr = endDate.toDateString()

      // Proposal info
      this.proposalInfo = {
        proposalID: nanoid(),
        creator: this.connectedWalletAddr.toString(),
        title: title,
        keywords: this.keywordsArr,
        description: description,
        numOptions: optionsData.length,
        options: optionsData,
        votingType: votingType,
        publishDate: publishDate.getTime().toString(),
        publishDateFormatted: `${publishDate.toDateString()} at ${publishDate.toTimeString()}`,
        endDate: endDate.getTime().toString(),
        endDateFormatted: `${endDateStr} at ${endDate.toTimeString()}`,
        endDateShortStr: `${endDateStr}`,
        votingPeriod: votingPeriod,
        votingTokens: votingTokensParsed,
        status: 'Active',
      }

      // Contract params array
      this.contractParams = [
        this.proposalInfo.proposalID,
        this.proposalInfo.votingPeriod,
        this.proposalInfo.numOptions,
      ]

      eventBus.$on('ProposalStartedEvent', async receiveBlock => {
        if (receiveBlock) {
          // Increment progress stepper
          this.stepperSteps[this.submitProgressStep].complete = true
          ++this.submitProgressStep

          // Initialize and store new proposal
          const storeRes = await this.handleStoreProposal()
          if (storeRes) {
            // Increment progress stepper
            this.stepperSteps[this.submitProgressStep].complete = true
            ++this.submitProgressStep

            // Send the user home
            this.$router.push({
              name: 'home',
            })
          } else {
            this.hasSubmitted = false
            this.submitProgressStep = 0
          }
        } else {
          this.hasSubmitted = false
          this.submitProgressStep = 0
        }
      })

      // Call and sign contract
      this.$store.commit('callContract', {
        methodName: 'startProposal',
        params: this.contractParams,
      })
    },

    /**
     *
     */
    async onKeywordsEnterPressed() {
      let parsedKeyword = null
      const currKeywordStr = this.createProposalData.keywordInput.toString()
      if (currKeywordStr && currKeywordStr.length > 0) {
        const tempKeywordStr = currKeywordStr.replace(/ /g, '')
        parsedKeyword = tempKeywordStr.toLowerCase()
      }

      if (parsedKeyword && !this.keywordsArr.includes(parsedKeyword)) {
        this.keywordsArr.push(parsedKeyword)
        this.createProposalData.keywordInput = ''
      }
    },

    /**
     *
     */
    async onKeywordRemove(keywordInd) {
      if (keywordInd >= 0) {
        this.keywordsArr.splice(keywordInd, 1)
      }
    },

    /**
     *
     */
    whitelisted() {
      return isUserAdmin()
    },
  },
}
</script>

<style lang="scss" scoped>
@import '@braid/vue-formulate/themes/snow/snow.scss';

.create-proposal-form-desktop {
  .v-card.v-sheet {
    width: 30%;
    margin-left: auto;
    margin-right: auto;
  }
}

.create-proposal-form-mobile {
  .v-card.v-sheet {
    width: 95%;
    margin-left: auto;
    margin-right: auto;
  }
}

</style>
