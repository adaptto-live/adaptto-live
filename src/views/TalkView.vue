<template>
  <TalkBreakOtherDetail v-if="talk && talk.isBreakOther && isModerator" :talk="talk"/>
  <TalkDetail v-else-if="talk && !talk.isBreakOther" :talk="talk"/>
  <NotFoundView v-else/>
</template>

<script setup lang="ts">
import TalkBreakOtherDetail from '@/components/talk/TalkBreakOtherDetail.vue'
import TalkDetail from '@/components/talk/TalkDetail.vue'
import NotFoundView from '@/views/NotFoundView.vue'
import TalkManager from '@/services/TalkManager'
import { useAuthenticationStore } from '@/stores/authentication'
import { useRoute } from 'vue-router'

const route = useRoute()
const talkId = route.params.talk as string
const talkManager = new TalkManager()
const talk = talkManager.getTalk(talkId)
const authenticationStore = useAuthenticationStore()
const isModerator = authenticationStore.qaadmin || authenticationStore.admin
</script>
