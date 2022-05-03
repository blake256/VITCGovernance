<template>
  <div>
    <template v-if="isValidToVote()">
      <v-card>
        <v-divider
          class="divider-margin-class"
        ></v-divider>

        <v-container
          fluid
        >
          <v-row
            dense
          >
            <v-col
              v-for="(option, index) in proposalOptions"
              :key="index"
              v-bind="option"
              :cols="$vuetify.breakpoint.mobile ? '8' : '4'"
              :class="$vuetify.breakpoint.mobile ? 'ballot-flex-mobile' : 'ballot-flex-desktop'"
            >
              <v-card
                elevation="2"
                outlined
                shaped
                min-height="200px"
              >
                <v-card-title>
                  {{ option.optionName }}
                </v-card-title>
                <v-progress-linear
                  color="blue lighten-2"
                  :buffer-value="votingPowers[index]"
                  stream
                ></v-progress-linear>
              </v-card>
              <v-form>
                <v-container>
                  <v-row>
                    <v-col
                      cols="12"
                    >
                      <div class="d-flex">
                        <v-tooltip bottom>
                          <template v-slot:activator="{ on, attrs }">
                            <v-text-field
                              v-model="votingPowers[index]"
                              outlined
                              type="number"
                              :disabled="isSwitchEnabled"
                              :label="`Option #${index+1} Power:`"
                              :class="isSwitchEnabled ? 'ballot-text-field' : ''"
                              suffix="%"
                              v-bind="attrs"
                              v-on="on"
                              @input="validateVoteValue()"
                            ></v-text-field>
                          </template>
                          <span>Percent amount of voting power placed towards this option. Balances are verified at the end of a proposal.</span>
                        </v-tooltip>
                        <v-switch
                          v-if="isSwitchEnabled"
                          v-model="votingOptionsSelected[index]"
                          inset
                          class="switch-rot-90"
                          @click="onOptionClicked(index)"
                          @touchcancel="onOptionClicked(index)"
                        ></v-switch>
                      </div>
                    </v-col>
                  </v-row>
                </v-container>
              </v-form>
            </v-col>
          </v-row>
        </v-container>

        <v-row
          v-if="!$vuetify.breakpoint.mobile"
        >
          <v-col
            cols="4"
            md="12"
            align="center"
            class="mb-3"
          >
            <FormulateForm
              @submit="fireVotingCallback()"
            >
              <FormulateInput
                type="submit"
                label="Submit Vote"
                :disabled="!isValidForSubmit() || disableSubmit"
                @keydown.enter.prevent
                @keyup.enter.prevent
              />
            </FormulateForm>
          </v-col>
        </v-row>

        <v-row
          v-else
          align="center"
          justify="space-around"
        >
          <v-col
            cols="1"
          >
          </v-col>
          <v-col
            cols="4"
            class="mb-3"
          >
            <FormulateForm
              @submit="fireVotingCallback()"
            >
              <FormulateInput
                type="submit"
                label="Submit Vote"
                :disabled="!isValidForSubmit() || disableSubmit"
                @keydown.enter.prevent
                @keyup.enter.prevent
              />
            </FormulateForm>
          </v-col>
          <v-col
            cols="1"
          >
          </v-col>
        </v-row>
      </v-card>
    </template>
  </div>
</template>

<script>
import {
  mdiAlert,
} from '@mdi/js'
import { mapState, mapGetters } from 'vuex'
import { hasUserVotedByID } from '@/firebase/firebase'

