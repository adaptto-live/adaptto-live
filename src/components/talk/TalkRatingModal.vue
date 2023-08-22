<template>
  <div class="modal" :id="modalId" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">{{talk.title}}</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div>{{ talk.speakers }}</div>
          <div class="stars">
            <SvgStar v-for="index in 5" :key="index" :class="{fill: ratingDisplay >= index}"
                @mouseover="ratingDisplay = index"
                @mouseout="ratingDisplay = rating"
                @click="rating = index"/>
          </div>
          <div>
            <div>Feedback (optional):</div>
            <TextAreaEmojiPicker class="textarea" v-model="commentText" :allow-enter="true"/>
          </div>
        </div>
        <div class="modal-footer justify-content-between">
          <button type="button" class="btn btn-outline-danger" data-bs-dismiss="modal" @click="remove">Remove Rating</button>
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="save" :disabled="!isValid()">Save Rating</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRatingStore } from '@/stores/rating'
import { useErrorMessagesStore } from '@/stores/errorMessages'
import { Modal } from 'bootstrap'
import { ref } from 'vue'
import type { Talk } from '@/stores/talks'
import socket from '@/util/socket'
import SvgStar from '../structure/SvgStar.vue'
import TextAreaEmojiPicker from '../structure/TextAreaEmojiPicker.vue'

const props = defineProps<{
  talk: Talk
}>()

const ratingStore = useRatingStore()
const modalId = `talk-rating-modal-${props.talk.id}`
const rating = ref(ratingStore.getRating(props.talk.id) ?? 0)
const ratingDisplay = ref(rating.value)
const errorMessagesStore = useErrorMessagesStore()

const commentText = ref(ratingStore.getComment(props.talk.id))

function show() {
  rating.value = ratingStore.getRating(props.talk.id) ?? 0
  ratingDisplay.value = rating.value
  commentText.value = ratingStore.getComment(props.talk.id)
  const modal = new Modal(document.getElementById(modalId) as Element)
  modal.show()
}

function save() { 
  socket.emit('talkRating', {talkId: props.talk.id, rating: rating.value, comment: commentText.value}, result => {
    if (result.success) {
      ratingStore.addRating(props.talk.id, rating.value, commentText.value)
    }
    else if (result.error) {
      errorMessagesStore.add(`Unable to store talk rating: ${result.error}`)
    }
  })
}

function remove() {
  socket.emit('talkRating', {talkId: props.talk.id}, result => {
    if (result.success) {
      ratingStore.removeRating(props.talk.id)
    }
    else if (result.error) {
      errorMessagesStore.add(`Unable to remove talk rating: ${result.error}`)
    }
  })
}

function isValid() {
  return rating.value > 0
}

defineExpose({ show })
</script>

<style lang="scss" scoped>
.stars {
  position: relative;
  white-space: nowrap;
  text-align: center;
  padding-top: 50px;
  padding-bottom: 50px;
  svg {
    width: 50px;
  }
}

svg {
  fill: gray;
}

svg.fill {
  fill: orange;
}

.textarea {
  height: 80px;
}
</style>
