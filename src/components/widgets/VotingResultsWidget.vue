<template>
  <v-row>
    <vue-apex-charts
      ref="realtimeTotalVotesChart"
      width="500"
      :options="totalVotesChartOpts"
      :series="totalVotesChartData"
      class="ml-4 mr-5"
    ></vue-apex-charts>

    <v-divider
      :vertical="$vuetify.breakpoint.smAndUp"
    ></v-divider>

    <vue-apex-charts
      ref="realtimeVotingPowerChart"
      width="500"
      :options="votingPowerChartOpts"
      :series="votingPowerChartData"
      class="ml-1"
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
        },
        xaxis: {
          categories: [],
          labels: {
            show: true,
            minWidth: 0,
            style: {
              fontSize: '9px',
            },
          },
        },
        yaxis: {
          decimalsInFloat: 4,
          labels: {
            show: true,
            minWidth: 0,
            style: {
              fontSize: '8px',
            },
          },
        },
        colors: [value => {
          const index = value.dataPointIndex
          let color = '#008ffb'
          if (this.currProposalVotingStats
              && this.currProposalVotingStats.winningIndices.includes(index)) {
            color = '#13d8aa'
          }

          return color
        }],
        fill: {
          type: 'gradient',
          gradient: {
            shade: 'light',
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
        },
        xaxis: {
          categories: [],
          labels: {
            style: {
              fontSize: '9px',
            },
          },
        },
        yaxis: {
          decimalsInFloat: 4,
          labels: {
            show: true,
            minWidth: 0,
            style: {
              fontSize: '8px',
            },
          },
        },
        colors: [value => {
          const index = value.dataPointIndex
          let color = '#008ffb'
          if (this.currProposalVotingStats
              && this.currProposalVotingStats.winningIndices.includes(index)) {
            color = '#13d8aa'
          }

          return color
        }],
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
      this.totalVotesChartOpts.title.style.color = this.$vuetify.theme.dark ? '#E7E3FC' : '#000000'
      this.votingPowerChartOpts.title.style.color = this.$vuetify.theme.dark ? '#E7E3FC' : '#000000'
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
