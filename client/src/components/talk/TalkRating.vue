<template>
  <div v-if="rating" class="stars" @click="showModal">
    <SvgStar v-for="index in 5" :key="index" :class="{fill: rating >= index}"/>
  </div>
  <button v-else class="btn btn-warning" :class="{'btn-sm':smallButton}" @click="showModal">Rate Talk</button>
  <TalkRatingModal :talk="talk" ref="modal"/>
</template>

<script setup lang="ts">
import { useRatingStore } from '@/stores/rating'
import { computed } from 'vue'
import TalkRatingModal from './TalkRatingModal.vue'
import { ref } from 'vue'
import type { Talk } from '@/stores/talks'
import SvgStar from '../structure/SvgStar.vue'

const props = defineProps<{
  talk: Talk
  smallButton?: boolean
}>()

const ratingStore = useRatingStore()
const rating = computed(() => ratingStore.getRating(props.talk.id))
const modal = ref<typeof TalkRatingModal>();

function showModal() {
  modal.value?.show()
}
</script>

<style lang="scss" scoped>
.stars {
  position: relative;
  white-space: nowrap;
  height: 30px;
  cursor: pointer;
  svg {
    width: 20px;
  }
}

svg {
  fill: gray;
}

svg.fill {
  fill: orange;
}
</style>
