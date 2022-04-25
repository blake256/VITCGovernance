<template>
  <v-container
    fluid
  >
    <!-- BASE ROW -->
    <v-row>
      <!-- AREA 1 -->
      <v-col
        cols="12"
        md="2"
      >
        <v-card
          height="200"
          :color="uiTestColors[0]"
        >
          <v-card-title>
            <span>
              AREA 1
            </span>
          </v-card-title>
        </v-card>
      </v-col>

      <!-- AREA 2 -->
      <v-col
        cols="12"
        md="10"
      >
        <v-card
          height="200"
          :color="uiTestColors[1]"
        >
          <v-card-title>
            <span>
              AREA 2
            </span>
          </v-card-title>
        </v-card>
      </v-col>

      <!-- AREA 3 -->
      <v-col
        cols="12"
        sm="6"
        md="4"
      >
        <v-card
          height="425"
          :color="uiTestColors[2]"
        >
          <v-card-title>
            <span>
              AREA 3
            </span>
          </v-card-title>
        </v-card>
      </v-col>

      <!-- AREA 4 -->
      <v-col
        cols="12"
        md="4"
        sm="6"
      >
        <v-card
          height="425"
          :color="uiTestColors[3]"
        >
          <v-card-title>
            <span>
              AREA 4
            </span>
          </v-card-title>
        </v-card>
      </v-col>

      <!-- AREA 5 -->
      <v-col
        cols="12"
        md="4"
      >
        <!-- INNER-COLUMN-#5 ROW-#1 -->
        <v-row
          class="match-height"
        >
          <!-- AREA 5_1 -->
          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              height="200"
              :color="uiTestColors[4]"
            >
              <v-card-title>
                <span>
                  AREA 5_1
                </span>
              </v-card-title>
            </v-card>
          </v-col>

          <!-- AREA 5_2 -->
          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              height="200"
              :color="uiTestColors[5]"
            >
              <v-card-title>
                <span>
                  AREA 5_2
                </span>
              </v-card-title>
            </v-card>
          </v-col>

          <!-- AREA 5_3 -->
          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              height="200"
              :color="uiTestColors[6]"
            >
              <v-card-title>
                <span>
                  AREA 5_3
                </span>
              </v-card-title>
            </v-card>
          </v-col>

          <!-- AREA 5_4 -->
          <v-col
            cols="12"
            sm="6"
          >
            <v-card
              height="200"
              :color="uiTestColors[7]"
            >
              <v-card-title>
                <span>
                  AREA 5_4
                </span>
              </v-card-title>
            </v-card>
          </v-col>
        </v-row>
      </v-col>

      <!-- AREA 6 -->
      <v-col
        cols="12"
        md="4"
      >
        <v-card
          height="200"
          :color="uiTestColors[8]"
        >
          <v-card-title>
            <span>
              AREA 6
            </span>
          </v-card-title>
        </v-card>
      </v-col>

      <!-- AREA 7 -->
      <v-col
        cols="12"
        md="8"
      >
        <v-card
          height="200"
          :color="uiTestColors[9]"
        >
          <v-card-title>
            <span>
              AREA 7
            </span>
          </v-card-title>
        </v-card>
      </v-col>

      <!-- AREA 8 -->
      <v-col
        cols="12"
      >
        <v-card
          height="200"
          :color="uiTestColors[10]"
        >
          <v-card-title>
            <span>
              AREA 8
            </span>
          </v-card-title>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
// import { mapState, mapGetters } from 'vuex'

export default {
  // components: {
  //   ViewAssetCard,
  // },

  data() {
    return {
      uiTestColors: [
        'red',
        'blue',
        'green',
        '#B8860B',
        'purple',
        '#CD5C5C',
        'orange',
        'grey',
        '#191970',
        'white',
        'teal',
      ],
    }
  },

  // computed: {
  //   ...mapState([
  //     'currAssetInView',
  //   ]),
  //   ...mapGetters([
  //     'getCurrAssetInView',
  //   ]),
  // },

  // created() {
  //   this.onCreated()
  // },

  // methods: {
  //   onCreated() {
  //     console.log('[TestViewAsset.vue] onCreated()')
  //   },
  // },
}
</script>
