<script setup lang="ts">
import { ModelChat } from '@/model'
import { useChatStore } from '@/renderer/stores/chat.ts'

defineOptions({ name: 'ChatItem' })

defineProps<{ data: ModelChat }>()

const chatStore = useChatStore()

const handleClick = (item: ModelChat) => {
  chatStore.selectChat(item)
}
</script>

<template>
  <div :class="['chat-item', { 'chat-item--selected': data.isSelected }]" @click="handleClick(data)">
    <div class="chat-item__avatar">
      <img :src="data.avatar" alt="avatar" />
    </div>
    <div class="chat-item__info">
      <div class="chat-item__info__row">
        <div class="chat-item__info__row--name">{{ data.fromName }}</div>
        <div class="chat-item__info__row--time">{{ data.sendTime }}</div>
      </div>
      <div class="chat-item__info__row">
        <div class="chat-item__info__row--msg">{{ data.lastMsg }}</div>
        <div class="chat-item__info__row--subscribe"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.chat-item {
  height: 58px;
  display: grid;
  grid-template-columns: 46px 1fr;
  gap: var(--space-xs);
  cursor: pointer;
  padding: 8px 10px;
  box-sizing: border-box;

  &:hover {
    background-color: #ededed;
  }

  &--selected {
    background-color: #e7f5ed;
  }

  &__avatar {
    width: 40px;
    height: 40px;
    border-radius: var(--radius-sm);
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  &__info {
    height: 100%;
    display: flex;
    flex-direction: column;
    border-bottom: 1px solid var(--color-border);

    &__row {
      height: 24px;
      display: flex;
      align-items: center;
      gap: var(--space-xxs);

      &--name,
      &--msg {
        flex: 1;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &--name { color: #333; font-weight: 500; }
      &--time,
      &--msg { color: var(--color-text-muted); font-size: 12px; }
    }
  }
}
</style>
