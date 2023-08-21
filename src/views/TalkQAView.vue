<template>
  <div v-if="talk" class="talk-view">
    <div class="title mb-1">
      <h4>{{talk.title}}</h4>
      <div class="btn-group">
        <button class="btn btn-outline-secondary" :class="{active:showUnanswered}" @click="showUnanswered=true">Unanswered</button>
        <button class="btn btn-outline-secondary" :class="{active:!showUnanswered}" @click="showUnanswered=false">Answered</button>
      </div>
    </div>
    <TalkQABigView :talk="talk" :show-unanswered="showUnanswered" class="content" :key="talk.id"/>
  </div>
</template>

<script setup lang="ts">
import TalkQABigView from '@/components/talkQA/TalkQABigView.vue'
import TalkManager from '@/services/TalkManager'
import { useCurrentTalkStore } from '@/stores/currentTalk'
import { computed, ref } from 'vue'

const talkManager = new TalkManager()
const currentTalkId = computed(() => useCurrentTalkStore().talkId)
const talk = computed(() => talkManager.getTalk(currentTalkId.value))
const showUnanswered = ref(true)
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
