<template>
  <div v-if="talk" class="talk-view">
    <div class="title">
      <h4>{{talk.title}}</h4>
    </div>
    <SpeakerTalkQA :talk="talk" class="content" :key="talk.id"/>
  </div>
</template>

<script setup lang="ts">
import SpeakerTalkQA from '@/components/speakerQA/SpeakerTalkQA.vue'
import TalkManager from '@/services/TalkManager'
import { useCurrentTalkStore } from '@/stores/currentTalk'
import { computed } from 'vue'

const talkManager = new TalkManager()
const currentTalkId = computed(() => useCurrentTalkStore().talkId)
const talk = computed(() => talkManager.getTalk(currentTalkId.value))
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
  }
  .content {
    grid-area: content;
  }
}
</style>
