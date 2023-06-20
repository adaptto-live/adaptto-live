<template>
  <nav class="navbar navbar-expand-md bg-secondary-subtle">
    <div class="container-fluid">
      <RouterLink to="/" class="navbar-brand" @click="collapseNavbar">
        <img src="@/assets/logo.svg" class="logo" alt="">
        adaptTo() Live
      </RouterLink>
      <template v-if="authenticationStore.isAuthenticated">
        <RouterLink to="/" class="btn btn-primary me-2" @click="collapseNavbar">Current Talk</RouterLink>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <div class="me-auto">
            <RouterLink to="/all-talks" class="btn btn-secondary me-md-2 mt-2 mt-md-0 d-block d-md-inline" @click="collapseNavbar">All Talks</RouterLink>
            <RouterLink to="/feedback" class="btn btn-secondary me-md-2 mt-2 mt-md-0 d-block d-md-inline" @click="collapseNavbar" v-if="showConferenceFeedback">Conference Feedback</RouterLink>
          </div>
          <ul class="navbar-nav mb-2 mb-lg-0">
            <li v-if="authenticationStore.admin" class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                Admin
              </a>
              <ul class="dropdown-menu">
                <li><RouterLink to="/admin/loginCodes" class="dropdown-item">Login Codes</RouterLink></li>
                <li><RouterLink to="/admin/userManagement" class="dropdown-item">User Management</RouterLink></li>
                <li><RouterLink to="/admin/talkRatings" class="dropdown-item">Talk Ratings</RouterLink></li>
                <li><RouterLink to="/admin/statistics" class="dropdown-item">Statistics</RouterLink></li>
              </ul>
            </li>
            <li class="nav-item">
              <RouterLink to="/settings" class="nav-link" @click="collapseNavbar">Settings</RouterLink>
            </li>
            <li class="nav-item">
              <a class="nav-link text-muted" @click.prevent="logout" href="#">Log out</a>
            </li>
          </ul>
        </div>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { Collapse } from 'bootstrap'
import { useAuthenticationStore } from '@/stores/authentication'
import socket from '@/util/socket'
import { useRatingStore } from '@/stores/rating'
import { onMounted, ref } from 'vue'

const router = useRouter()
const authenticationStore = useAuthenticationStore()
const ratingStore = useRatingStore()
const showConferenceFeedback = ref(false)

function collapseNavbar() {
  const el = document.querySelector('#navbarSupportedContent')
  if (el?.classList.contains('show')) {
    new Collapse(el).hide()
  }
}

function logout() {
  collapseNavbar()
  socket.disconnect()
  authenticationStore.logout()
  ratingStore.removeAll()
  router.push('/login')
}

onMounted(() => {
  socket.on('userBlocked', userid => {
    if (authenticationStore.userid == userid) {
      logout()
    }
  })
})
</script>

<style lang="scss" scoped>
.logo {
  height: 25px;
  margin-top: -0.25rem;
}
</style>
