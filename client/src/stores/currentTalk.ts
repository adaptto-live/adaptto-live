import { defineStore } from 'pinia'

export const useCurrentTalkStore = defineStore('currentTalk', {
  state: () => {
    return {
      talkId: undefined as string|undefined
    }
  },
  actions: {
    set(talkId: string) {
      this.talkId = talkId
    }
  }
})
