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
      <button v-if="allowChangeCurrentTalk && currentTalkId != talk.id" class="float-end btn btn-sm btn-outline-primary ms-3" @click.stop="setCurrentTalkAskConfirmation(talk)">Set Current</button>
      <div class="float-end" v-if="!talk.lobby" @click.stop="">
        <TalkRating :talk="talk" :small-button="true"/>
      </div>
      <span class="talkTime">{{formatTalkTime(talk)}}</span>
      <span class="title">{{talk.title}}</span>
      <span class="speakers">{{talk.speakers}}</span>
    </li>
  </ul>

  <div class="modal" tabindex="-1" id="switchTalkConfirmModal">
    <div class="modal-dialog">
      <div class="modal-content" v-if="selectedTalk">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Set Current Talk</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>Do you want to change the current talk to <b>{{selectedTalk.title}}</b>?</p>
          <p>All users get notified by this change.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="setCurrentTalk(selectedTalk)">OK</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
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
import { useErrorMessagesStore } from '@/stores/errorMessages'
import { formatTalkTime } from '@/util/datetime'
import showModal from '@/util/showModal'

const router = useRouter()
const talkManager = new TalkManager()
const currentTalkStore = useCurrentTalkStore()
const currentTalkId = computed(() => currentTalkStore.talkId)
const currentTalk = computed(() => talkManager.getTalk(currentTalkId.value))
const authenticationStore = useAuthenticationStore()
const allowChangeCurrentTalk = authenticationStore.admin || authenticationStore.qaadmin
const errorMessagesStore = useErrorMessagesStore()
const selectedTalk = ref(undefined as Talk|undefined)

const currentDay = ref(currentTalk.value?.day ?? 1)
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

function setCurrentTalkAskConfirmation(talk : Talk) : void {
  selectedTalk.value = talk
  showModal('switchTalkConfirmModal')
}

function setCurrentTalk(talk : Talk) : void {
  currentTalkStore.set(talk.id)
  socket.emit('currentTalk', talk.id, result => {
    if (result.error) {
      errorMessagesStore.add(`Unable to set current talk: ${result.error}`)
    }
  })
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
  .talkTime {
    margin-right: 0.5rem;
    color: #aaa;
  }
  .title {
    font-weight: bold;
  }
  .speakers {
    margin-left: 0.5rem;
    color: #aaa;
    font-size: smaller;
  }
}

.list-group-item, .list-group-item:hover{ z-index: auto; }
</style>
