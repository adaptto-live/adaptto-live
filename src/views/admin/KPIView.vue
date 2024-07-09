<template>
  <h2>Admin: KPI</h2>

  <template v-for="(dataset,index) in datasets" :key="index">
    <h4 class="mt-3">{{dataset.title}}</h4>
    <div class="chart">
      <Line :data="getDatasetData(dataset)" :options="getOptions(dataset.yAxisTitle)"/>
    </div>
  </template>

  <template v-if="talkRatings">
    <h4 class="mt-3">Average Talk Ratings</h4>
    <div class="chart">
      <Line :data="getTalkAverageRatingData(talkRatings)" :options="getOptions('Avg. Rating / Talk')"/>
    </div>

    <h4 class="mt-3">Talk Rating Participation</h4>
    <div class="chart">
      <Line :data="getTalkRatingParticipationData(talkRatings)" :options="getOptions('# Rating Participants / Talk')"/>
    </div>
  </template>

</template>

<script setup lang="ts">
import socket from '@/util/socket'
import type { KPIDataset, AverageTalkRating } from '@/util/socket.types'
import { onMounted, ref } from 'vue'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors
} from 'chart.js'
import { Line } from 'vue-chartjs'
import TalkManager from '@/services/TalkManager'

ChartJS.register(CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors
)

const axisLabelColor = '#ccc'

const datasets = ref([] as KPIDataset[])
const talkManager = new TalkManager()
const talkRatings = ref(undefined as AverageTalkRating[]|undefined)

onMounted(() => {
  socket.emit('adminGetKPI', talkManager.days.map(day => day.date).filter(date => date !== undefined))
  socket.emit('adminGetTalkRatings')
})
socket.on('adminKPIDataset', (dataset) => {
  if (dataset.days.length > 0) {
    datasets.value.push(dataset)
  }
})
socket.on('adminTalkRatings', (ratings: AverageTalkRating[]) => {
  talkRatings.value = ratings
})

function getDatasetData(dataset: KPIDataset) {
  return {
    labels: dataset.days[0].values
      .map(item => item.x)
      .map(value => hoursToTime(value)),
    datasets: dataset.days.map(day => ({
      label: `Day ${day.day}`,
      data: day.values
        .map(item => item.y)
        .map(value => value == 0 ? null : value)
    }))
  }
}

const minutesFormatter = new Intl.NumberFormat('en-GB', { 
  minimumIntegerDigits: 2
})

function hoursToTime(hours: number) : string {
  const partialHours = hours % 1
  const hour = Math.floor(hours)
  return `${hour}:${minutesFormatter.format(partialHours * 60)}`
}

function getTalkAverageRatingData(data: AverageTalkRating[]) {
  return getTalkRatingData(data, rating => rating.averageRating)
}

function getTalkRatingParticipationData(data: AverageTalkRating[]) {
  return getTalkRatingData(data, rating => rating.participants)
}

function getTalkRatingData(data: AverageTalkRating[], fn: (rating: AverageTalkRating) => number) {
  const maxTalkCount = talkManager.days.reduce((max, day) => Math.max(max, day.talks.filter(talk => !talk.lobby).length), 0)
  const labels = Array.from({length: maxTalkCount}, (_, index) => index + 1).map(index => `#${index}`)
  return {
    labels,
    datasets: talkManager.days.map(day => ({
      label: `Day ${day.day}`,
      data: day.talks.filter(talk => !talk.lobby).map(talk => {
        const rating = data.find(item => item.talkId == talk.id)
        const value = rating ? fn(rating) : 0
        return value > 0 ? value : null
      })
    }))
  }
}

function getOptions(yAxisTitle: string) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 10
    },
    scales: {
      x: {
        ticks: {
          color: axisLabelColor
        }
      },
      y: {
        grid: {
          color: axisLabelColor
        },
        ticks: {
          color: axisLabelColor
        },
        title: {
          display: true,
          text: yAxisTitle,
          color: axisLabelColor
        }
      }
    },
    datasets: {
      line: {
        tension: 0.2
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.chart {
  height: 300px;
  background-color: #000;
  border-radius: 10px;
}
</style>
