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

  mounted() {
    eventBus.$on('vite-wallet-connected', () => {
      switch (this.loginSendToPath) {
        case 'create-proposal':
          this.$router.push({
            name: this.loginSendToPath,
          }).catch(() => {})
          break
        case 'view-proposal':
          if (this.currProposalID !== '') {
            this.$router.push({
              name: this.loginSendToPath,
              params: {
                proposalID: this.currProposalID,
              },
            }).catch(() => {})
          }
          break
        case 'home':
          this.$router.push({
            name: this.loginSendToPath,
          }).catch(() => {})
          break
        default:
          this.$router.push({
            name: this.loginSendToPath,
          }).catch(() => {})
          break
      }
    })
  },

  beforeDestroy() {
    // removing eventBus listeners
    eventBus.$off('vite-wallet-connected')
  },
}
</script>

<style lang="scss" scoped>
.login-page-qr-box {
  margin-top: 25px;
}
</style>
