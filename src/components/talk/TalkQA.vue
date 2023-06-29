<template>
  <div class="qa-container">
    <div class="qa-window">
      <template v-for="(message, index) in messages" :key="message.id">
        <div class="message-container" v-if="!message.replyTo">
          <div class="index">{{index+1}}.</div>
          <div class="message-and-replies">
            <MessageDisplay :message="message" :read-only="speakerView"
                @message-clicked="messageClicked(message)"/>
            <div class="reply-list">
              <button v-if="speakerView && !isShowRepliesInSpeakerView(message) && getReplies(message).length > 0"
                class="btn btn-sm btn-secondary" @click="showRepliesInSpeakerView(message, true)">
                {{getReplies(message).length}} Answers
              </button>
              <div v-else @click="showRepliesInSpeakerView(message, false)">
                <MessageDisplay v-for="replyMessage in getReplies(message)" :key="replyMessage.id"
                    :message="replyMessage" :read-only="speakerView"
                    @message-clicked="messageClicked(replyMessage, message)"/>
              </div>
            </div>
          </div>
          <button class="btn btn-outline-secondary btn-sm reply-button" @click="addReply(message)" v-if="!speakerView">Reply</button>
        </div>
      </template>
      <div class="bottom" ref="bottomPlaceholder"/>
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

  <div v-if="!speakerView" class="modal" id="qaEntryReplyModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Answer to Question</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="reply-to-question" v-if="replyToMessage">
            {{replyToMessage.text}}
          </div>
          <TextAreaEmojiPicker class="textarea" v-model="messageText" :allow-enter="true"/>
        </div>
        <div class="modal-footer" :class="{'justify-content-between':selectedMessage}">
          <button v-if="selectedMessage" type="button" class="btn btn-outline-danger" data-bs-dismiss="modal" @click="deleteMessage">Delete</button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="sendMessage" :disabled="!isValid()">Submit Answer</button>
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
import { useErrorMessagesStore } from '@/stores/errorMessages'

const props = defineProps<{
  talk: Talk,
  speakerView?: boolean
}>()

const authenticationStore = useAuthenticationStore()
const errorMessagesStore = useErrorMessagesStore()
const messages = ref([] as Message[])

const messageText = ref('')
const messageAnonymous = ref(false)
const selectedMessage = ref(undefined as Message|undefined)
const replyToMessage = ref(undefined as Message|undefined)
const bottomPlaceholder = ref(undefined as HTMLElement|undefined)
const speakerViewShowRepliesForMessage = ref([] as string[])

function getReplies(message: Message) {
  return messages.value.filter(item => item.replyTo==message.id)
}

function isShowRepliesInSpeakerView(message: Message) {
  return speakerViewShowRepliesForMessage.value.includes(message.id)
}

function showRepliesInSpeakerView(message: Message, show: boolean) {
  if (show) {
    speakerViewShowRepliesForMessage.value.push(message.id)
  }
  else {
    speakerViewShowRepliesForMessage.value = speakerViewShowRepliesForMessage.value.filter(id => id != message.id)
  }
}

function addMessage(message: Message) {
  // ensure no duplicates in list
  messages.value = messages.value.filter(item => item.id != message.id)
  messages.value.push(message)
}

function addQuestion() {
  selectedMessage.value = undefined
  replyToMessage.value = undefined
  messageText.value = ''
  messageAnonymous.value = false
  new Modal('#qaEntryModal').show()
}

function addReply(message : Message) {
  selectedMessage.value = undefined
  replyToMessage.value = message
  messageText.value = ''
  messageAnonymous.value = false
  new Modal('#qaEntryReplyModal').show()
}

function messageClicked(message: Message, replyTo?: Message) {
  selectedMessage.value = message
  replyToMessage.value = replyTo
  messageText.value = message.text
  messageAnonymous.value = (message.username == undefined)
  if (replyTo) {
    new Modal('#qaEntryReplyModal').show()
  }
  else {
    new Modal('#qaEntryModal').show()
  }
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
    sendUpdatedMessage(message, messageUsername)
  }
  else {
    sendNewMessage(messageUsername)
  }
}

function sendNewMessage(messageUsername?: string) : void {
  const id = uuidv4()
  const text = messageText.value
  const replyTo = replyToMessage.value?.id
  socket.emit('qaEntry', { id, talkId: props.talk.id, text, anonymous: messageAnonymous.value, replyTo}, result => {
    if (result.success) {
      addMessage({id, date: new Date(), userid: authenticationStore.userid, username: messageUsername, text, replyTo})
    }
    else if (result.error) {
      errorMessagesStore.add(`Unable to create QA entry: ${result.error}`)
    }
  })
  if (!replyToMessage.value) {
    bottomPlaceholder.value?.scrollIntoView()
  }
}

function sendUpdatedMessage(message : Message, messageUsername?: string) : void {
  socket.emit('qaEntryUpdate', {id: message.id, talkId: props.talk.id, text: message.text, anonymous: messageAnonymous.value}, result => {
  if (result.success) {
    message.text = messageText.value
    if (message.userid == authenticationStore.userid) {
      message.username = messageUsername
    }
  }
  else if (result.error) {
    errorMessagesStore.add(`Unable to update QA entry: ${result.error}`)
  }
})
}


function deleteMessage() {
  const message = selectedMessage.value
  if (message) {
    socket.emit('qaEntryDelete', message.id, result => {
      if (result.success) {
        messages.value = messages.value.filter(item => item.id != message.id)
      }
      else if (result.error) {
        errorMessagesStore.add(`Unable to delete QA entry: ${result.error}`)
      }
    })
  }
}

onMounted(() => {
  socket.on('qaEntries', messages => {
    messages.forEach(message => addMessage(message))
  })
  socket.on('qaEntryUpdate', updatesMessage => {
    const message = messages.value.find(item => item.id == updatesMessage.id)
    if (message) {
      message.date = updatesMessage.date
      message.userid = updatesMessage.userid
      message.username = updatesMessage.username
      message.text = updatesMessage.text
    }
  })
  socket.on('qaEntryDelete', id => {
    messages.value = messages.value.filter(item => item.id != id)
  })
})
onUnmounted(() => {
  socket.off('qaEntries')
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
.modal .reply-to-question {
  white-space: pre-line;
  margin-bottom: 20px;
}
.message-container {
  display: flex;
  .index {
    margin-top: 4px;
    margin-right: 0.25em;
    font-size: 1.25em;
  }
  .message-and-replies {
    flex-grow: 10;
    > .message {
      background-color: #004;
      padding: 8px;
      border-radius: 10px;
      margin-bottom: 10px;
    }
  }
  .reply-button {
    height: 40px;
    margin-right: 0;
    margin-left: 15px;
  }
  .reply-list {
    margin-left: 20px;
    margin-top: -5px;
    margin-bottom: 5px;
    button {
      margin-top: 0;
    }
  }
}

.modal {
  --bs-modal-zindex: 5000;
}
</style>
