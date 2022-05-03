<template>
  <v-card
    raised
    outlined
    elevation="9"
  >
    <!-- Title & Create Proposal Button -->
    <div class="w-full">
      <div
        :class="$vuetify.breakpoint.mobile ? mobileStyleStr : desktopStyleStr"
      >
        <h2
          :class="$vuetify.breakpoint.mobile ? 'ml-6' : ''"
        >
          Proposals
        </h2>
        <v-spacer></v-spacer>
        <create-proposal-button
          :class="$vuetify.breakpoint.mobile ? 'mr-3' : ''"
        >
        </create-proposal-button>
      </div>
    </div>

    <!-- Divider -->
    <v-divider></v-divider>

    <!-- Stats Row -->
    <v-row
      v-if="proposalStatsLoaded"
      justify="space-around"
      class="pt-4 mb-0"
    >
      <!-- Test Space #1 -->
      <v-col
        v-if="!$vuetify.breakpoint.mobile"
        cols="1"
      >
        <!--<v-card
          color="white"
          height="65"
        >
        </v-card>-->
      </v-col>

      <!-- Active Proposals
      <v-col
        cols="2"
        class="pl-16"
      > -->
      <v-col
        cols="2"
        :class="!$vuetify.breakpoint.mobile ? 'ml-5' : 'ml-5'"
      >
        <proposal-stat-obj
          color="primary"
          statText="Active"
          :statVal="proposalStats.totalActiveProposals"
          :icon="icons.mdiTrendingUp"
        >
        </proposal-stat-obj>
      </v-col>

      <!-- Test Space #2 -->
      <v-col
        :cols="!$vuetify.breakpoint.mobile ? '2' : '1'"
      >
        <!--<v-card
          color="white"
          height="65"
        >
        </v-card>-->
      </v-col>

      <!-- Closed Proposals -->
      <v-col
        cols="2"
      >
        <proposal-stat-obj
          color="grey"
          statText="Closed"
          :statVal="proposalStats.totalClosedProposals"
          :icon="icons.mdiCheckBold"
        >
        </proposal-stat-obj>
      </v-col>

      <!-- Test Space #3 -->
      <v-col
        cols="1"
      >
        <!--<v-card
          color="white"
          height="65"
        >
        </v-card>-->
      </v-col>
    </v-row>
  </v-card>
</template>

<script>
// eslint-disable-next-line object-curly-newline
import { mapState, mapGetters } from 'vuex'
import {
  mdiTrendingUp,
  mdiCheckBold,
} from '@mdi/js'

const CreateProposalButton = () => import('@/components/buttons/CreateProposalButton.vue')
const ProposalStatObj = () => import('@/components/widgets/ProposalStatObj.vue')

export default {
  components: {
    CreateProposalButton,
    ProposalStatObj,
  },

  data() {
    return {
      icons: {
        mdiTrendingUp,
        mdiCheckBold,
      },
      desktopStyleStr: 'd-flex align-center mx-6 mb-9 pt-6',
      mobileStyleStr: 'd-flex align-center mb-7 pt-6',
    }
  },

  computed: {
    ...mapState([
      'proposalStats',
      'proposalStatsLoaded',
    ]),
    ...mapGetters([
      'getProposalStats',
      'getProposalStatsLoaded',
    ]),
  },
}
</script>

<style lang="scss" scoped>

.proposal-stats-row {
  margin-left: auto;
  margin-right: auto;
}

</style>
