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

      <div class="modal" tabindex="-1" ref="currentTalkChangeModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5">Current Talk Change</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>The current talk has changed.</p>
              <p>Go to talk <strong>{{currentTalk?.title}}</strong>?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="goToCurrentTalk">OK</button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup lang="ts">
import { onBeforeMount, onUnmounted, ref } from 'vue'
import { RouterView, useRoute, useRouter } from 'vue-router'
import AppHeader from './components/structure/AppHeader.vue'
import { useAuthenticationStore } from './stores/authentication'
import socket from './util/socket'
import { useRatingStore } from './stores/rating'
import { useCurrentTalkStore } from './stores/currentTalk'
import { useTalksStore, type Talk } from './stores/talks'
import { Modal } from 'bootstrap'
import TalkManager from './services/TalkManager'

const authenticationStore = useAuthenticationStore()
const talkStore = useTalksStore()
const currentTalkStore = useCurrentTalkStore()
const ratingStore = useRatingStore()
const route = useRoute()
const router = useRouter()
const talkManager = new TalkManager()

const currentTalkChangeModal = ref(undefined as HTMLElement|undefined)
const currentTalkId = ref(undefined as string|undefined)
const currentTalk = ref(undefined as Talk|undefined)

function goToCurrentTalk() {
  if (currentTalkId.value) {
    router.push(`/talk/${currentTalkId.value}`)
  }
}

onBeforeMount(() => {
  socket.on('currentTalk', talkId => {
    const talkChanged = talkId != currentTalkStore.talkId && currentTalkStore.talkId != undefined
    currentTalkStore.set(talkId)
    if (talkChanged && currentTalkChangeModal.value) {
      currentTalkId.value = talkId
      currentTalk.value = talkManager.getTalk(talkId)
      if (!currentTalkChangeModal.value.classList.contains('show')) {
        new Modal(currentTalkChangeModal.value).show()
      }
    }
  })
  socket.on('talkRating', (talkId: string, rating?: number, comment?: string) => {
    if (rating) {
      ratingStore.addRating(talkId, rating, comment)
    }
    else {
      ratingStore.removeRating(talkId)
    }
  })

  if (authenticationStore.isAuthenticated) {
    socket.auth = { code: authenticationStore.code, username: authenticationStore.username }
    socket.connect()
  }
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
