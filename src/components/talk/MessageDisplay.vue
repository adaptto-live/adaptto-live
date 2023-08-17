<template>
  <div class="message" :class="{editable, currentUser, highlight}" @click="clickMessage">
    <div class="meta">
      <div v-if="message.username" class="author">{{message.username}}</div>
      <div v-if="!readOnly" class="date text-muted">
        <timeago :datetime="messageDate" :auto-update="true"/>
      </div>
    </div>
    <div class="text">{{message.text}}</div>
  </div>
</template>

<script setup lang="ts">
import type Message from '@/services/Message'
import { useAuthenticationStore } from '@/stores/authentication'
import { computed } from 'vue'

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

// safeguard for dates that may lay slightly in the future
let messageDate = new Date(props.message.date)
const now = new Date()
if (messageDate > now) {
  messageDate = now
}

function clickMessage() {
  if (editable.value) {
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
}
</style>
