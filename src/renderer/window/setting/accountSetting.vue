<script setup lang="ts">
import { ref } from 'vue'

defineOptions({
  name: 'accountSetting'
})

const msg = ref('')
window.addEventListener('message', (event) => {
  msg.value = event.data
})

/**
 * 发送消息给父窗口
 */
const sendMsg = () => {
  window.opener.postMessage('hello, this is child');
}
</script>

<template>
  <div class="account-setting">
    <h3>hello, this is account setting page</h3>
    <p>msg from parent: {{ msg }}</p>
    <button @click="sendMsg">send msg to parent</button>
  </div>

</template>

<style scoped></style>
