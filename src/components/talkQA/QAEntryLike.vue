<template>
  <button class="btn btn-sm btn-outline-secondary" @click="likeToggle">
    <img v-if="userLiked" src="@/assets/thumbs-up-active.svg" class="thumbs-up">
    <img v-else src="@/assets/thumbs-up.svg" class="thumbs-up">
    <div class="count">{{likeUserIds.length}}</div>
  </button>
</template>

<script setup lang="ts">
import type Message from '@/services/Message'
import { useAuthenticationStore } from '@/stores/authentication'
import { useErrorMessagesStore } from '@/stores/errorMessages'
import { computed, ref } from 'vue';
import socket from '@/util/socket'

const props = defineProps<{
  message: Message
}>()

const authenticationStore = useAuthenticationStore()
const errorMessagesStore = useErrorMessagesStore()

const userId = authenticationStore.userid
const likeUserIds = ref(props.message.likeUserIds ?? [])
const userLiked = computed(() => likeUserIds.value.includes(userId))

function likeToggle() : void {
  if (likeUserIds.value.includes(userId)) {
    likeUserIds.value = likeUserIds.value.filter(id => id != userId)
  }
  else {
    likeUserIds.value.push(userId)
  }
  socket.emit('qaEntryLike', { id:props.message.id }, result => {
    if (result.error) {
      errorMessagesStore.add(`Unable to like/unlike QA entry: ${result.error}`)
    }
  })
}
</script>

<style lang="scss" scoped>
.thumbs-up {
  height: 1.5rem;
}
</style>
