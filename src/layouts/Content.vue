<template>
  <v-app>
    <!-- APP START -->

    <!-- Toolbar Header -->
    <toolbar-header></toolbar-header>

    <!-- Main Container -->
    <v-main>
      <div class="app-content-container boxed-container pa-6">
        <slot></slot>
      </div>
    </v-main>

  <!-- APP END -->
  </v-app>
</template>

<script>
const ToolbarHeader = () => import('@/components/toolbar/ToolbarHeader.vue')

export default {
  components: {
    ToolbarHeader,
  },
}
</script>

<style lang="scss" scoped>
.app-theme-color {
  color: #323232 !important;
}

.boxed-container {
  max-width: 1080px;
  margin-left: auto;
  margin-right: auto;
}
</style>
