<template>
  <template v-if="isVisible">
    <div class="notes">
      <div class="title">
        <a data-bs-toggle="collapse" href="#talkModeratorNotesCollapse">
          Moderator Notes
          <span v-if="notesText" class="icon">»</span>
        </a>
        <a data-bs-toggle="modal" data-bs-target="#talkModeratorNotesModal" class="edit">✎</a>
      </div>
      <p id="talkModeratorNotesCollapse" v-html="notesTextHtml" class="text collapse"></p>
    </div>

    <div class="modal modal-lg" id="talkModeratorNotesModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h1 class="modal-title fs-5">Moderator Notes</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <TextAreaEmojiPicker class="textarea" v-model="notesText" :allow-enter="true" :maxLength="5000"/>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="saveNotes">Save</button>
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
import type { Talk } from '@/stores/talks'
import { ref, computed } from 'vue'
import socket from '@/util/socket'
import type { ModeratorTalkNotesFromServer } from '@/util/socket.types'
import { useErrorMessagesStore } from '@/stores/errorMessages'
import TextAreaEmojiPicker from '../structure/TextAreaEmojiPicker.vue'
import linkifyString from 'linkify-string'
import { useAuthenticationStore } from '@/stores/authentication'

const authenticationStore = useAuthenticationStore()
const errorMessagesStore = useErrorMessagesStore()

const props = defineProps<{
  talk: Talk
}>()

const isVisible = authenticationStore.qaadmin || authenticationStore.admin

const notesText = ref(undefined as string|undefined)
// linkify notes text
const notesTextHtml = computed(() => linkifyString(notesText.value ?? '', {
  defaultProtocol: 'https',
  target: '_blank'
}))

socket.on('talkModeratorNotes', (notes: ModeratorTalkNotesFromServer) => {
  notesText.value = notes.text
})

function saveNotes() {
  socket.emit('talkModeratorNotes', { talkId: props.talk.id, text: notesText.value ?? '' }, result => {
    if (result.error) {
      errorMessagesStore.add(`Unable to store notes: ${result.error}`)
    }
  })
}
</script>

<style lang="scss" scoped>
.modal .textarea {
  height: 350px;
}
.notes {
  margin-top: -1rem;
  margin-bottom: 1rem;
  font-style: italic;
  .title {
    font-weight: 500;
    a {
      text-decoration: unset;
      color: unset;
    }
    .edit {
      cursor: pointer;
      margin-left: 0.5rem;
    }
  }
  .text {
    white-space: pre-line;
    word-break: break-word;
    font-size: 1.5rem;
    padding: 0.5rem;
    max-height: 250px;
    overflow-y: auto;
  }
}
</style>
