<template>
  <component :is="resolveLayout">
    <router-view></router-view>
  </component>
</template>

<script>
import {
  computed,
  getCurrentInstance,
  reactive,
  toRefs,
  watch,
} from '@vue/composition-api'

const LayoutBlank = () => import('@/layouts/Blank.vue')
const LayoutContent = () => import('@/layouts/Content.vue')

export default {

  components: {
    LayoutBlank,
    LayoutContent,
  },

  setup() {
    const vm = getCurrentInstance().proxy

    const state = reactive({
      route: vm.$route,
    })

    watch(
      () => vm.$route,
      r => {
        state.route = r
      },
    )
    const { route } = { ...toRefs(state), router: vm.$router }

    const resolveLayout = computed(() => {
      // Handles initial route
      if (route.value.name === null) {
        return null
      }

      if (route.value.meta.layout === 'content') {
        return 'layout-content'
      }

      return 'layout-blank'
    })

    return {
      resolveLayout,
    }
  },
}
</script>
