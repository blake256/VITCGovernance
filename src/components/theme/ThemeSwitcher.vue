<template>
  <v-fade-transition mode="out-in">
    <v-icon
      :key="$vuetify.theme.dark"
      @click="onThemeSwitched()"
    >
      {{ $vuetify.theme.dark ? icons.mdiWeatherNight : icons.mdiWeatherSunny }}
    </v-icon>
  </v-fade-transition>
</template>

<script>
import { mdiWeatherNight, mdiWeatherSunny } from '@mdi/js'
import eventBus from '@/utils/events/eventBus'

export default {
  setup() {
    return {
      icons: {
        mdiWeatherNight,
        mdiWeatherSunny,
      },
    }
  },

  methods: {
    async onThemeSwitched() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark
      eventBus.$emit('vuetify-theme-switched')
    },
  },
}
</script>
