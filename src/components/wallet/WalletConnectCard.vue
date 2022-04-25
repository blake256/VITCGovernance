<template>
  <v-menu
    eager
    bottom
    offset-y
    open-on-hover
    close-delay="500"
    content-class="elevation-9"
    :close-on-content-click="false"
    transition="slide-y-reverse-transition"
    nudge-bottom="15"
    :disabled="isWalletConnected"
  >
    <template #activator="{ on, attrs }">
      <v-icon
        :color="isWalletConnected ? 'green' : 'gray'"
        class="rotated-icon-90"
        v-bind="attrs"
        v-on="on"
      >
        {{ icons.mdiFloppyVariant }}
      </v-icon>
    </template>

    <wallet-qr-canvas
      v-if="!isWalletConnected"
      class="wallet-card-qr-style"
      height="350px"
    >
    </wallet-qr-canvas>
  </v-menu>
</template>

<script>
import {
  mdiFloppyVariant,
} from '@mdi/js'
import { mapState, mapGetters } from 'vuex'
import WalletQrCanvas from './WalletQRCanvas.vue'

export default {

  components: {
    WalletQrCanvas,
  },

  data() {
    return {
      icons: {
        mdiFloppyVariant,
      },
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
}
</script>

<style lang="scss" scoped>

.rotated-icon-90 {
  transform: rotate(-90deg);
}

.wallet-card-qr-style {
    margin-left: 35px;
    margin-top: 15px;
}

</style>
