<template>
  <!-- Name & Logo -->
  <div class="vertical-nav-header d-flex items-center ps-6 pe-5 pt-5 pb-2">
    <router-link
      :to="{ name: 'home' }"
      class="d-flex align-center text-decoration-none"
    >
      <v-img
        :src="require('@/assets/img/logos/BallotIconPlaceholder.png')"
        max-height="30px"
        max-width="30px"
        alt="logo"
        contain
        eager
        class="app-logo me-3"
      ></v-img>
      <v-slide-x-transition>
        <h2 class="app-title text--primary">
          VITCGovernance
        </h2>
      </v-slide-x-transition>
    </router-link>
  </div>
</template>

<script>

export default {
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

</style>
