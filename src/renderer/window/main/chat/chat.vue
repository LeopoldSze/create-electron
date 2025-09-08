<script setup lang="ts">
import { onMounted } from 'vue'
import { useChatStore } from '@/renderer/stores/chat.ts'
import ChatSearch from '@/renderer/window/main/chat/ChatSearch.vue'
import ChatItem from '@/renderer/window/main/chat/ChatItem.vue'
import MessageBoard from '@/renderer/window/main/chat/MessageBoard.vue'
import MessageInput from '@/renderer/window/main/chat/MessageInput.vue'

defineOptions({
  name: 'MainChat'
})

const store = useChatStore()
onMounted(() => {
  store.selectChat(store.data[6])
})
</script>

<template>
  <div class="chat">
    <aside>
      <ChatSearch />
      <div class="chat-list">
        <ChatItem v-for="item in store.data" :key="item.id" :data="item" />
      </div>
    </aside>
    <section class="chat__panel">
      <MessageBoard />
      <MessageInput />
    </section>
  </div>
</template>

<style scoped lang="scss">
.chat {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: 100%;
  min-height: 0; /* 关键：允许子元素滚动 */

  aside {
    display: flex;
    flex-direction: column;
    height: 100%;
    border-right: 1px solid var(--color-border);
    background: var(--color-panel);
    min-height: 0; /* 允许列表滚动 */
  }

  &-list {
    background: linear-gradient(to bottom right, var(--color-border), var(--color-panel));
    flex: 1;
    overflow-y: auto; /* 仅左侧列表滚动 */
    min-height: 0;
  }

  &__panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    background: #fff;
    min-height: 0; /* 允许消息区滚动 */
  }
}
</style>
