<template>
  <div>
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
import { isUserAdmin } from '@/firebase/firebase'

export default {
  computed: {
    ...mapState([
      'isWalletConnected',
    ]),
    ...mapGetters([
      'getIsWalletConnected',
    ]),
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
