import { defineStore } from 'pinia'

const configuredDebugMode = (import.meta.env.VITE_DEBUG_MODE == 'true')

export const useDebugModeStore = defineStore('debugMode', {
  state: () => {
    return {
      debugMode: configuredDebugMode
    }
  },
  persist: true
})
