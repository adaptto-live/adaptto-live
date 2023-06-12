<template>
  <div class="app-framework">
    <header v-if="!route.meta.noHeader">
      <AppHeader />
    </header>
    <main class="container-fluid">
      <div class="alert alert-danger mt-3" role="alert" v-if="talkStore.loadingError">
        {{talkStore.loadingError}}
      </div>
      <RouterView :key="$route.fullPath"/>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import AppHeader from './components/structure/AppHeader.vue'
import { useAuthenticationStore } from './stores/authentication'
import socket from './util/socket'
import { useRatingStore } from './stores/rating'
import { useCurrentTalkStore } from './stores/currentTalk'
import { useTalksStore } from './stores/talks'

const talkStore = useTalksStore()
const authenticationStore = useAuthenticationStore()
const currentTalkStore = useCurrentTalkStore()
const ratingStore = useRatingStore()
const route = useRoute()

onMounted(() => {
  if (authenticationStore.isAuthenticated) {
    socket.auth = { username: authenticationStore.username }
    socket.connect()
  }

  socket.on('currentTalk', talkId => {
    currentTalkStore.set(talkId)
  })
  socket.on('talkRating', (talkId: string, rating?: number, comment?: string) => {
    if (rating) {
      ratingStore.addRating(talkId, rating, comment)
    }
    else {
      ratingStore.removeRating(talkId)
    }
  })
})

onUnmounted(() => {
  socket.disconnect()
})
</script>

<style lang="scss">
.app-framework {
  display: flex;
  flex-flow: column;
  height: 100vh;
  width: 100vw;
  header {
    flex: 0 1 auto;
  }
  main {
    flex: 1 1 auto;
    overflow-y: auto;
  }
}

.modal {
  --bs-modal-border-width: 5px;
}
</style>
