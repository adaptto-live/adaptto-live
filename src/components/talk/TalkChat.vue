<template>
  <div class="chat-container">
    <div class="chat-window">
      <MessageDisplay v-for="message in messages" :key="message.id" :message="message"
          @message-clicked="messageClicked(message)"/>
      <div class="bottom" ref="bottomPlaceholder"/>
    </div>
    <div class="new-message">
      <TextAreaEmojiPicker class="textarea" v-model="newMessageText" @enter-key="sendMessage"/>
      <button class="btn btn-primary" @click="sendMessage" :disabled="!hasMessage">Send</button>
    </div>
  </div>

  <div class="modal" id="messageModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Chat Message</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <TextAreaEmojiPicker class="textarea" v-model="messageText" :allow-enter="true"/>
        </div>
        <div class="modal-footer justify-content-between">
          <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal" @click="deleteMessage">Delete</button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="updateMessage" :disabled="!isValid()">Update Message</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import TextAreaEmojiPicker from '../structure/TextAreaEmojiPicker.vue'
import socket from '@/util/socket'
import type { Talk } from '@/stores/talks'
import { useAuthenticationStore } from '@/stores/authentication'
import { v4 as uuidv4 } from 'uuid'
import type Message from '@/services/Message'
import MessageDisplay from './MessageDisplay.vue'
import { Modal } from 'bootstrap'

const props = defineProps<{
  talk: Talk
}>()

const authenticationStore = useAuthenticationStore()
const messages = ref([] as Message[])

const newMessageText = ref('')
const hasMessage = computed(() => newMessageText.value.trim() != '')
const messageText = ref('')
const selectedMessage = ref(undefined as Message|undefined)
const bottomPlaceholder = ref(undefined as HTMLElement|undefined)

function addMessage(message: Message) {
  messages.value.push(message)
}

function messageClicked(message: Message) {
  selectedMessage.value = message
  messageText.value = message.text
  new Modal('#messageModal').show()
}

function isValid() : boolean {
  return messageText.value.trim() != ''
}

function sendMessage() {
  if (!hasMessage.value) {
    return
  }
  const id = uuidv4()
  const text = newMessageText.value
  addMessage({id, date: new Date(), userid: authenticationStore.userid, username: authenticationStore.username, text})
  socket.emit('message', id, props.talk.id, text)
  newMessageText.value = ''
  bottomPlaceholder.value?.scrollIntoView()
  const textarea = document.querySelector('.chat-container .new-message textarea') as HTMLElement|undefined
  if (textarea) {
    textarea.focus()
  }
}

function updateMessage() {
  const message = selectedMessage.value
  if (message) {
    message.text = messageText.value
    socket.emit('messageUpdate', message.id, message.text)
  }
}

function deleteMessage() {
  const message = selectedMessage.value
  if (message) {
    messages.value = messages.value.filter(item => item.id != message.id)
    socket.emit('messageDelete', message.id)
  }
}

onMounted(() => {
  socket.on('message', (id: string, date: Date, userid: string, username: string, text: string) => {
    addMessage({id, date, userid, username, text})
  })
  socket.on('messageUpdate', (id: string, date: Date, userid: string, username: string, text: string) => {
    const message = messages.value.find(item => item.id == id)
    if (message) {
      message.date = date
      message.userid = userid
      message.username = username
      message.text = text
    }
  })
  socket.on('messageDelete', (id: string) => {
    messages.value = messages.value.filter(item => item.id != id)
  })
})
onUnmounted(() => {
  socket.off('message')
})
</script>

<style lang="scss" scoped>
.chat-container {
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto;
  width: 100%;
  height: 100%;
}
.chat-window {
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
.new-message {
  display: flex;
  flex-direction: row;
  padding-top: 5px;
  gap: 5px;
  .textarea {
    flex: 1 1 auto;
    height: 60px;
  }
}
.modal .textarea {
  height: 220px;
}
</style>
