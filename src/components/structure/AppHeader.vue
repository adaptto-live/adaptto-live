<template>
  <nav class="navbar navbar-expand-lg bg-secondary-subtle">
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
            <RouterLink to="/all-talks" class="btn btn-secondary me-lg-2 mt-2 mt-lg-0 d-block d-lg-inline" @click="collapseNavbar">All Talks</RouterLink>
            <template v-if="authenticationStore.qaadmin">
              <RouterLink to="/qa" class="btn btn-warning me-lg-2 mt-2 mt-lg-0 d-block d-lg-inline" @click="collapseNavbar">Q&amp;A View</RouterLink>
            </template>
            <template v-else>
              <a :href="lamaPollUrl" target="_blank" class="btn btn-secondary me-lg-2 mt-2 mt-lg-0 d-block d-lg-inline" @click="collapseNavbar" v-if="lamaPollUrl">
                Conference Feedback <img class="external-link-icon" src="@/assets/external-link.svg" alt=""/>
              </a>
              <a href="mailto:info@adapt.to?subject=Lightning Talk Proposal" class="btn btn-secondary me-lg-2 mt-2 mt-lg-0 d-block d-lg-inline" @click="collapseNavbar" v-if="lamaPollUrl">
                Submit Lightning Talk
              </a>
            </template>
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
                <li><RouterLink to="/admin/kpi" class="dropdown-item">KPI</RouterLink></li>
                <li><hr class="dropdown-divider"></li>
                <li><RouterLink to="/qa" class="dropdown-item">Q&amp;A View</RouterLink></li>
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
import { onMounted } from 'vue'

const router = useRouter()
const authenticationStore = useAuthenticationStore()
const ratingStore = useRatingStore()

let lamaPollUrl : string|undefined
const lamaPollUrlPrefix = import.meta.env.VITE_LAMAPOLL_URL
if (lamaPollUrlPrefix) {
  lamaPollUrl = lamaPollUrlPrefix + authenticationStore.code
}

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
.external-link-icon {
  width: 20px;
  margin-top: -3px;
}
</style>
