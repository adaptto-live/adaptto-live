import { defineStore } from 'pinia'

export const useAuthenticationStore = defineStore('authentication', {
  state: () => {
    return {
      authenticated: false,
      code: '',
      username: '',
      userid: '',
      admin: false,
      qaadmin: false
    }
  },
  getters: {
    isAuthenticated() : boolean {
      return this.authenticated && this.code != '' && this.username != ''
    },
    isAdmin() : boolean {
      return this.admin
    }
  },
  actions: {
    login(code: string, username: string, userid: string, admin: boolean, qaadmin: boolean) {
      this.authenticated = true
      this.code = code
      this.username = username
      this.userid = userid
      this.admin = admin
      this.qaadmin = qaadmin
    },
    logout() {
      this.authenticated = false
      this.userid = ''
      this.admin = false
      this.qaadmin = false
    }
  },
  persist: true
})
