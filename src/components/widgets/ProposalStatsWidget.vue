<template>
  <v-card>
    <div class="w-full">
      <div class="d-flex align-center mx-6 mb-9 pt-6">
        <h2>
          Proposals
        </h2>
        <v-spacer></v-spacer>
        <create-proposal-button></create-proposal-button>
      </div>
    </div>
    <v-divider></v-divider>
    <v-card-text>
      <v-row
        v-if="proposalStatsLoaded"
        class="pt-3"
      >
        <v-col
          cols="6"
          md="3"
          class="d-flex align-center proposal-stats-row"
        >
          <v-avatar
            size="44"
            color="primary"
            rounded
            class="elevation-1 ms-15"
          >
            <v-icon
              dark
              color="white"
              size="30"
            >
              {{ icons.mdiTrendingUp }}
            </v-icon>
          </v-avatar>
          <div class="ms-3">
            <p class="text-xs mb-0">
              Active
            </p>
            <h3 class="text-xl font-weight-semibold">
              {{ proposalStats.totalActiveProposals }}
            </h3>
          </div>
        </v-col>
        <v-col
          cols="6"
          md="3"
          class="d-flex align-center proposal-stats-row"
        >
          <v-avatar
            size="44"
            color="grey"
            rounded
            class="elevation-1 ms-15"
          >
            <v-icon
              dark
              color="white"
              size="30"
            >
              {{ icons.mdiCheckBold }}
            </v-icon>
          </v-avatar>
          <div class="ms-3">
            <p class="text-xs mb-0">
              Closed
            </p>
            <h3 class="text-xl font-weight-semibold">
              {{ proposalStats.totalClosedProposals }}
            </h3>
          </div>
        </v-col>
      </v-row>
    </v-card-text>
  </v-card>
</template>

<script>
// eslint-disable-next-line object-curly-newline
import { mapState, mapGetters } from 'vuex'
import {
  mdiTrendingUp,
  mdiCheckBold,
} from '@mdi/js'
import CreateProposalButton from '@/components/buttons/CreateProposalButton.vue'

export default {
  components: {
    CreateProposalButton,
  },

  data() {
    return {
      icons: {
        mdiTrendingUp,
        mdiCheckBold,
      },
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
@import '@braid/vue-formulate/themes/snow/snow.scss';

.proposal-stats-row {
  margin-left: auto;
  margin-right: auto;
}
</style>
