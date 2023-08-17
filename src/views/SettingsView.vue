<template>
  <h2 id="headlineSettings">Settings</h2>

  <table aria-describedby="headlineSettings">
    <tr>
      <th>User</th>
      <td><code>{{authenticationStore.username}}</code>
        <button v-if="!showChangeHint" class="btn btn-sm btn-outline-secondary ms-3" @click="showChangeHint=true">Change</button></td>
    </tr>
    <tr v-if="showChangeHint">
      <th></th>
      <td>
        <p>If you want to change your user name: Please log out, and login with the same login code but a different user name. Other users will see this change only after they reload the page or switch the talk.</p>
      </td>
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

  <div class="mt-3 form-chec small" v-if="!hideDebugMode">
    <input type="checkbox" class="form-check-input" id="messageAnonymous" v-model="debugModeStore.debugMode">
    <label class="form-check-label ms-2" for="messageAnonymous">Enable Debug Mode</label>
  </div>

</template>

<script setup lang="ts">
import { useAuthenticationStore } from '@/stores/authentication'
import { version} from '@/../package.json'
import { useDebugModeStore } from '@/stores/debugMode';
import { ref } from 'vue';

const authenticationStore = useAuthenticationStore()
const debugModeStore = useDebugModeStore()
const hideDebugMode = (import.meta.env.VITE_HIDE_DEBUG_MODE == 'true')
const showChangeHint = ref(false)
</script>

<style lang="scss" scoped>
th {
  padding-right: 10px;
}
</style>
