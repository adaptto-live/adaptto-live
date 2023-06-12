<template>
  <div class="qa-container">
    <div class="qa-window">
      <div class="message-container" v-for="(message, index) in messages" :key="message.id">
        <div class="index">{{index+1}}.</div>
        <MessageDisplay :message="message" :read-only="speakerView"
            @message-clicked="messageClicked(message)"/>
      </div>
      <div class="bottom"/>
    </div>
    <button v-if="!speakerView" class="btn btn-primary" @click="addQuestion">Add Question</button>
  </div>

  <div v-if="!speakerView" class="modal" id="qaEntryModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Submit Question</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <TextAreaEmojiPicker class="textarea" v-model="messageText" :allow-enter="true"/>
          <div class="mt-3 form-check">
            <input type="checkbox" class="form-check-input" id="messageAnonymous"  v-model="messageAnonymous">
            <label class="form-check-label" for="messageAnonymous">Anonymous (without user name)</label>
          </div>
        </div>
        <div class="modal-footer" :class="{'justify-content-between':selectedMessage}">
          <button v-if="selectedMessage" type="button" class="btn btn-outline-danger" data-bs-dismiss="modal" @click="deleteMessage">Delete</button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="sendMessage" :disabled="!isValid()">Submit Question</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthenticationStore } from '@/stores/authentication'
import type { Talk } from '@/stores/talks'
import { onMounted, onUnmounted, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import socket from '@/util/socket'
import type Message from '@/services/Message'
import MessageDisplay from './MessageDisplay.vue'
import TextAreaEmojiPicker from '../structure/TextAreaEmojiPicker.vue'
import { Modal } from 'bootstrap'

const props = defineProps<{
  talk: Talk,
  speakerView?: boolean
}>()

const authenticationStore = useAuthenticationStore()
const messages = ref([] as Message[])

const messageText = ref('')
const messageAnonymous = ref(false)
const selectedMessage = ref(undefined as Message|undefined)

function addMessage(message: Message) {
  messages.value.push(message)
}

function addQuestion() {
  selectedMessage.value = undefined
  messageText.value = ''
  new Modal('#qaEntryModal').show()
}

function messageClicked(message: Message) {
  selectedMessage.value = message
  messageText.value = message.text
  messageAnonymous.value = (message.username == undefined)
  new Modal('#qaEntryModal').show()
}

function isValid() {
  return messageText.value.trim() != ''
}

function sendMessage() {
  let messageUsername : string|undefined
  if (!messageAnonymous.value) {
    messageUsername = authenticationStore.username
  }
  const message = selectedMessage.value
  if (message) {
    message.text = messageText.value
    if (message.userid == authenticationStore.userid) {
      message.username = messageUsername
    }
    socket.emit('qaEntryUpdate', message.id, message.text, messageAnonymous.value)
  }
  else {
    const id = uuidv4()
    const text = messageText.value
    addMessage({id, date: new Date(), userid: authenticationStore.userid, username: messageUsername, text})
    socket.emit('qaEntry', id, props.talk.id, text, messageAnonymous.value)
  }
}

function deleteMessage() {
  const message = selectedMessage.value
  if (message) {
    messages.value = messages.value.filter(item => item.id != message.id)
    socket.emit('qaEntryDelete', message.id)
  }
}

onMounted(() => {
  socket.on('qaEntry', (id: string, date: Date, userid: string, username: string|undefined, text: string) => {
    addMessage({id, date, userid, username, text})
  })
  socket.on('qaEntryUpdate', (id: string, date: Date, userid: string, username: string|undefined, text: string) => {
    const message = messages.value.find(item => item.id == id)
    if (message) {
      message.date = date
      message.userid = userid
      message.username = username
      message.text = text
    }
  })
  socket.on('qaEntryDelete', (id: string) => {
    messages.value = messages.value.filter(item => item.id != id)
  })
})
onUnmounted(() => {
  socket.off('qaEntry')
})
</script>

<style lang="scss" scoped>
.qa-container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto;
  width: 100%;
  height: 100%;
}
.qa-window {
  background-color: #444;
  padding: 10px;
  overflow-y: auto;
  height: 100%;
  > * {
    overflow-anchor: none;
  }
  > .bottom {
    overflow-anchor: auto;
    height: 1px;
  }
}
.btn {
  margin-top: 18px;
  margin-bottom: 10px;
  margin-left: 20px;
  margin-right: 20px;
}
.modal .textarea {
  height: 220px;
}
.message-container {
  display: flex;
  .index {
    margin-top: 4px;
    margin-right: 0.25em;
    font-size: 1.25em;
  }
  .message {
    background-color: #004;
    padding: 8px;
    border-radius: 10px;
    margin-bottom: 10px;
  }
}
</style>
