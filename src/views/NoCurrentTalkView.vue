<template>
  <h1>No current talk.</h1>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import socket from '../util/socket'

const router = useRouter()

onMounted(() => {
  socket.on('currentTalk', talkId => {
    router.replace(`/talk/${talkId}`)
  })
})
</script>