export default {

  props: {
    votingTokens: { type: Array, default: null },
    votingType: { type: String, default: '' },
    proposalOptions: { type: Array, default: null },
  },

  data() {
    return {
      hideBallot: false,
      ballotSubmitted: false,
      disableSubmit: false,
      isSwitchEnabled: false,
      numOptions: 0,
      votingBalance: 100,
      currNumOptsSelected: 0,
      icons: {
        mdiAlert,
      },
      votingOptionsSelected: [],
      votingPowers: [],
      currAddrHasVoted: false,
    }
  },

  computed: {
    ...mapState([
      'isWalletConnected',
      'connectedWalletAddr',
      'currProposalID',
    ]),
    ...mapGetters([
      'getIsWalletConnected',
      'getConnectedWalletAddr',
      'getCurrProposalID',
    ]),
  },

  created() {
    this.onCreated()
  },

  mounted() {
    this.onMounted()
  },

  methods: {

    isValidForSubmit() {
      if (!this.isWalletConnected) {
        return false
      }

      if (this.isSwitchEnabled && this.currNumOptsSelected <= 0) {
        return false
      }

      return true
    },

    onCreated() {
      this.numOptions = this.proposalOptions.length

      this.votingPowers = new Array(this.numOptions).fill(0)
      this.votingOptionsSelected = new Array(this.numOptions).fill(false)
      this.streamBarVals = new Array(this.numOptions).fill(0)

      this.initVotingBallots()
    },

    async onMounted() {
      if (this.isWalletConnected && this.currProposalID !== '') {
        if (hasUserVotedByID(this.currProposalID)) {
          this.currAddrHasVoted = true
        } else {
          this.currAddrHasVoted = false
        }
      }
    },

    async initVotingBallots() {
      switch (this.votingType) {
        case 'Approval':
          this.isSwitchEnabled = true
          break
        case 'Quadratic':
          this.isSwitchEnabled = false
          break
        case 'Weighted':
          this.isSwitchEnabled = false
          break
        case 'Single-Choice':
          this.isSwitchEnabled = true
          break
        default:
          this.isSwitchEnabled = false
          break
      }
    },

    async fireVotingCallback() {
      this.hideBallot = true
      this.currAddrHasVoted = true
      this.ballotSubmitted = true
      this.$emit('onSubmitVote', { votingPowers: this.votingPowers })
    },

    async onOptionClicked(index) {
      if (this.votingOptionsSelected[index]) {
        ++this.currNumOptsSelected
        if (this.votingType === 'Single-Choice') {
          this.votingPowers.forEach((val, powerIndex) => {
            if (index !== powerIndex) {
              this.votingPowers[index] = 0
              if (this.votingOptionsSelected[powerIndex]) {
                this.votingOptionsSelected[powerIndex] = false
                --this.currNumOptsSelected
              }
            } else {
              this.votingPowers[index] = this.votingBalance
            }
          })
        }
      } else {
        --this.currNumOptsSelected
        if (this.votingType === 'Single-Choice') {
          this.votingPowers[index] = 0
        }
      }

      if (this.votingType === 'Approval') {
        this.votingPowers.forEach((val, powerIndex) => {
          if (this.votingOptionsSelected[powerIndex]) {
            this.votingPowers[powerIndex] = (this.votingBalance / this.currNumOptsSelected)
          } else {
            this.votingPowers[powerIndex] = 0
          }
        })
      }
    },

    async validateVoteValue() {
      let sum = 0
      this.votingPowers.forEach((val, index) => {
        const parsedVal = parseInt(val, 10)
        if (Number.isNaN(parsedVal)) {
          this.votingPowers[index] = 0
        } else {
          sum += parsedVal
        }
      })
      if (sum > this.votingBalance || sum <= 0) {
        this.disableSubmit = true
      } else {
        this.disableSubmit = false
      }
    },

    /**
     *
     */
    async isValidToVote() {
      if (!this.currAddrHasVoted && !this.ballotSubmitted) {
        return true
      }

      return false
    },
  },
}

</script>

<style lang="scss" scoped>
@import '@braid/vue-formulate/themes/snow/snow.scss';

.ballot-flex-desktop {
  margin-left: auto;
  margin-right: auto;
}

.ballot-flex-mobile {
  margin-left: 0;
  margin-right: 0;
}

.formulate-form.vote-ballot-form-light-text {
  color: white;
}

.vote-ballot-form-light-text {
  .formulate-input-help.formulate-input-help {
    color: gray;
  }

  .formulate-input {
    &[data-classification='text'] {
      input {
        color: white;
      }
    }
  }

  .formulate-input-element--textarea textarea {
    color: white;
  }

  .formulate-input[data-classification=select] select {
    color: white;
  }

  .formulate-input .formulate-input-error,
  .formulate-input .formulate-file-upload-error {
    color: red;
  }
}

.ballot-text-field {
  transform: translateX(15px);
}

.switch-rot-90 {
  transform: rotate(-90deg) + translate(30px, 30px);
}

.visible-ballot-container {
  display: block;
}

.hidden-ballot-container {
  display: none;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
-webkit-appearance: none;
margin: 0;
}

/* Firefox */
input[type=number] {
-moz-appearance: textfield;
}
</style>
