<template>
  <div v-if="talk" class="talk-view">
    <div class="title">
      <h3><a :href="talk.url" target="_blank">{{talk.title}}</a></h3>
      <p>{{talk.speakers}}</p>
    </div>
    <div class="rating">
      <TalkRating v-if="talk" :talk="talk"/>
    </div>
    <TalkDiscussion :talk="talk" class="content"/>
  </div>
</template>

<script setup lang="ts">
import TalkDiscussion from '@/components/talk/TalkDiscussion.vue'
import TalkRating from '@/components/talk/TalkRating.vue'
import TalkManager from '@/services/TalkManager'
import { useRoute } from 'vue-router'

const route = useRoute()
const talkId = route.params.talk as string
const talkManager = new TalkManager()
const talk = talkManager.getTalk(talkId)
</script>

<style lang="scss" scoped>
.talk-view {
  display: grid;
  grid-template-areas:
    "title rating"
    "content content";
  grid-template-columns: 1fr auto;
  grid-template-rows: auto 1fr;
  width: 100%;
  height: 100%;
  padding-top: 10px;
  padding-bottom: 10px;
  .title {
    grid-area: title;
    a {
      text-decoration: none;
    }
  }
  .rating {
    grid-area: rating;
    padding-left: 10px;
  }
  .content {
    grid-area: content;
  }
}
</style>
