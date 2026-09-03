<template>
  <div class="wrapper">
    <div class="emoji-picker-trigger" @click="emojiPopup">😃</div>
    <div v-if="showPicker" class="emoji-picker" @click="emojiPopup">
      <span v-for="emoji in emojiList" :key="emoji" @click.stop="insertEmoji(emoji)">{{emoji}}</span>
    </div>
    <label :for="textareaId" class="visually-hidden">{{ ariaLabel }}</label>
    <textarea v-model="value" ref="textarea" :id="textareaId" @keydown="keydown" :maxlength="maxLength"/>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, useId } from 'vue'

const props = defineProps({
  modelValue: {
    type: String
  },
  allowEnter: {
    type: Boolean
  },
  maxLength: {
    type: Number,
    default: 500
  },
  ariaLabel: {
    type: String,
    default: 'Message text'
  }
})
const emit = defineEmits(['update:modelValue','enter-key'])

const value = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emit('update:modelValue', value)
  }
})

const textareaId = useId()
const textarea = ref<HTMLTextAreaElement|null>(null)
const emojiList = '😀,😁,😆,😂,🤣,😊,🙂,🙃,😉,😌,😍,😎,😕,🙁,☹️,😐,😦,😲,,😭,🙄,👍,👎,👋'.split(',')

const showPicker = ref(false)

function emojiPopup() : void {
  showPicker.value = !showPicker.value  
}

function insertEmoji(emoji : string) : void {
  insertAtCursorPosition(emoji)
  showPicker.value = false
}

function insertAtCursorPosition(text : string) : void {
  const field = textarea.value
  if (!field) {
    return
  }
  if (value.value) {
    const selectionStart = field.selectionStart
    const selectionEnd = field.selectionEnd
    if (selectionStart >= 0) {
      value.value = value.value.substring(0, selectionStart)
          + text
          + value.value.substring(selectionEnd, value.value.length)
      window.setTimeout(() => {
        field.focus()
        field.setSelectionRange(selectionStart+text.length, selectionStart+text.length)
      }, 1)
    }
    else {
      value.value += text
      field.focus()
    }
  }
  else {
    value.value = text
    field.focus()
  }
}

function keydown(e : KeyboardEvent) {
  if (e.key == 'Enter') {
    if (e.ctrlKey || e.altKey) {
      insertAtCursorPosition('\n')
    }
    else if (!e.shiftKey && !props.allowEnter) {
      e.preventDefault()
      emit('enter-key')
    }
  }
}

</script>

<style lang="scss" scoped>
.wrapper {
  position: relative;
}
textarea {
  resize: none;
  width: 100%;
  height: 100%;
  padding-right: 25px;
}
.emoji-picker-trigger {
  position: absolute;
  top: 3px;
  right: 3px;
  font-size: 15px;
  cursor: pointer;
  filter: grayscale(100%);
}
.emoji-picker {
  position: absolute;
  top: -110px;
  right: 0px;
  background-color: darkgray;
  padding: 10px;
  font-size: 15px;
  border-radius: 5px;
  width: 268px;
  span {
    display: inline-block;
    cursor: pointer;
    padding: 3px;
  }
}
</style>
