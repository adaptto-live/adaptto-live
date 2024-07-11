<template>
  <button class="btn btn-sm btn-outline-secondary" @click="likeToggle">
    <img v-if="userLiked" src="@/assets/thumbs-up-active.svg" alt="Thumbs up" class="thumbs-up">
    <img v-else src="@/assets/thumbs-up.svg" alt="Thumbs up" class="thumbs-up">
    <div class="count" :class="{hasVotes:likeCount>0}">{{likeCount}}</div>
  </button>
</template>

<script setup lang="ts">
import { useAuthenticationStore } from '@/stores/authentication'
import { useErrorMessagesStore } from '@/stores/errorMessages'
import { computed, ref } from 'vue'
import socket from '@/util/socket'

const props = defineProps<{
  id: string
  likeUserIds?: string[]
}>()

const authenticationStore = useAuthenticationStore()
const errorMessagesStore = useErrorMessagesStore()

const userId = authenticationStore.userid
const likeUserIds = ref(props.likeUserIds ?? [])
const userLiked = computed(() => likeUserIds.value.includes(userId))
const likeCount = computed(() => likeUserIds.value.length)

function likeToggle() : void {
  if (likeUserIds.value.includes(userId)) {
    likeUserIds.value = likeUserIds.value.filter(id => id != userId)
  }
  else {
    likeUserIds.value.push(userId)
  }
  socket.emit('qaEntryLike', { id:props.id }, result => {
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
.count.hasVotes {
  color: #fff;
}
</style>
