<template>
  <div>
    <!-- Toolbar Name/Logo -->
    <toolbar-logo></toolbar-logo>

    <!-- Nav Toolbar -->
    <v-app-bar
      app
      absolute
      elevate-on-scroll
      color="transparent"
    >
      <div class="w-full">
        <div class="d-flex align-center mx-6">
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
import { ref } from '@vue/composition-api'
import {
  mdiMagnify,
} from '@mdi/js'

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

  setup() {
    const isDrawerOpen = ref(null)

    return {
      isDrawerOpen,
      icons: {
        mdiMagnify,
      },
    }
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
</style>
