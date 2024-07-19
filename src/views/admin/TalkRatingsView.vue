<template>
  <button class="btn btn-secondary float-end btn-sm mt-2" @click="copyToClipboard" title="To convert the ';' in comments with a newline, replace them with CTRL+J in Excel">Copy to Clipboard</button>
  <h2 id="headlineAdminTalkRatings">Admin: Talk Ratings</h2>

  <table class="table table-striped table-hover" aria-describedby="headlineAdminTalkRatings">
    <thead>
      <tr>
        <th>Talk</th>
        <th>Speaker</th>
        <th>Rating</th>
        <th>Participants</th>
        <th>Comments</th>
      </tr>
    </thead>
    <tbody>
      <template v-for="talkRating in talkRatings" :key="talkRating.talk.id">
        <tr v-if="!talkRating.talk.lobby">
          <td>{{talkRating.talk.title}}</td>
          <td>{{talkRating.talk.speakers}}</td>
          <td>{{formatRating(talkRating.result?.averageRating)}}</td>
          <td>{{talkRating.result?.participants}}</td>
          <td>
            <template v-if="talkRating.result?.comments">
              <button type="button" class="btn btn-secondary btn-sm" data-bs-toggle="modal" :data-bs-target="`#modal-comments-${talkRating.talk.id}`">
                {{talkRating.result.comments.length}} Comments
              </button>
              <div class="modal" :id="`modal-comments-${talkRating.talk.id}`" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg modal-dialog-scrollable">
                  <div class="modal-content">
                    <div class="modal-header">
                      <h1 class="modal-title fs-5">{{talkRating.talk.title}}</h1>
                      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-body">
                      <ul>
                        <li v-for="(comment,index) in talkRating.result?.comments" :key="index">{{comment}}</li>
                      </ul>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </td>
        </tr>
      </template>
    </tbody>
  </table>

  <table id="excel-export" class="table d-none" data-bs-theme="light" aria-describedby="headlineAdminTalkRatings">
    <thead>
      <tr>
        <th>Talk</th>
        <th>Speaker</th>
        <th>Rating</th>
        <th>Participants</th>
        <th>Comments</th>
      </tr>
    </thead>
    <tbody>
      <template v-for="talkRating in talkRatings" :key="talkRating.talk.id">
        <tr v-if="!talkRating.talk.lobby">
          <td>{{talkRating.talk.title}}</td>
          <td>{{talkRating.talk.speakers}}</td>
          <td>{{formatRatingLocalized(talkRating.result?.averageRating)}}</td>
          <td>{{talkRating.result?.participants}}</td>
          <td style="white-space:pre;">
            <span v-for="(comment,index) in talkRating.result?.comments" :key="index">{{`${comment};`}}</span>
          </td>
        </tr>
      </template>
    </tbody>
  </table>

</template>

<script setup lang="ts">
import TalkManager from '@/services/TalkManager'
import { type Talk } from '@/stores/talks'
import copyElementToClipboard from '@/util/copyElementToClipboard'
import socket from '@/util/socket'
import type { AverageTalkRating } from '@/util/socket.types'
import { onMounted, ref } from 'vue'

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

function formatRating(rating? : number) : string|undefined {
  return rating?.toFixed(2)
}

function formatRatingLocalized(rating? : number) : string|undefined {
  if (rating) {
    return rating.toLocaleString('de-DE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }
}

function copyToClipboard() {
  const table = document.querySelector('#excel-export')
  if (table) {
    copyElementToClipboard(table)
  }
}
</script>

<style lang="scss" scoped>
td {
  word-break: break-word;
}
</style>
