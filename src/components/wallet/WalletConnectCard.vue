<template>
  <div>
    <!-- Menu used for desktop -->
    <v-menu
      v-if="!$vuetify.breakpoint.mobile"
      eager
      bottom
      offset-y
      open-on-hover
      close-delay="500"
      content-class="elevation-9"
      :close-on-click="true"
      transition="slide-y-reverse-transition"
      :disabled="isWalletConnected"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-icon
          :color="isWalletConnected ? 'green' : 'grey'"
          class="rotated-icon-90"
          v-bind="attrs"
          v-on="on"
        >
          {{ icons.mdiFloppyVariant }}
        </v-icon>
      </template>
      <wallet-qr-canvas
        v-if="!isWalletConnected"
        class="wallet-card-desktop"
        height="350px"
      >
      </wallet-qr-canvas>
    </v-menu>

    <!-- Dialog used for mobile -->
    <div
      v-if="$vuetify.breakpoint.mobile"
    >
      <v-btn
        icon
        dark
        :v-ripple="false"
        class="wallet-icon-btn"
        @click="onToggleFloppyIcon"
      >
        <v-icon
          :color="isWalletConnected ? 'green' : 'gray'"
          class="rotated-icon-90"
        >
          {{ icons.mdiFloppyVariant }}
        </v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script>
import {
  mdiFloppyVariant,
  mdiClose,
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
        mdiClose,
      },
      showWalletCard: false,
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

  methods: {
    async onToggleFloppyIcon() {
      // this.showWalletCard = !this.showWalletCard
      this.$store.commit('setLoginSendToPath', 'home')
      this.$router.push({
        name: 'login',
      })
    },
  },
}
</script>

<style lang="scss" scoped>

.rotated-icon-90 {
  transform: rotate(-90deg);
}

.wallet-icon-btn {
  transform: translateX(6px) translateY(1px);
}

.wallet-card-desktop {
  margin-top: 15px;
}

.login-dialog-mobile {
  margin-left: 22.5px;
}

.wallet-card-mobile {
  margin-top: 25px;
  ::-webkit-scrollbar {
    display: none;
  }
}

</style>
