<template>
  <!-- Dropdown Menu -->
  <v-menu
    bottom
    offset-y
    content-class="elevation-9"
    open-on-hover
    close-delay="500"
    :close-on-content-click="false"
    eager
    transition="slide-y-reverse-transition"
    left
    nudge-bottom="15"
  >
    <template #activator="{ on, attrs }">
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
    <v-list>
      <v-list-item
        to="about"
      >
        <v-list-item-icon>
          <v-icon>
            {{ icons.mdiHelpCircleOutline }}
          </v-icon>
        </v-list-item-icon>

        <v-list-item-title
          class="ml-2"
        >
          About
        </v-list-item-title>
      </v-list-item>
      <v-list-item
        href="https://github.com/Vitamin-Coin/VITCGovernance/blob/main/README.md"
        target="_blank"
        rel="nofollow"
      >
        <v-list-item-icon>
          <v-icon>
            {{ icons.mdiBookOpenBlankVariant }}
          </v-icon>
        </v-list-item-icon>

        <v-list-item-title
          class="ml-2"
        >
          Documentation
        </v-list-item-title>
      </v-list-item>
      <v-list-item
        href="https://github.com/Vitamin-Coin/VITCGovernance"
        target="_blank"
        rel="nofollow"
      >
        <v-list-item-icon>
          <v-icon>
            {{ icons.mdiGithub }}
          </v-icon>
        </v-list-item-icon>

        <v-list-item-title
          class="ml-2"
        >
          Github
        </v-list-item-title>
      </v-list-item>
      <v-list-item
        href="https://github.com/Vitamin-Coin/VITCGovernance/#copyright-%EF%B8%8F"
        target="_blank"
        rel="nofollow"
      >
        <v-list-item-icon>
          <v-icon>
            {{ icons.mdiEyeOutline }}
          </v-icon>
        </v-list-item-icon>

        <v-list-item-title
          class="ml-2"
        >
          Copyright
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import {
  mdiDotsHorizontal,
  mdiGithub,
  mdiHelpCircleOutline,
  mdiEyeOutline,
  mdiHomeOutline,
  mdiBookOpenBlankVariant,
  mdiAccountCircle,
} from '@mdi/js'

export default {
  setup() {
    return {
      // Icons
      icons: {
        mdiDotsHorizontal,
        mdiGithub,
        mdiHelpCircleOutline,
        mdiEyeOutline,
        mdiHomeOutline,
        mdiBookOpenBlankVariant,
        mdiAccountCircle,
      },
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
}
</script>

<style lang="scss" scoped>

</style>
