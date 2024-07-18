<template>
  <div class="qa-container">
    <div class="qa-window">
      <template v-for="message in messageWithoutReplies" :key="message.id">
        <div class="message-container">
          <div class="index">{{message.entryIndex ? `${message.entryIndex}.` : ''}}</div>
          <div class="message-and-replies">
            <MessageDisplay :message="message" :read-only="qaBigView"
                @message-clicked="messageClicked(message)"/>
            <div class="reply-list">
              <button v-if="qaBigView && !isShowRepliesInQABigView(message) && getReplies(message).length > 0"
                class="btn btn-sm btn-secondary" @click="showRepliesInqaBigView(message, true)">
                {{getReplies(message).length}} Answers
              </button>
              <div v-else @click="showRepliesInqaBigView(message, false)">
                <MessageDisplay v-for="replyMessage in getReplies(message)" :key="replyMessage.id"
                    :message="replyMessage" :read-only="qaBigView"
                    @message-clicked="messageClicked(replyMessage, message)"/>
              </div>
            </div>
          </div>
          <QAEntryLike :id="message.id" :likeUserIds="message.likeUserIds" :key="(message.likeUserIds??[]).length" class="like-button" :disabled="qaBigView"/>
          <button class="btn btn-outline-secondary btn-sm reply-button" @click="addReply(message)" v-if="!qaBigView">Reply</button>
          <button class="btn btn-secondary btn-lg answer-button" @click="markAnswered(message)" v-else>{{message.answered ? 'Unanswer' : 'Answered'}}</button>
        </div>
      </template>

      <table id="document-export" class="table d-none" data-bs-theme="light" aria-describedby="excelExportCaption">
        <tr>
          <th colspan="2" id="excelExportCaption">Talk QA</th>
        </tr>
        <tr v-for="message in messageWithoutReplies" :key="message.id">
          <td>
            <MessageDisplayExport :message="message"/>
          </td>
          <td>
            <p v-if="message.answered && getReplies(message).length == 0">(see answer in talk video)</p>
            <MessageDisplayExport v-else v-for="replyMessage in getReplies(message)" :key="replyMessage.id"
                :message="replyMessage"/>
          </td>
        </tr>
      </table>

      <div class="bottom" ref="bottomPlaceholder"/>
    </div>
    <div class="buttons">
      <button v-if="!qaBigView" class="btn btn-primary" @click="addQuestion">Add Question</button>
      <button v-if="!qaBigView && authenticationStore.admin" class="btn btn-secondary" @click="copyToClipboard">Copy to Clipboard</button>
    </div>
  </div>

  <div v-if="!qaBigView" class="modal" id="qaEntryModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Submit Question</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <TextAreaEmojiPicker class="textarea" v-model="messageText" :allow-enter="true"/>
          <div class="mt-3 form-check">
            <input type="checkbox" class="form-check-input" id="qaEntryAnonymous" v-model="messageAnonymous">
            <label class="form-check-label" for="qaEntryAnonymous">Anonymous (without user name)</label>
          </div>
          <div v-if="authenticationStore.admin" class="form-check">
            <input type="checkbox" class="form-check-input" id="qaEntryHighlight" v-model="messageHighlight">
            <label class="form-check-label" for="qaEntryHighlight">Highlight</label>
          </div>
          <div v-if="authenticationStore.admin" class="form-check">
            <input type="checkbox" class="form-check-input" id="qaEntryAnswered" v-model="messageAnswered">
            <label class="form-check-label" for="qaEntryAnswered">Answered</label>
          </div>
          <p class="small mt-2" v-if="authenticationStore.admin && selectedMessage?.userid">User ID: <code>{{selectedMessage?.userid}}</code></p>
        </div>
        <div class="modal-footer" :class="{'justify-content-between':selectedMessage}">
          <button v-if="selectedMessage" type="button" class="btn btn-outline-danger" data-bs-dismiss="modal" @click="deleteMessage">Delete</button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="sendMessage" :disabled="!isValid()">Submit Question</button>
        </div>
      </div>
    </div>
  </div>

  <div v-if="!qaBigView" class="modal" id="qaEntryReplyModal" tabindex="-1">
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
          <div v-if="authenticationStore.admin" class="form-check mt-3">
            <input type="checkbox" class="form-check-input" id="qaEntryReplyHighlight" v-model="messageHighlight">
            <label class="form-check-label" for="qaEntryReplyHighlight">Highlight</label>
          </div>
          <p class="small mt-2" v-if="authenticationStore.admin && selectedMessage?.userid">User ID: <code>{{selectedMessage?.userid}}</code></p>
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
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import socket from '@/util/socket'
import type Message from '@/services/Message'
import MessageDisplay from './MessageDisplay.vue'
import TextAreaEmojiPicker from '../structure/TextAreaEmojiPicker.vue'
import { Modal } from 'bootstrap'
import { useErrorMessagesStore } from '@/stores/errorMessages'
import MessageAnswerFilter from '@/services/MessageAnswerFilter'
import MessageDisplayExport from './MessageDisplayExport.vue'
import copyElementToClipboard from '@/util/copyElementToClipboard'
import QAEntryLike from '../talkQA/QAEntryLike.vue'
import MessageSortOrder from '@/services/MessageSortOrder'

