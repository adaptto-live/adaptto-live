<template>
  <div><em>{{message.username}}</em></div>
  <div v-html="messageHtml"></div>
</template>

<script setup lang="ts">
import type Message from '@/services/Message'
import { computed } from 'vue'
import linkifyString from 'linkify-string'

const props = defineProps<{
  message: Message
}>()

// linkify message text
const messageHtml = computed(() => linkifyString(props.message.text, {
  defaultProtocol: 'https',
  target: '_blank'
}))
</script>
