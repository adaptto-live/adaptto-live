<template>
  <h1>Login</h1>

  <div v-if="loginInProcess" class="spinner-border mt-5" role="status">
    <span class="visually-hidden">Logging in...</span>
  </div>
  <form v-else>
    <p v-if="loginError" class="alert alert-danger mt-3">{{loginError}}</p>
    <div class="mb-3 mt-3">
      <label for="code" class="form-label">Login Code *</label>
      <input type="text" class="form-control" id="code" aria-describedby="codeHelp" v-model="code" maxlength="10">
      <div id="codeHelp" class="form-text">You will get a unique login code at the reception.</div>
    </div>
    <div class="mb-3 mt-3">
      <label for="username" class="form-label">Username *</label>
      <input type="text" class="form-control" id="username" aria-describedby="usernameHelp" v-model="username" maxlength="30">
      <div id="usernameHelp" class="form-text">Please provide a user name or nick name to be displayed in the chat rooms.</div>
    </div>
    <button type="submit" class="btn btn-primary" :disabled="!isValid()" @click.prevent="login">Login</button>
  </form>

</template>

<script setup lang="ts">
import { useAuthenticationStore } from '@/stores/authentication'
import socket from '@/util/socket'
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const router = useRouter()
const route = useRoute()
const authenticationStore = useAuthenticationStore()

const code = ref(getInitialLoginCode())
const username = ref(authenticationStore.username)
const loginInProcess = ref(false)
const loginError = ref('')

function isValid() : boolean {
  return code.value.trim() != '' && username.value.trim() != ''
}

function login() : void {
  loginInProcess.value = true
  if (socket.connected) {
    socket.disconnect()
  }
  socket.auth = { code: code.value.trim().toLocaleUpperCase(), username: username.value.trim() }
  socket.connect()
}

function getInitialLoginCode() : string {
  if (authenticationStore.code != '') {
    return authenticationStore.code
  }
  else {
    return route.params.code as string ?? ''
  }
}

socket.on('login', (userid, admin, qaadmin?) => {
  authenticationStore.login(code.value.trim().toLocaleUpperCase(), username.value.trim(), userid, admin, qaadmin ?? false)
  router.push('/')
})

socket.on('connect_error', (err) => {
  loginInProcess.value = false
  loginError.value = err.message
})
</script>
