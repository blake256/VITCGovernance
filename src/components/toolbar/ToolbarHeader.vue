<template>
  <div>
    <!-- Toolbar Name/Logo -->
    <v-col
      cols="2"
      class="pr-0 pl-0"
      :v-ripple="false"
      @click="onTitleLogoClick"
      @touchcancel="onTitleLogoClick"
    >
      <v-card
        color="transparent"
        max-height="30"
        class="hack-title-logo"
      >
        <toolbar-logo></toolbar-logo>
      </v-card>
    </v-col>

    <!-- Nav Toolbar -->
    <v-app-bar
      app
      absolute
      elevate-on-scroll
      color="transparent"
    >
      <div class="w-full">
        <div
          :class="$vuetify.breakpoint.mobile ? mobileClassString : desktopClassString"
        >
          <v-spacer></v-spacer>

          <!-- Wallet Connect -->
          <wallet-connect-card></wallet-connect-card>

          <!-- Theme Switcher -->
          <theme-switcher class="theme-switcher-btn"></theme-switcher>

          <!-- Dropdown Menu -->
          <dropdown-menu></dropdown-menu>
        </div>
      </div>
    </v-app-bar>
  </div>
</template>

<script>
import { mdiMagnify } from '@mdi/js'

const DropdownMenu = () => import('./menu/DropdownMenu.vue')
const ToolbarLogo = () => import('@/components/toolbar/ToolbarLogo.vue')
const ThemeSwitcher = () => import('@/components/theme/ThemeSwitcher.vue')
const WalletConnectCard = () => import('@/components/wallet/WalletConnectCard.vue')

export default {
  components: {
    DropdownMenu,
    ToolbarLogo,
    ThemeSwitcher,
    WalletConnectCard,
  },

  data() {
    return {
      icons: {
        mdiMagnify,
      },
      desktopClassString: 'd-flex align-center mx-6',
      mobileClassString: 'd-flex align-center mx-1 toolbar-header-rightside',
    }
  },

  methods: {
    async onTitleLogoClick() {
      this.$router.push({
        name: 'home',
      }).catch(() => {})
    },
  },
}
</script>

<style lang="scss" scoped>
.v-app-bar ::v-deep {
  .v-toolbar__content {
    padding: 0;
  }
}

.v-list-item .v-list-item__icon {
  margin: 8px 5px !important;
}

.theme-switcher-btn {
  margin-left: 20px;
}

.boxed-container {
  max-width: 1080px;
  margin-left: auto;
  margin-right: auto;
}

.hack-title-logo {
  z-index: 1000;
}

.toolbar-header-rightside {
  transform: translateY(2px) translateX(-8px);
}
</style>
