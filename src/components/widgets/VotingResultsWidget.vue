<template>
  <v-row>
    <!--<v-col
      cols="$vuetify.breakpoint.mobile ? '12' : '6'"
    >
      <vue-apex-charts
        ref="realtimeTotalVotesChart"
        :width="100%"
        :options="totalVotesChartOpts"
        :series="totalVotesChartData"
        :class="$vuetify.breakpoint.mobile ? 'mt-4' : ''"
      ></vue-apex-charts>
    </v-col>-->

    <vue-apex-charts
      ref="realtimeTotalVotesChart"
      :width="$vuetify.breakpoint.mobile ? '350' : '500'"
      :options="totalVotesChartOpts"
      :series="totalVotesChartData"
      :class="$vuetify.breakpoint.mobile ? 'ml-3 mt-4' : 'ml-4 mr-4'"
    ></vue-apex-charts>

    <v-divider
      v-if="!$vuetify.breakpoint.mobile"
      vertical
    ></v-divider>

    <vue-apex-charts
      ref="realtimeVotingPowerChart"
      :width="$vuetify.breakpoint.mobile ? '350' : '500'"
      :options="votingPowerChartOpts"
      :series="votingPowerChartData"
      :class="$vuetify.breakpoint.mobile ? 'ml-3 mt-3' : 'ml-1'"
    ></vue-apex-charts>
  </v-row>
</template>

<script>
import { mapState, mapGetters } from 'vuex'
import VueApexCharts from 'vue-apexcharts'
import eventBus from '@/utils/events/eventBus'

export default {

  components: {
    VueApexCharts,
  },

  data() {
    return {
      totalVotesChartOpts: {
        chart: {
          type: 'bar',
        },
        title: {
          text: 'Total Votes',
          align: 'center',
          style: {
            color: '#E7E3FC',
            fontSize: '16px',
          },
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: [() => {
              let color = '#5e5669'
              if (this.$vuetify.theme.dark) {
                color = '#E7E3FC'
              }

              return color
            }],
          },
        },
        xaxis: {
          categories: [],
          labels: {
            show: true,
            minWidth: 0,
          },
        },
        yaxis: {
          labels: {
            show: true,
            minWidth: 0,
          },
        },
        colors: [value => {
          const index = value.dataPointIndex
          let color = '#008ffb'
          if (this.currProposalVotingStats
              && this.currProposalVotingStats.winningIndices.includes(index)) {
            color = '#0fad88'
          }

          return color
        }],
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'horizontal',
            shadeIntensity: 0.25,
            gradientToColors: undefined,
            inverseColors: true,
            opacityFrom: 0.85,
            opacityTo: 0.85,
            stops: [50, 0, 100],
          },
        },
      },

      totalVotesChartData: [
        {
          name: 'Total Votes',
          data: [],
          redrawOnWindowResize: true,
        },
      ],

      votingPowerChartOpts: {
        chart: {
          type: 'bar',
        },
        title: {
          text: 'Voting Power',
          align: 'center',
          style: {
            color: '#E7E3FC',
            fontSize: '16px',
          },
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: [() => {
              let color = '#5e5669'
              if (this.$vuetify.theme.dark) {
                color = '#E7E3FC'
              }

              return color
            }],
          },
        },
        xaxis: {
          categories: [],
          labels: {
            show: true,
            minWidth: 0,
          },
        },
        yaxis: {
          labels: {
            show: true,
            minWidth: 0,
          },
        },
        colors: [value => {
          const index = value.dataPointIndex
          let color = '#008ffb'
          if (this.currProposalVotingStats
              && this.currProposalVotingStats.winningIndices.includes(index)) {
            color = '#0fad88'
          }

          return color
        }],
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'dark',
            type: 'horizontal',
            shadeIntensity: 0.25,
            gradientToColors: undefined,
            inverseColors: true,
            opacityFrom: 0.85,
            opacityTo: 0.85,
            stops: [50, 0, 100],
          },
        },
      },

      votingPowerChartData: [
        {
          name: 'Voting Power',
          data: [],
          redrawOnWindowResize: true,
        },
      ],
    }
  },

  computed: {
    ...mapState([
      'currProposal',
      'currProposalVotingStats',
      'currVotingStatsLoaded',
    ]),
    ...mapGetters([
      'getCurrProposal',
      'getCurrProposalVotingStats',
      'getCurrVotingStatsLoaded',
    ]),
  },

  created() {
    eventBus.$on('vuetify-theme-switched', () => {
      this.onThemeSwitch()
    })
  },

  mounted() {
    this.onMounted()
  },

  beforeDestroy() {
    // removing eventBus listener
    eventBus.$off('voting-results-updated')
    eventBus.$off('vuetify-theme-switched')
  },

  methods: {
    /**
     *
     */
    async onThemeSwitch() {
      if (this.$refs && this.$refs.realtimeTotalVotesChart) {
        this.totalVotesChartOpts.title.style.color = this.$vuetify.theme.dark ? '#E7E3FC' : '#5e5669'
        this.$refs.realtimeTotalVotesChart.updateOptions(this.totalVotesChartOpts)
      }

      if (this.$refs && this.$refs.realtimeVotingPowerChart) {
        this.votingPowerChartOpts.title.style.color = this.$vuetify.theme.dark ? '#E7E3FC' : '#5e5669'
        this.$refs.realtimeVotingPowerChart.updateOptions(this.votingPowerChartOpts)
      }
    },

    /**
     *
     */
    onMounted() {
      // Listen for any updates to current proposal voting stats
      eventBus.$on('voting-results-updated', () => {
        this.totalVotesChartData = this.currProposalVotingStats.optTotalVotesData
        if (this.$refs && this.$refs.realtimeTotalVotesChart) {
          this.$refs.realtimeTotalVotesChart.updateSeries(this.totalVotesChartData)
        }

        this.votingPowerChartData = this.currProposalVotingStats.optVotingPowerData
        if (this.$refs && this.$refs.realtimeVotingPowerChart) {
          this.$refs.realtimeVotingPowerChart.updateSeries(this.votingPowerChartData)
        }
      })

      // If current proosal is valid, set voting stats
      if (this.currProposal && this.currVotingStatsLoaded) {
        if (this.currProposalVotingStats) {
          this.totalVotesChartData = this.currProposalVotingStats.optTotalVotesData
          this.votingPowerChartData = this.currProposalVotingStats.optVotingPowerData
        }

        // Set the x-axis labels
        for (let i = 0; i < this.currProposal.options.length; ++i) {
          const { optionName } = this.currProposal.options[i]
          this.totalVotesChartOpts.xaxis.categories[i] = optionName
          this.votingPowerChartOpts.xaxis.categories[i] = optionName
        }
      }
    },
  },
}
</script>
