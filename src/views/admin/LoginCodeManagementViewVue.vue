<template>
  <h2 id="headlineAdminLoginCodeManagement">Admin: Login Code Management</h2>

  <table class="table table-striped table-hover" aria-describedby="headlineAdminLoginCodeManagement">
    <thead>
      <tr>
        <th>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="showCodesSwitch" v-model="showCodes">
            <label class="form-check-label" for="showCodesSwitch">Code</label>
          </div>
        </th>
        <th>User ID</th>
        <th>User</th>
        <th>Used</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="code in allCodes" :key="code.code">
        <td>{{showCodes ? code.code : code.code.replace(/./g, '⚬')}}</td>
        <td>{{code.userid}}</td>
        <td>{{code.username}}</td>
        <td><timeago v-if="code.used" :datetime="code.used"/></td>
      </tr>
    </tbody>
  </table>
</template>

<script setup lang="ts">
import socket from '@/util/socket'
import type { LoginCode } from '@/util/socket.types';
import { onMounted, ref } from 'vue'

const allCodes = ref([] as LoginCode[])
const showCodes = ref(false)

onMounted(() => {
  socket.emit('adminGetLoginCodes')
})
socket.on('adminLoginCodes', (codes: LoginCode[]) => {
  allCodes.value = codes
})
</script>
