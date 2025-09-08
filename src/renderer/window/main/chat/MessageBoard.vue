<script setup lang="ts">
import { onMounted, nextTick, ref, watch } from 'vue'
import { useChatStore } from '@/renderer/stores/chat.ts'
import { useMessageStore } from '@/renderer/stores/message.ts'

defineOptions({
  name: 'MessageBoard'
})

const chatStore = useChatStore()
const messageStore = useMessageStore()

let curId = ''
const wrapRef = ref<HTMLDivElement | null>(null)

const scrollToBottom = () => {
  const el = wrapRef.value
  if (el) {
    el.scrollTop = el.scrollHeight
  }
}

chatStore.$subscribe((_mutation, state) => {
  const item = state.data.find((v) => v.isSelected)
  if (item && item.id !== curId) {
    curId = item.id
    messageStore.initData(item)
    nextTick(scrollToBottom)
  }
})

watch(
  () => messageStore.data.length,
  () => nextTick(scrollToBottom)
)

onMounted(() => nextTick(scrollToBottom))
</script>

<template>
  <div class="message-board" ref="wrapRef">
    <div
      v-for="item in messageStore.data"
      :key="item.id"
      :class="[
        'message-board__item',
        item.isInMsg ? 'message-board__item--in' : 'message-board__item--out'
      ]"
    >
      <template v-if="item.isInMsg">
        <div class="message-board__item__avatar">
          <img :src="item.avatar" alt="avatar" />
        </div>
        <div class="message-board__item__content">
          <div class="message-board__item__content--name">{{ item.fromName }}</div>
          <div class="message-board__item__content--msg">{{ item.messageContent }}</div>
        </div>
      </template>
      <template v-else>
        <div class="message-board__item__content">
          <div class="message-board__item__content--msg">{{ item.messageContent }}</div>
        </div>
        <div class="message-board__item__avatar">
          <img :src="item.avatar" alt="avatar" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped lang="scss">
.message-board {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden auto; /* 仅消息区滚动 */
  background-color: #f5f5f5;
  padding: var(--space-md);
  min-height: 0; /* 关键：允许内部滚动 */

  &__item {
    display: flex;
    position: relative;
    padding: 6px 0;

    &--in {
      padding-right: 20%;

      &::after {
        width: 0; height: 0;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-right: 6px solid #fff;
        position: absolute;
        left: 60px;
        top: 34px;
        content: '';
      }
    }

    &--out {
      justify-content: flex-end;
      padding-left: 20%;

      &::after {
        width: 0; height: 0;
        border-top: 6px solid transparent;
        border-bottom: 6px solid transparent;
        border-left: 6px solid var(--color-message);
        position: absolute;
        right: 60px;
        top: 16px;
        content: '';
      }

      .message-board__item__content--msg {
        background-color: var(--color-message);
      }
    }

    &__avatar {
      width: 46px;
      text-align: center;

      img {
        width: 36px;
        height: 36px;
        border-radius: var(--radius-sm);
      }
    }

    &__content {
      max-width: 60%;

      &--name {
        margin: 0 0 var(--space-xxs) var(--space-xs);
        color: var(--color-text-secondary);
        font-size: 12px;
      }

      &--msg {
        padding: 8px 12px;
        background-color: #fff;
        border-radius: 8px;
        line-height: 22px;
        box-shadow: 0 1px 1px rgba(0,0,0,0.06);
        word-break: break-word;
        white-space: pre-wrap;
      }
    }
  }
}
</style>
