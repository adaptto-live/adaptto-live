<template>
  <h2>Admin: KPI</h2>

  <template v-for="(dataset,index) in datasets" :key="index">
    <h4>{{dataset.title}}</h4>
    <div class="chart">
      <Line :data="getData(dataset)" :options="getOptions(dataset)"/>
    </div>
  </template>

</template>

<script setup lang="ts">
import socket from '@/util/socket'
import type { KPIDataset } from '@/util/socket.types'
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

onMounted(() => {
  const talkManager = new TalkManager()
  socket.emit('adminGetKPI', talkManager.days.map(day => day.date).filter(date => date !== undefined))
})
socket.on('adminKPIDataset', (dataset) => {
  if (dataset.days.length > 0) {
    datasets.value.push(dataset)
  }
})

function getData(dataset: KPIDataset) {
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

function getOptions(dataset: KPIDataset) {
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
          text: dataset.yAxisTitle,
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
