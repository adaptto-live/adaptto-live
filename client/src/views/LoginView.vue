<template>
  <h1>Login</h1>

  <div v-if="loginInProcess" class="spinner-border mt-5" role="status">
    <span class="visually-hidden">Logging in...</span>
  </div>
  <form v-else>
    <p v-if="loginError" class="alert alert-danger mt-3">{{loginError}}</p>
    <div class="mb-3 mt-3">
      <label for="username" class="form-label">Username</label>
      <input type="text" class="form-control" id="username" v-model="username">
    </div>
    <button type="submit" class="btn btn-primary" :disabled="!isValid()" @click.prevent="login">Login</button>
  </form>

</template>

<script setup lang="ts">
import { useAuthenticationStore } from '@/stores/authentication'
import socket from '@/util/socket'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authenticationStore = useAuthenticationStore()

const username = ref('')
const loginInProcess = ref(false)
const loginError = ref('')

function isValid() : boolean {
  return username.value.trim() != ''
}

function login() : void {
  loginInProcess.value = true
  if (socket.connected) {
    socket.disconnect()
  }
  socket.auth = { username: username.value }
  socket.connect()
}

socket.on('login', (userid, admin) => {
  authenticationStore.login(username.value, userid, admin)
  router.push('/')
})

socket.on('connect_error', (err) => {
  loginInProcess.value = false
  loginError.value = err.message
})
</script>
