<template>
  <div class="discussion">
    <div v-if="usersInRoom.length > 0" class="usersInRoom">
      <button class="btn" type="button" data-bs-toggle="modal" data-bs-target="#usersInRoomModal">
        {{usersInRoom.length}} {{usersInRoom.length > 1 ? 'users' : 'user'}}
      </button>
      <div class="modal" id="usersInRoomModal" tabindex="-1">
        <div class="modal-dialog modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5">Users in room</h1>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div v-for="username in usersInRoom" :key="username">{{username}}</div>
            </div>
            <div class="modal-footer justify-content-between">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="tab-selection">
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a id="navLinkChat" class="nav-link active" href="#" @click.prevent="showChat">Discussion</a>
        </li>
        <li class="nav-item">
          <a id="navLinkQA" class="nav-link" href="#" @click.prevent="showQA" v-use-longpress="3000" @longpress="showQABigView">Q&amp;A</a>
        </li>
      </ul>
    </div>
    <div class="tab-discussion">
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link active">Discussion</a>
        </li>
      </ul>
    </div>
    <div class="tab-qa">
      <ul class="nav nav-tabs">
        <li class="nav-item">
          <a class="nav-link active" v-use-longpress="3000" @longpress="showQABigView">Q&amp;A</a>
        </li>
      </ul>
    </div>
    <div class="chat active" id="contentChat">
      <TalkChat :talk="talk"/>
    </div>
    <div class="qa" id="contentQA">
      <TalkQA :talk="talk"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Talk } from '@/stores/talks'
import TalkChat from './TalkChat.vue'
import TalkQA from './TalkQA.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import socket from '@/util/socket'
import router from '@/router'

const props = defineProps<{
  talk: Talk
}>()

const usersInRoom = ref([] as string[])

function socketConnectFunction() {
  // if a socket (re)connect happens while use is in the room, emit roomEnter again
  window.setTimeout(() => socket.emit('roomEnter', props.talk.id), 500);
}
function roomUsersFunction(usernames: string[]) {
  usersInRoom.value = usernames
}

onMounted(() => {
  socket.on('roomUsers', roomUsersFunction)
  // delay to avoid problems on reloading the page/reconnect
  window.setTimeout(() => {
    socket.emit('roomEnter', props.talk.id)
    socket.on('connect', socketConnectFunction)
  }, 250);
})
onUnmounted(() => {
  socket.off('roomUsers', roomUsersFunction)
  socket.off('connect', socketConnectFunction)
  socket.emit('roomLeave', props.talk.id)
})

function showChat() {
  document.getElementById('navLinkChat')?.classList.add('active')
  document.getElementById('contentChat')?.classList.add('active')
  document.getElementById('navLinkQA')?.classList.remove('active')
  document.getElementById('contentQA')?.classList.remove('active')
}
function showQA() {
  document.getElementById('navLinkChat')?.classList.remove('active')
  document.getElementById('contentChat')?.classList.remove('active')
  document.getElementById('navLinkQA')?.classList.add('active')
  document.getElementById('contentQA')?.classList.add('active')
}

function showQABigView() {
  router.push('/qa')
}
</script>

<style lang="scss" scoped>
.discussion {
  display: grid;
  height: 100%;
  width: 100%;
  grid-template-areas:
    "tab-discussion tab-qa"
    "chat qa";
  grid-template-rows: auto 1fr;
  grid-template-columns: 60% 40%;
  overflow-y: auto;
  .tab-selection {
    grid-area: tab-selection;
    display: none;
  }
  .tab-discussion {
    grid-area: tab-discussion;
    margin-right: 10px;
  }
  .tab-qa {
    grid-area: tab-qa;
  }
  .chat {
    grid-area: chat;
    overflow-y: hidden;
    margin-right: 10px;
  }
  .qa {
    grid-area: qa;
    overflow-y: hidden;
  }
  @media (max-width: 800px) {
    grid-template-areas:
      "tab-selection"
      "content";
    grid-template-columns: 100%;
    .tab-selection {
      grid-area: tab-selection;
      display: unset;
    }
    .tab-discussion, .tab-qa {
      display: none;
    }
    .chat, .qa {
      grid-area: content;
      display: none;
      margin-right: 0;
    }
    .chat.active, .qa.active {
      display: block;
    }
  }
}
.usersInRoom {
  position: absolute;
  right: 0;
  z-index: 5000;
  margin-right: 10px;
}
</style>
