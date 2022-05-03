<template>
  <!-- Name & Logo -->
  <div
    :class="$vuetify.breakpoint.mobile ? mobileClassString : desktopClassString"
  >
    <v-img
      :src="require('@/assets/img/logos/BallotIconPlaceholder.png')"
      max-height="30px"
      max-width="30px"
      alt="VITCGovernance"
      contain
      eager
      class="app-logo me-3"
    ></v-img>
    <v-slide-x-transition>
      <h2
        :class="$vuetify.breakpoint.mobile ? 'app-title-mobile text--primary' : 'app-title-desktop text--primary'"
      >
        VITCGovernance
      </h2>
    </v-slide-x-transition>
  </div>
</template>

<script>

export default {
  data() {
    return {
      desktopClassString: 'vertical-nav-header d-flex items-center ps-6 pe-5 pt-0 pb-2',
      mobileClassString: 'vertical-nav-header d-flex items-center ps-1 pe-5 pt-0 pb-2 toolbar-header-leftside',
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

.app-title-desktop {
  transform: translateY(-2px);
}

.app-title-mobile {
  font-size: 22px;
}

.toolbar-header-leftside {
  transform: translateY(1.25px) translateX(9px);
}

.app-title-logo {
  transform: translateY(0.5px);
}

</style>
