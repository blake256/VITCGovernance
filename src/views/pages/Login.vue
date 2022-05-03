<template>
  <v-row
    align="center"
    justify="center"
  >
    <v-card
      elevation="11"
      outlined
      height="375"
      width="375"
    >
      <h1 class="mt-5 headline text-center">
        Vite App Login
      </h1>
      <v-row
        justify="center"
        class="login-page-qr-box"
      >
        <wallet-qr-canvas
          height="350px"
        >
        </wallet-qr-canvas>
      </v-row>
    </v-card>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import eventBus from '@/utils/events/eventBus'
import WalletQrCanvas from '@/components/wallet/WalletQRCanvas.vue'

export default {
  components: {
    WalletQrCanvas,
  },

  computed: {
    ...mapState([
      'isWalletConnected',
      'currProposalID',
      'loginSendToPath',
    ]),
    ...mapGetters([
      'getIsWalletConnected',
      'getCurrProposalID',
      'getLoginSendToPath',
    ]),
  },

  async created() {
    eventBus.$on('login-request-successful', () => {
      if (this.isWalletConnected) {
        switch (this.loginSendToPath) {
          case 'create-proposal':
            if (this.currProposalID !== '') {
              this.$router.push({
                name: this.loginSendToPath,
                params: {
                  proposalID: this.currProposalID,
                },
              }).catch(() => {})
            }
            break
          default:
            this.$router.push({
              name: this.loginSendToPath,
            }).catch(() => {})
            break
        }
      }
    })
  },

  beforeDestroy() {
    // removing eventBus listeners
    eventBus.$off('login-request-successful')
  },
}
</script>

<style lang="scss" scoped>
.login-page-qr-box {
  margin-top: 25px;
}
</style>
