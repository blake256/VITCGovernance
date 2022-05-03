<template>
  <!-- Dropdown Menu -->
  <div>
    <div
      v-if="!$vuetify.breakpoint.mobile"
    >
      <v-menu
        bottom
        offset-y
        content-class="elevation-9"
        open-on-hover
        close-delay="500"
        :close-on-content-click="false"
        :close-on-click="false"
        eager
        transition="slide-y-reverse-transition"
        left
      >
        <template v-slot:activator="{ on, attrs }">
          <v-badge
            bottom
            :color="isWalletConnected ? 'green' : 'red'"
            overlap
            offset-x="12"
            offset-y="12"
            class="ms-4"
            dot
          >
            <v-avatar
              size="40px"
              v-bind="attrs"
              v-on="on"
            >
              <v-icon
                v-if="!isWalletConnected"
              >
                {{ icons.mdiAccountCircle }}
              </v-icon>

              <v-img
                v-else
                :src="currAvatarURL"
              >
              </v-img>
            </v-avatar>
          </v-badge>
        </template>
        <!-- Links Card -->
        <vitamin-coin-links-card></vitamin-coin-links-card>
      </v-menu>
    </div>
    <div
      v-if="$vuetify.breakpoint.mobile"
    >
      <div
        @click="onToggleDropdown"
      >
        <v-badge
          bottom
          :color="isWalletConnected ? 'green' : 'red'"
          overlap
          offset-x="12"
          offset-y="12"
          class="ms-3"
          dot
        >
          <v-avatar
            size="40px"
          >
            <v-icon
              v-if="!isWalletConnected"
              @touchcancel="onToggleDropdown"
            >
              {{ icons.mdiAccountCircle }}
            </v-icon>
            <v-img
              v-else
              :src="currAvatarURL"
              @touchcancel="onToggleDropdown"
            >
            </v-img>
          </v-avatar>
        </v-badge>
      </div>
      <div
        v-if="$vuetify.breakpoint.mobile && showDropdown"
      >
        <v-dialog
          v-model="showDropdown"
          :overlay-opacity="0.85"
        >
          <v-toolbar
            flat
            dark
            color="transparent"
          >
            <v-btn
              icon
              dark
              @click="onToggleDropdown"
            >
              <v-icon>
                {{ icons.mdiClose }}
              </v-icon>
            </v-btn>
          </v-toolbar>
          <v-row
            align="center"
            justify="space-around"
          >
            <vitamin-coin-links-card></vitamin-coin-links-card>
          </v-row>
        </v-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import {
  mdiHomeOutline,
  mdiAccountCircle,
  mdiClose,
} from '@mdi/js'

const VitaminCoinLinksCard = () => import('./VitaminCoinLinksCard.vue')

export default {
  components: {
    VitaminCoinLinksCard,
  },

  setup() {
    return {
      // Icons
      icons: {
        mdiHomeOutline,
        mdiAccountCircle,
        mdiClose,
      },
      showDropdown: false,
    }
  },

  computed: {
    ...mapState([
      'isWalletConnected',
      'connectedWalletAddr',
      'currAvatarURL',
    ]),
    ...mapGetters([
      'getIsWalletConnected',
      'getConnectedWalletAddr',
      'getCurrAvatarURL',
    ]),
  },

  methods: {
    async onToggleDropdown() {
      this.showDropdown = !this.showDropdown
    },
  },
}
</script>

<style lang="scss" scoped>
.mobile-avatar-button {
  transform: scale(1.01) translateY(1.75px);
}

.mobile-v-menu {
  top: 50px !important;
  right: 10px !important;
}

</style>
