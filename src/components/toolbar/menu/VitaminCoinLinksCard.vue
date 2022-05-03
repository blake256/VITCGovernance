<template>
  <v-card
    :outlined="$vuetify.breakpoint.mobile"
    :width="$vuetify.breakpoint.mobile ? '80%' : ''"
    :class="$vuetify.breakpoint.mobile ? 'ml-8 mb-6' : ''"
  >
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
  </v-card>
</template>

<script>
import {
  mdiGithub,
  mdiHelpCircleOutline,
  mdiEyeOutline,
  mdiBookOpenBlankVariant,
} from '@mdi/js'

export default {
  setup() {
    return {
      // Icons
      icons: {
        mdiGithub,
        mdiHelpCircleOutline,
        mdiEyeOutline,
        mdiBookOpenBlankVariant,
      },
    }
  },
}
</script>

<style lang="scss" scoped>

</style>
