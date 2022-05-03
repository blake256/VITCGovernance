<template>
  <v-row>
    <v-col
      cols="12"
      md="12"
    >
      <!-- Proposal Stats Widget -->
      <proposal-stats-widget></proposal-stats-widget>

      <!-- Main Proposals List -->
      <div
        v-if="proposalsMapLoaded"
      >
        <v-container
          v-if="proposals.length > 0"
          :class="!$vuetify.breakpoint.mobile ? 'py-8 px-6' : 'py-8 px-0'"
          fluid
        >
          <v-row
            v-for="proposalObj in proposals"
            :key="proposalObj.title"
          >
            <v-col
              cols="12"
            >
              <v-card
                raised
                elevation="9"
              >
                <v-list two-line>
                  <v-list-item
                    class="proposal-gallery-widget"
                    @click="viewProposalHandler(proposalObj.proposalID)"
                  >
                    <v-list-item-avatar
                      v-if="proposalObj.endDate"
                      class="proposal-icon-avatar"
                    >
                      {{ proposalObj.endDateShortStr }}
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-title v-text="proposalObj.title"></v-list-item-title>
                      <v-list-item-subtitle
                        class="description-subtitle"
                        v-text="proposalObj.description"
                      ></v-list-item-subtitle>
                    </v-list-item-content>
                    <v-chip
                      v-if="proposalObj.status"
                      small
                      label
                      :color="statusColor[proposalObj.status]"
                      class="font-weight-medium proposal-status-chip"
                    >
                      {{ proposalObj.status }}
                    </v-chip>
                  </v-list-item>
                </v-list>
              </v-card>
            </v-col>
          </v-row>
        </v-container>
      </div>
    </v-col>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import { mdiAlert, mdiTrendingUp } from '@mdi/js'
import ProposalStatsWidget from '@/components/widgets/ProposalStatsWidget.vue'

export default {
  components: {
    ProposalStatsWidget,
  },

  data() {
    return {
      icons: {
        mdiTrendingUp,
        mdiAlert,
      },
      statusColor: {
        'Active': 'primary',
        'Closed': 'grey',
      },
    }
  },

  computed: {
    ...mapState([
      'proposals',
      'proposalsMapLoaded',
      'isWalletConnected',
    ]),
    ...mapGetters([
      'getProposals',
      'getProposalsMapLoaded',
      'getIsWalletConnected',
    ]),
  },

  methods: {
    /**
     *
     */
    viewProposalHandler(proposalID) {
      // console.log('proposalID: ', proposalID)

      this.$store.commit('setLoginSendToPath', 'view-proposal')
      this.$store.commit('setCurrProposal', proposalID)
      this.$router.push({
        name: 'view-proposal',
        params: {
          proposalID: proposalID,
        },
      }).catch(() => {})
    },
  },
}
</script>

<style lang="scss" scoped>

.proposal-gallery-widget {
  box-shadow: none !important;
    &:hover {
      box-shadow: 0 1px 10px 1px #06368b !important;
    }
}

.proposal-icon-avatar {
  margin-left: 10px;
  margin-right: 15px;
}

.proposal-status-chip {
  margin-left: 10px;
  margin-right: 5px;
}

.description-subtitle {
  line-height: 1.6;
}

</style>
