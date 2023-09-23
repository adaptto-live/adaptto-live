<template>
  <h2 id="headlineSettings">Settings</h2>

  <table aria-describedby="headlineSettings">
    <tr>
      <th>User</th>
      <td><code>{{authenticationStore.username}}</code>
        <button class="btn btn-sm btn-outline-secondary ms-3"  data-bs-toggle="modal" data-bs-target="#changeUserNameModal">Change</button></td>
    </tr>
    <tr>
      <th>User ID</th>
      <td><code>{{authenticationStore.userid}}</code></td>
    </tr>
    <tr v-if="authenticationStore.admin">
      <th>Admin</th>
      <td><code>{{authenticationStore.admin ? '☑' : '☐'}}</code></td>
    </tr>
    <tr v-if="authenticationStore.qaadmin">
      <th>Q&A Admin</th>
      <td><code>{{authenticationStore.qaadmin ? '☑' : '☐'}}</code></td>
    </tr>
    <tr>
      <th>Client Version</th>
      <td><code>{{version}}</code></td>
    </tr>
  </table>

  <div class="mt-3 form-chec small" v-if="showDebugMode">
    <input type="checkbox" class="form-check-input" id="messageAnonymous" v-model="debugModeStore.debugMode">
    <label class="form-check-label ms-2" for="messageAnonymous">Enable Debug Mode</label>
  </div>

  <div class="modal" tabindex="-1" id="changeUserNameModal">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Change User Name</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <p>If you want to change your user name: Please log out, and login with the same login code but a different user name.</p>
          <p>Other users will see this change only after they reload the page or switch the talk.</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { useAuthenticationStore } from '@/stores/authentication'
import { version} from '@/../package.json'
import { useDebugModeStore } from '@/stores/debugMode';

const authenticationStore = useAuthenticationStore()
const debugModeStore = useDebugModeStore()
const showDebugMode = (import.meta.env.VITE_SHOW_DEBUG_MODE == 'true')
</script>

<style lang="scss" scoped>
th {
  padding-right: 10px;
}
</style>
