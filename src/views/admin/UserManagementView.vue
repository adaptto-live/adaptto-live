<template>
  <h2 id="headlineAdminUserManagement">Admin: User Management</h2>

  <table class="table table-striped table-hover" aria-describedby="headlineAdminUserManagement">
    <thead>
      <tr>
        <th>Username</th>
        <th>ID</th>
        <th>
          <div class="form-check form-switch">
            <input class="form-check-input" type="checkbox" role="switch" id="showCodesSwitch" v-model="showCodes">
            <label class="form-check-label" for="showCodesSwitch">Code</label>
          </div>
        </th>
        <th>Admin</th>
        <th>Blocked</th>
        <th>Created</th>
        <th>Updated</th>
        <th></th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="user in allUsers" :key="user.id">
        <td>{{user.username}}</td>
        <td>{{user.id}}</td>
        <td>{{showCodes ? user.code : user.code.replace(/./g, '⚬')}}</td>
        <td>{{user.admin ? '☑' : '☐'}}</td>
        <td>{{user.blocked ? '☑' : '☐'}}</td>
        <td><timeago v-if="user.created" :datetime="user.created"/></td>
        <td><timeago v-if="user.updated" :datetime="user.updated"/></td>
        <td><button class="btn btn-sm btn-primary" data-bs-toggle="modal" data-bs-target="#userEditModal"
            @click="selectedUser=user">Edit</button></td>
      </tr>
    </tbody>
  </table>

  <div class="modal" id="userEditModal" tabindex="-1">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Edit User</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body" v-if="selectedUser">
          <div class="mt-3">
            <label for="userId" class="form-label">ID</label>
            <input class="form-control" id="userId" v-model="selectedUser.id" disabled>
          </div>
          <div class="mt-3">
            <label for="userName" class="form-label">Username</label>
            <input class="form-control" id="userName" v-model="selectedUser.username" maxlength="30">
          </div>
          <div class="mt-3 form-check">
            <input type="checkbox" class="form-check-input" id="userAdmin" v-model="selectedUser.admin">
            <label class="form-check-label" for="userAdmin">Admin</label>
          </div>
          <div class="mt-3 form-check">
            <input type="checkbox" class="form-check-input" id="userBlocked" v-model="selectedUser.blocked">
            <label class="form-check-label" for="userBlocked">Blocked</label>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-bs-dismiss="modal"
              @click="save" :disabled="!isValid()">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useErrorMessagesStore } from '@/stores/errorMessages';
import socket from '@/util/socket'
import type { User } from '@/util/socket.types';
import { onMounted, ref } from 'vue'

const errorMessagesStore = useErrorMessagesStore()
const allUsers = ref([] as User[])
const selectedUser = ref(undefined as User|undefined)
const showCodes = ref(false)

onMounted(() => {
  socket.emit('adminGetUsers')
})
socket.on('adminUsers', (users: User[]) => {
  allUsers.value = users
})

function isValid() : boolean {
  return selectedUser.value != undefined && selectedUser.value.username.trim() != ''
}

function save() : void {
  if (selectedUser.value) {
    const { id, username, admin, blocked } = selectedUser.value
    socket.emit('adminUpdateUser', {id, username, admin, blocked}, result => {
      if (result.error) {
        errorMessagesStore.add(`Unable to update user: ${result.error}`)
      }
    })
  }
}
</script>
