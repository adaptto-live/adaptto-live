<template>
  <div class="qa-big-view">
    <TalkQA :talk="talk" :qa-big-view="true" :messageAnswerFilter="messageAnswerFilter" :messageSortOrder="messageSortOrder"/>
  </div>
</template>

<script setup lang="ts">
import type { Talk } from '@/stores/talks'
import TalkQA from '../talk/TalkQA.vue'
import { onMounted, onUnmounted } from 'vue'
import socket from '@/util/socket'
import type MessageAnswerFilter from '@/services/MessageAnswerFilter'
import type MessageSortOrder from '@/services/MessageSortOrder'

const props = defineProps<{
  talk: Talk,
  messageAnswerFilter: MessageAnswerFilter,
  messageSortOrder: MessageSortOrder
}>()

onMounted(() => {
  socket.emit('roomEnter', props.talk.id)
})
onUnmounted(() => {
  socket.emit('roomLeave', props.talk.id)
})
</script>

<style lang="scss">
.qa-big-view {
  font-size: xx-large;
  color: #eee;
 .author {
    font-size: large;
    font-weight: normal !important;
  }
}
</style>
