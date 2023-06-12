<template>
  <h2 id="headlineAdminTalkRatings">Admin: Talk Ratings</h2>

  <table class="table table-striped table-hover" aria-describedby="headlineAdminTalkRatings">
    <thead>
      <tr>
        <th>Talk</th>
        <th>Speaker</th>
        <th>Average Rating</th>
        <th>Participants</th>
        <th>Comments</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="talkRating in talkRatings" :key="talkRating.talk.id">
        <td>{{talkRating.talk.title}}</td>
        <td>{{talkRating.talk.speakers}}</td>
        <td>{{talkRating.result?.averageRating.toFixed(2)}}</td>
        <td>{{talkRating.result?.participants}}</td>
        <td>
          <ul v-if="talkRating.result?.comments" class="small">
            <li v-for="(comment,index) in talkRating.result?.comments" :key="index">{{comment}}</li>
          </ul>
        </td>
      </tr>
    </tbody>
  </table>

</template>

<script setup lang="ts">
import TalkManager from '@/services/TalkManager'
import { type Talk } from '@/stores/talks'
import socket from '@/util/socket'
import { onMounted, ref } from 'vue'
import type AverageTalkRating from '@/services/AverageTalkRating'

const talkManager = new TalkManager()
const talkRatings = ref([] as {talk: Talk, result?: AverageTalkRating}[])

onMounted(() => {
  socket.emit('adminGetTalkRatings')
})
socket.on('adminTalkRatings', (ratings: AverageTalkRating[]) => {
  talkRatings.value = talkManager.talks.map(talk => ({
    talk, result: ratings.find(item => item.talkId == talk.id)
  }))
})
</script>
