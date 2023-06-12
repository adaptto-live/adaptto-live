<template>
  <div class="speaker-view">
    <TalkQA :talk="talk" :speaker-view="true"/>
  </div>
</template>

<script setup lang="ts">
import type { Talk } from '@/stores/talks'
import TalkQA from '../talk/TalkQA.vue'
import { onMounted, onUnmounted } from 'vue'
import socket from '@/util/socket'

const props = defineProps<{
  talk: Talk
}>()

onMounted(() => {
  socket.emit('roomEnter', props.talk.id)
})
onUnmounted(() => {
  socket.emit('roomLeave', props.talk.id)
})
</script>

<style lang="scss" scoped>
.speaker-view {
  font-size: xx-large;
  color: #eee;
}
</style>