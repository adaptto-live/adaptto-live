import debugConsoleLog from '@/util/debugConsoleLog'
import { defineStore } from 'pinia'

export const useErrorMessagesStore = defineStore('errorMessages', {
  state: () => {
    return {
      errorMessages: [] as string[]
    }
  },
  actions: {
    add(error: string) {
      debugConsoleLog(`Error: ${error}`)
      this.errorMessages.push(error)
    },
    remove(index: number) {
      this.errorMessages = this.errorMessages.splice(index)
    }
  }
})
