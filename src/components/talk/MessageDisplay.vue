<template>
  <div class="message" :class="{editable, currentUser, highlight}" @click="clickMessage">
    <div class="meta">
      <div v-if="message.username" class="author">{{message.username}}</div>
      <div v-if="!readOnly" class="date text-muted">
        <timeago :datetime="message.date" :auto-update="true"/>
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
    background-color: purple !important;
  }
}
</style>
