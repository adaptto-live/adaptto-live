<template>
  <p class="mt-4">No current talk.</p>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCurrentTalkStore } from '@/stores/currentTalk'

const router = useRouter()
const currentTalkStore = useCurrentTalkStore()
let interval : number|undefined

onMounted(() => {
  if (!redirectToCurrentTalk()) {
    interval = window.setInterval(() => redirectToCurrentTalk(), 250)
  }
})
onUnmounted(() => {
  if (interval) {
    window.clearInterval(interval)
  }
})

function redirectToCurrentTalk() : boolean {
  const talkId = currentTalkStore.talkId
  if (talkId) {
    router.replace(`/talk/${talkId}`)
    return true
  }
  return false
}
</script>
