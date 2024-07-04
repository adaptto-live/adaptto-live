<template>
  <div class="modal" id="talkModeratorNotesModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Moderator Notes</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <TextAreaEmojiPicker class="textarea" v-model="notesText" :allow-enter="true"/>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="saveNotes">Save</button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Talk } from '@/stores/talks'
import { ref } from 'vue'
import socket from '@/util/socket'
import type { ModeratorTalkNotesFromServer } from '@/util/socket.types'
import { useErrorMessagesStore } from '@/stores/errorMessages'
import TextAreaEmojiPicker from '../structure/TextAreaEmojiPicker.vue'

const errorMessagesStore = useErrorMessagesStore()

const props = defineProps<{
  talk: Talk
}>()

const notesText = ref(undefined as string|undefined)

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
  height: 220px;
}
</style>
