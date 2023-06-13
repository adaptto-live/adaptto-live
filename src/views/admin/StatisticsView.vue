<template>
  <h2 id="headlineAdminStatistics">Admin: Statistics</h2>

  <table class="table table-striped table-hover" aria-describedby="headlineAdminStatistics">
    <tbody>
      <tr>
        <th># Talks</th>
        <td>{{talkManager.talks.length}}</td>
      </tr>
      <tr>
        <th># Login Codes</th>
        <td>{{loginCodes}}</td>
      </tr>
      <tr>
        <th># Users</th>
        <td>{{users}}</td>
      </tr>
      <tr>
        <th># Talk Ratings</th>
        <td>{{talkRatings}}</td>
      </tr>
      <tr>
        <th># Messages</th>
        <td>{{messages}}</td>
      </tr>
      <tr>
        <th># QA Entries</th>
        <td>{{qAEntries}}</td>
      </tr>
    </tbody>
  </table>

</template>

<script setup lang="ts">
import TalkManager from '@/services/TalkManager'
import socket from '@/util/socket'
import { onMounted, ref } from 'vue'

const talkManager = new TalkManager()

const loginCodes = ref(undefined as number|undefined)
const users = ref(undefined as number|undefined)
const talkRatings = ref(undefined as number|undefined)
const messages = ref(undefined as number|undefined)
const qAEntries = ref(undefined as number|undefined)

onMounted(() => {
  socket.emit('adminGetStatistics')
})
socket.on('adminStatistics', (numLoginCodes, numUsers, numTalkRatings, numMessages, numQAEntries) => {
  loginCodes.value = numLoginCodes
  users.value = numUsers
  talkRatings.value = numTalkRatings
  messages.value = numMessages
  qAEntries.value = numQAEntries
})

</script>
