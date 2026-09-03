<template>
  <div class="break-view">
    <div class="title">
      <h3>{{talk.title}}</h3>
      <p v-if="talkTimeDuration">{{talkTimeDuration}}</p>
      <TalkModeratorNotes :talk="talk" :expanded="true"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import TalkModeratorNotes from '@/components/talk/TalkModeratorNotes.vue'
import type { Talk } from '@/stores/talks'
import { formatTalkTimeDuration } from '@/util/datetime'
import socket from '@/util/socket'
import { onMounted, onUnmounted } from 'vue'

const props = defineProps<{
  talk: Talk
}>()

const talkTimeDuration = formatTalkTimeDuration(props.talk)

// join the room to receive the moderator notes for this break/other entry
function socketConnectFunction() {
  window.setTimeout(() => socket.emit('roomEnter', props.talk.id), 500)
}
onMounted(() => {
  window.setTimeout(() => {
    socket.emit('roomEnter', props.talk.id)
    socket.on('connect', socketConnectFunction)
  }, 250)
})
onUnmounted(() => {
  socket.off('connect', socketConnectFunction)
  socket.emit('roomLeave', props.talk.id)
})
</script>

<style lang="scss" scoped>
.break-view {
  width: 100%;
  height: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
}
</style>
