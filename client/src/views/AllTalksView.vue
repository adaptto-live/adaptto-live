<template>
  <h2>All Talks</h2>

  <ul class="nav nav-tabs">
    <li class="nav-item" v-for="day in talkManager.days" :key="day.day">
      <a class="nav-link" href="#"
          :class="{active:currentDay == day.day}"
          @click.prevent="switchDay(day.day)" >Day {{day.day}}</a>
    </li>
    <li class="nav-item">
      <a class="nav-link" href="#"
          :class="{active:currentDay == 0}"
          @click.prevent="switchDay(0)">All</a>
    </li>
  </ul>

  <ul class="list-group talks">
    <li v-for="talk in talks" :key="talk.id" class="list-group-item list-group-item-action"
        :class="{active:currentTalkId == talk.id}"
        @click="navigateTo(talk)">
      <button v-if="admin && currentTalkId != talk.id" class="float-end btn btn-sm btn-outline-primary ms-3" @click.stop="setCurrentTalk(talk)">Set Current</button>
      <div class="float-end" v-if="currentTalk && !talkManager.isAfter(talk, currentTalk)" @click.stop="">
        <TalkRating :talk="talk" :small-button="true"/>
      </div>
      <span class="title">{{talk.title}}</span>
      <span class="speakers">{{talk.speakers}}</span>
    </li>
  </ul>
</template>

<script setup lang="ts">
import TalkRating from '@/components/talk/TalkRating.vue'
import TalkManager from '@/services/TalkManager'
import { useAuthenticationStore } from '@/stores/authentication'
import { type Talk } from '@/stores/talks'
import { useCurrentTalkStore } from '@/stores/currentTalk'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import socket from '@/util/socket'

const router = useRouter()
const talkManager = new TalkManager()
const currentTalkStore = useCurrentTalkStore()
const currentTalkId = computed(() => currentTalkStore.talkId)
const currentTalk = computed(() => talkManager.getTalk(currentTalkId.value))
const admin = useAuthenticationStore().isAdmin

let currentDay = ref(currentTalk.value?.day ?? 1)
const talks = computed(() => {
  if (currentDay.value > 0) {
    return talkManager.getDay(currentDay.value)?.talks
  }
  return talkManager.talks
}) 

function switchDay(day : number) : void {
  currentDay.value = day
}

function navigateTo(talk : Talk) : void {
  router.push(`/talk/${talk.id}`)
}

function setCurrentTalk(talk : Talk) : void {
  currentTalkStore.set(talk.id)
  socket.emit('currentTalk', talk.id)
}
</script>

<style lang="scss" scoped>
.talks {
  li {
    cursor: pointer;
    div {
      cursor: default;
    }
  }
  .title {
    font-weight: bold;
  }
  .speakers {
    margin-left: 0.5rem;
    font-size: smaller;
  }
}

.list-group-item, .list-group-item:hover{ z-index: auto; }
</style>
