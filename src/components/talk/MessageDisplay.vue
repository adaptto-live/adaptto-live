<template>
  <div class="message" :class="{editable, currentUser, highlight, answered}" @click="clickMessage">
    <div class="meta">
      <div v-if="message.username" class="author">{{message.username}}</div>
      <div v-if="!readOnly" class="date text-muted">
        <timeago :datetime="messageDate" :auto-update="true"/><span v-if="editable" class="icon">✎</span><span v-if="answered" class="icon">✓</span>
      </div>
    </div>
    <div class="text" v-html="messageHtml"></div>
  </div>
</template>

<script setup lang="ts">
import type Message from '@/services/Message'
import { useAuthenticationStore } from '@/stores/authentication'
import { computed } from 'vue'
import linkifyString from 'linkify-string';

const authenticationStore = useAuthenticationStore()

const props = defineProps<{
  message: Message,
  readOnly?: boolean
}>()
const emit = defineEmits(['messageClicked'])
const currentUser = computed(() =>
    (props.message.userid == authenticationStore.userid)
    && !props.readOnly)
const editable = computed(() =>
    ((props.message.userid == authenticationStore.userid) || authenticationStore.admin)
    && !props.readOnly)
const highlight = computed(() => props.message.highlight ?? false)
const answered = computed(() => props.message.answered ?? false)

// safeguard for dates that may lay slightly in the future
let messageDate = new Date(props.message.date)
const now = new Date()
if (messageDate > now) {
  messageDate = now
}

// linkify message text
const messageHtml = computed(() => linkifyString(props.message.text, {
  defaultProtocol: 'https',
  target: '_blank'
}))

function clickMessage(event : Event) {
  if (editable.value) {
    if (event.target instanceof HTMLElement) {
      if (event.target.tagName == 'A') {
        // skip opening edit dialog if an anchor element was clicked
        return
      }
    }
    emit('messageClicked')
  }
}
</script>

<style lang="scss" scoped>
.message {
  margin-bottom: 3px;
  padding: 2px;
  .meta {
    font-size: smaller;
  }
  .author {
    display: inline-block;
    font-weight: bold;
    margin-right: 5px;
  }
  .date {
    display: inline-block;
    font-size: smaller;
  }
  .text {
    white-space: pre-line;
    overflow-wrap: break-word;
  }
  &.editable {
    cursor: pointer;
  }
  &.currentUser {
    background-color: midnightblue !important;
    border-radius: 5px;
    cursor: pointer;
  }
  &.highlight {
    border: 2px solid lightyellow;
    border-radius: 5px;
  }
  .icon {
    margin-left: 0.25rem;
  }
}
</style>
