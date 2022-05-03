<template>
  <div
    v-if="isLoggedIn"
  >
    <template v-if="isWalletConnected && whitelisted()">
      <v-tooltip top>
        <template v-slot:activator="{ on, attrs }">
          <span
            v-bind="attrs"
            v-on="on"
          >
            <FormulateForm
              @submit="createProposalHandler()"
            >
              <FormulateInput
                type="submit"
                label="Create Proposal"
                color="primary"
                :disabled="!isWalletConnected || !whitelisted()"
              />
            </FormulateForm>
          </span>
        </template>
        <span>Vite wallet must be connected and your address whitelisted to create a proposal.</span>
      </v-tooltip>
    </template>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import eventBus from '@/utils/events/eventBus'
import { isUserAdmin } from '@/firebase/firebase'

export default {
  data() {
    return {
      isLoggedIn: false,
    }
  },

  computed: {
    ...mapState([
      'isWalletConnected',
    ]),
    ...mapGetters([
      'getIsWalletConnected',
    ]),
  },

  created() {
    eventBus.$on('vite-wallet-connected', () => {
      this.isLoggedIn = true
    })
  },

  mounted() {
    this.isLoggedIn = this.isWalletConnected
  },

  beforeDestroy() {
    eventBus.$off('vite-wallet-connected')
  },

  methods: {
    /**
     *
     */
    createProposalHandler() {
      this.$router.push('create-proposal').catch(() => {})
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

<style>
</style>
