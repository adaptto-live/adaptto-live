import { defineStore } from 'pinia'

export const useAuthenticationStore = defineStore('authentication', {
  state: () => {
    return {
      username: '',
      userid: '',
      admin: false
    }
  },
  getters: {
    isAuthenticated() : boolean {
      return this.username != ''
    },
    isAdmin() : boolean {
      return this.admin
    }
  },
  actions: {
    login(username: string, userid: string, admin: boolean) {
      this.username = username
      this.userid = userid
      this.admin = admin
    },
    logout() {
      this.username = ''
      this.userid = ''
      this.admin = false
    }
  },
  persist: true
})
