<template>
  <canvas ref="walletConnectQRCode"></canvas>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import eventBus from '@/utils/events/eventBus'

const QRCode = require('qrcode')

export default {
  computed: {
    ...mapState([
      'vbInstance',
      'currWalletURI',
    ]),
    ...mapGetters([
      'getVbInstance',
      'getCurrWalletURI',
    ]),
  },

  mounted() {
    if (!this.currWalletURI || this.currWalletURI === '') {
      eventBus.$on('vite-wallet-disconnected', () => {
        this.initWalletQR()
      })

      this.initWalletQR()
    } else {
      QRCode.toCanvas(this.$refs.walletConnectQRCode, this.currWalletURI)
    }
  },

  beforeDestroy() {
    // removing eventBus listeners
    eventBus.$off('vite-wallet-disconnected')
  },

  methods: {

    async initWalletQR() {
      if (this.vbInstance) {
        // Create bridge session and save vbInstance
        await this.vbInstance.createSession()

        // Save wallet URI state
        this.$store.commit('setCurrWalletURI', this.vbInstance.uri)

        // Pass bridge uri to qrcode
        if (this.currWalletURI.length > 0) {
          QRCode.toCanvas(this.$refs.walletConnectQRCode, this.currWalletURI)
        }
      }
    },
  },
}
</script>
