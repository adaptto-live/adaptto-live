import { defineStore } from 'pinia'

export const useAuthenticationStore = defineStore('authentication', {
  state: () => {
    return {
      code: '',
      username: '',
      userid: '',
      admin: false
    }
  },
  getters: {
    isAuthenticated() : boolean {
      return this.code != '' && this.username != ''
    },
    isAdmin() : boolean {
      return this.admin
    }
  },
  actions: {
    login(code: string, username: string, userid: string, admin: boolean) {
      this.code = code
      this.username = username
      this.userid = userid
      this.admin = admin
    },
    logout() {
      this.code = ''
      this.username = ''
      this.userid = ''
      this.admin = false
    }
  },
  persist: true
})
