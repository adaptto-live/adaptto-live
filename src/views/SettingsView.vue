<template>
  <h2 id="headlineSettings">Settings</h2>

  <table aria-describedby="headlineSettings">
    <tr>
      <th>User</th>
      <td><code>{{authenticationStore.username}}</code></td>
    </tr>
    <tr>
      <th>ID</th>
      <td><code>{{authenticationStore.userid}}</code></td>
    </tr>
    <tr v-if="authenticationStore.admin">
      <th>Admin</th>
      <td><code>{{authenticationStore.admin}}</code></td>
    </tr>
    <tr>
      <th>Client Version</th>
      <td><code>{{version}}</code></td>
    </tr>
  </table>
  
</template>

<script setup lang="ts">
import { useAuthenticationStore } from '@/stores/authentication'
import { version} from '@/../package.json'

const authenticationStore = useAuthenticationStore()
</script>

<style lang="scss" scoped>
th {
  padding-right: 10px;
}
</style>
