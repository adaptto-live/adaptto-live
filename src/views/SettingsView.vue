<template>
  <h2 id="headlineSettings">Settings</h2>

  <table aria-describedby="headlineSettings">
    <tr>
      <th>User</th>
      <td><code>{{authenticationStore.username}}</code></td>
    </tr>
    <tr>
      <th>User ID</th>
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

  <div class="mt-3 form-chec small">
    <input type="checkbox" class="form-check-input" id="messageAnonymous" v-model="debugModeStore.debugMode">
    <label class="form-check-label ms-2" for="messageAnonymous">Enable Debug Mode</label>
  </div>

</template>

<script setup lang="ts">
import { useAuthenticationStore } from '@/stores/authentication'
import { version} from '@/../package.json'
import { useDebugModeStore } from '@/stores/debugMode';

const authenticationStore = useAuthenticationStore()
const debugModeStore = useDebugModeStore()
</script>

<style lang="scss" scoped>
th {
  padding-right: 10px;
}
</style>
