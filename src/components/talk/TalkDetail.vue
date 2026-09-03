<template>
  <div class="talk-view">
    <div class="title">
      <h3>
        <a v-if="talk.url" :href="talk.url" target="_blank">{{talk.title}}</a>
        <span v-else>{{talk.title}}</span>
      </h3>
      <p v-if="talk.speakers || talkTimeDuration">
        {{talk.speakers}}
        <span v-if="talk.speakers && talkTimeDuration"> | </span>
        {{talkTimeDuration}}
        <span v-if="currentTalkStore.talkId == talk.id"> | <i>Current Talk</i></span>
      </p>
      <p v-if="talk.lobby">Welcome to the Lobby. This room is active when there is currently no talk.</p>
      <TalkModeratorNotes :talk="talk"/>
    </div>
    <div class="rating" v-if="!talk.lobby">
      <TalkRating :talk="talk"/>
    </div>
    <TalkDiscussion :talk="talk" class="content"/>
  </div>
  <TalkRatingModal :talk="talk"/>
</template>

<script setup lang="ts">
import TalkDiscussion from '@/components/talk/TalkDiscussion.vue'
import TalkModeratorNotes from '@/components/talk/TalkModeratorNotes.vue'
import TalkRating from '@/components/talk/TalkRating.vue'
import TalkRatingModal from '@/components/talk/TalkRatingModal.vue'
import type { Talk } from '@/stores/talks'
import { useCurrentTalkStore } from '@/stores/currentTalk'
import { formatTalkTimeDuration } from '@/util/datetime'

const props = defineProps<{
  talk: Talk
}>()

const talkTimeDuration = formatTalkTimeDuration(props.talk)
const currentTalkStore = useCurrentTalkStore()
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
