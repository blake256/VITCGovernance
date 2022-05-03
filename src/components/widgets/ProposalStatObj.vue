<template>
  <v-col
    class="d-flex"
  >
    <v-avatar
      size="44"
      :color="color"
      rounded
      class="elevation-1"
    >
      <v-icon
        dark
        color="white"
        size="30"
      >
        {{ icon }}
      </v-icon>
    </v-avatar>
    <div class="ms-3">
      <p class="text-xs mb-0">
        {{ statText }}
      </p>
      <h3 class="text-xl font-weight-semibold">
        {{ statVal }}
      </h3>
    </div>
  </v-col>
</template>

<script>
export default {
  props: {
    color: { type: String, default: '' },
    statText: { type: String, default: '' },
    statVal: { type: Number, default: 0 },
    icon: { type: String, default: '' },
  },
}
</script>

<style lang="scss" scoped>

</style>
