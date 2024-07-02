<template>
  <div v-if="talk" class="talk-view">
    <div class="title mb-1">
      <h4>{{talk.title}}</h4>
      <div class="btn-group">
        <button class="btn btn-outline-secondary" :class="{active:messageAnswerFilter==MessageAnswerFilter.UNANSWERED}"
            @click="messageAnswerFilter = MessageAnswerFilter.UNANSWERED">Unanswered</button>
        <button class="btn btn-outline-secondary" :class="{active:messageAnswerFilter==MessageAnswerFilter.ANSWERED}"
            @click="messageAnswerFilter = MessageAnswerFilter.ANSWERED">Answered</button>
      </div>
      <RouterLink to="/" class="btn">✕</RouterLink>
    </div>
    <TalkQABigView :talk="talk" :message-answer-filter="messageAnswerFilter" class="content" :key="talk.id"/>
  </div>
</template>

<script setup lang="ts">
import TalkQABigView from '@/components/talkQA/TalkQABigView.vue'
import MessageAnswerFilter from '@/services/MessageAnswerFilter'
import TalkManager from '@/services/TalkManager'
import { useCurrentTalkStore } from '@/stores/currentTalk'
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

const talkManager = new TalkManager()
const currentTalkId = computed(() => useCurrentTalkStore().talkId)
const talk = computed(() => talkManager.getTalk(currentTalkId.value))
const messageAnswerFilter = ref(MessageAnswerFilter.UNANSWERED)
</script>

<style lang="scss" scoped>
.talk-view {
  display: grid;
  grid-template-areas:
    "title"
    "content";
  grid-template-rows: auto 1fr;
  width: 100%;
  height: 100%;
  padding-top: 5px;
  padding-bottom: 5px;
  .title {
    grid-area: title;
    display: flex;
    gap: 15px;
    h4 {
      flex-grow: 1;
    }
  }
  .content {
    grid-area: content;
  }
}
</style>
