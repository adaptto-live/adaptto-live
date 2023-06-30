<template>
  <div class="app-framework">
    <header v-if="!route.meta.noHeader">
      <AppHeader />
    </header>
    <main class="container-fluid">
      <div class="alert alert-danger mt-3" role="alert" v-if="talkStore.loadingError">
        {{talkStore.loadingError}}
      </div>
      <div class="alert alert-danger alert-dismissible mt-3" role="alert" v-for="(error,index) in errorMessagesStore.errorMessages" :key="index">
        {{error}}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close" @click="errorMessagesStore.remove(index)"></button>
      </div>
      <RouterView :key="$route.fullPath"/>

      <div class="modal" tabindex="-1" id="currentTalkChangeModal">
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

      <div class="modal" tabindex="-1" id="serviceWorkerOnNeedRefreshModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5">Application Update</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>The application was updated, do you want to update?</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="updateServiceWorkerApplication">OK</button>
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <div class="modal" tabindex="-1" id="serviceWorkerOnOfflineReadyModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5">Application ready</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <p>Application is ready to work.</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
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
import TalkManager from './services/TalkManager'
import { useErrorMessagesStore } from './stores/errorMessages'
import { showModalIfExist } from './util/showModal'
import { registerSW } from 'virtual:pwa-register'

const authenticationStore = useAuthenticationStore()
const talkStore = useTalksStore()
const currentTalkStore = useCurrentTalkStore()
const ratingStore = useRatingStore()
const errorMessagesStore = useErrorMessagesStore()
const route = useRoute()
const router = useRouter()
const talkManager = new TalkManager()

const currentTalkId = ref(undefined as string|undefined)
const currentTalk = ref(undefined as Talk|undefined)

const updateServiceWorker = registerSW({
  onNeedRefresh() {
    showModalIfExist('serviceWorkerOnNeedRefreshModal')
  },
  onOfflineReady() {
    showModalIfExist('serviceWorkerOnOfflineReadyModal')
  }
})

function updateServiceWorkerApplication() {
  updateServiceWorker()
  router.go(0)
}

function goToCurrentTalk() {
  if (currentTalkId.value) {
    router.push(`/talk/${currentTalkId.value}`)
  }
}

onBeforeMount(() => {
  socket.on('currentTalk', talkId => {
    const talkChanged = talkId != currentTalkStore.talkId && currentTalkStore.talkId != undefined
    currentTalkStore.set(talkId)
    if (talkChanged) {
      currentTalkId.value = talkId
      currentTalk.value = talkManager.getTalk(talkId)
      showModalIfExist('currentTalkChangeModal')
    }
  })
  socket.on('talkRatings', (talkRatings) => {
    talkRatings.forEach((({talkId, rating, comment}) => {
      if (rating) {
        ratingStore.addRating(talkId, rating, comment)
      }
      else {
        ratingStore.removeRating(talkId)
      }
    }))
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