const props = defineProps<{
  talk: Talk,
  qaBigView?: boolean,
  messageAnswerFilter?: MessageAnswerFilter,
  messageSortOrder?: MessageSortOrder
}>()

const authenticationStore = useAuthenticationStore()
const errorMessagesStore = useErrorMessagesStore()
const messages = ref([] as Message[])
const messageWithoutReplies = computed(() => {
  const filteredMessages = messages.value
      .filter(item => item.replyTo == undefined)
      .filter(item => item.answered && props.messageAnswerFilter != MessageAnswerFilter.UNANSWERED || !item.answered && props.messageAnswerFilter != MessageAnswerFilter.ANSWERED)
  if (props.messageSortOrder == MessageSortOrder.VOTES) {
    filteredMessages.sort((msg1, msg2) => (msg2.likeUserIds?.length ?? 0) - (msg1.likeUserIds?.length ?? 0))
  }
  return filteredMessages
})

const messageText = ref('')
const messageAnonymous = ref(false)
const messageHighlight = ref(false as boolean|undefined)
const messageAnswered = ref(false as boolean|undefined)
const selectedMessage = ref(undefined as Message|undefined)
const replyToMessage = ref(undefined as Message|undefined)
const bottomPlaceholder = ref(undefined as HTMLElement|undefined)
const qaBigViewShowRepliesForMessage = ref([] as string[])

function getReplies(message: Message) {
  return messages.value.filter(item => item.replyTo==message.id)
}

function isShowRepliesInQABigView(message: Message) {
  return qaBigViewShowRepliesForMessage.value.includes(message.id)
}

function showRepliesInqaBigView(message: Message, show: boolean) {
  if (show) {
    qaBigViewShowRepliesForMessage.value.push(message.id)
  }
  else {
    qaBigViewShowRepliesForMessage.value = qaBigViewShowRepliesForMessage.value.filter(id => id != message.id)
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
  messageHighlight.value = message.highlight
  messageAnswered.value = message.answered
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
  socket.emit('qaEntry', { id, talkId: props.talk.id, text, anonymous: messageAnonymous.value, replyTo}, (result, entryIndex) => {
    if (result.success) {
      addMessage({id, date: new Date(), userid: authenticationStore.userid, username: messageUsername, text, entryIndex, replyTo})
    }
    else if (result.error) {
      errorMessagesStore.add(`Unable to create QA entry: ${result.error}`)
    }
  })
  if (!replyToMessage.value) {
    scrollToEndOfList()
  }
}

function sendUpdatedMessage(message : Message, messageUsername?: string) : void {
  socket.emit('qaEntryUpdate', {id: message.id, talkId: props.talk.id, text: messageText.value,
     anonymous: messageAnonymous.value, highlight: messageHighlight.value, answered: messageAnswered.value}, result => {
  if (result.success) {
    message.text = messageText.value
    if (message.userid == authenticationStore.userid) {
      message.username = messageUsername
    }
    message.highlight = messageHighlight.value
    message.answered = messageAnswered.value
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

function markAnswered(message : Message) {
  const answered = !message.answered
  const {id} = message
  socket.emit('qaEntryUpdateAnswered', {id, answered}, result => {
    if (result.success) {
      message.answered = answered
    }
    else if (result.error) {
      errorMessagesStore.add(`Unable to update QA entry: ${result.error}`)
    }
  })
}

function scrollToEndOfList() {
  window.setTimeout(() => bottomPlaceholder.value?.scrollIntoView(), 200)
}

function copyToClipboard() {
  const table = document.querySelector('#document-export')
  if (table) {
    copyElementToClipboard(table)
  }
}

onMounted(() => {
  socket.on('qaEntries', incomingMessages => {
    const scrollToEnd = (messages.value.length == 0)
    incomingMessages.forEach(message => addMessage(message))
    if (scrollToEnd && !props.qaBigView) {
      scrollToEndOfList()
    }
  })
  socket.on('qaEntryUpdate', updatedMessage => {
    const message = messages.value.find(item => item.id == updatedMessage.id)
    if (message) {
      message.date = updatedMessage.date
      message.userid = updatedMessage.userid
      message.username = updatedMessage.username
      message.text = updatedMessage.text
      message.highlight = updatedMessage.highlight
      message.answered = updatedMessage.answered
      message.likeUserIds = updatedMessage.likeUserIds
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
  .buttons {
    display: flex;
    > *:first-child {
      flex-grow: 1;
    }
  }
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
    > .message.answered {
      background-color: unset;
    }
  }
  .like-button {
    margin-left: 15px;
    margin-right: 0;
    margin-top: 0px;
  }
  .reply-button {
    height: 40px;
    margin-left: 5px;
    margin-right: 0;
    margin-top: 0;
  }
  .answer-button {
    margin-top: 0;
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

#document-export {
  background-color: #fff;
  color: #000;
  width: 100%;
  font-family: Arial, Helvetica, sans-serif;
  font-size: 11pt;
  th {
    background-color: #ffe599;
    text-align: left;
    padding: 5px;
    font-weight: normal;
    border: 1px solid black;
  }
  td {
    vertical-align: top;
    width: 50% !important;
    border: 1px solid black;
    word-break: break-word;
  }
}
</style>
