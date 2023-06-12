import { defineStore } from 'pinia'

export interface TalkRating {
  talkId: string
  rating: number
  comment?: string
}

export const useRatingStore = defineStore('rating', {
  state: () => {
    return {
      rating: [] as TalkRating[]
    }
  },
  actions: {
    addRating(talkId: string, rating: number, comment?: string) {
      this.removeRating(talkId)
      this.rating.push({ talkId, rating, comment })
    },
    removeRating(talkId: string) {
      this.rating = this.rating.filter(item => item.talkId != talkId)
    },
    removeAll() {
      this.rating = []
    },
    getRating(talkId: string) : number|undefined {
      return this.rating.find(item => item.talkId==talkId)?.rating
    },
    getComment(talkId: string) : string|undefined {
      return this.rating.find(item => item.talkId==talkId)?.comment
    }
  }
})
