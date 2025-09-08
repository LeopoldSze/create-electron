<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useMessageStore } from '@/renderer/stores/message.ts'

defineOptions({ name: 'MessageInput' })

const store = useMessageStore()
const text = ref('')
const textareaRef = ref<HTMLTextAreaElement | null>(null)

const send = () => {
  if (!text.value.trim()) return
  store.sendMessage(text.value)
  text.value = ''
  nextTick(() => textareaRef.value?.focus())
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    send()
  }
}

onMounted(() => {
  textareaRef.value?.focus()
})
</script>

<template>
  <div class="msg-input">
    <div class="msg-input__toolbar">
      <i class="icon icon-biaoqing"></i>
      <i class="icon icon-tupian"></i>
      <i class="icon icon-jianpan"></i>
    </div>
    <div class="msg-input__editor">
      <textarea
        ref="textareaRef"
        v-model="text"
        placeholder="输入消息，Enter发送，Shift+Enter换行"
        @keydown="handleKeydown"
      />
    </div>
    <div class="msg-input__footer">
      <div class="msg-input__tip">按 Enter 发送，Shift+Enter 换行</div>
      <button class="msg-input__send" :disabled="!text.trim()" @click="send">发送</button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.msg-input {
  border-top: 1px solid var(--color-border);
  padding: var(--space-sm);
  background: #fff;

  &__toolbar {
    display: flex;
    gap: var(--space-sm);
    color: var(--color-text-secondary);

    i { cursor: pointer; }
  }

  &__editor {
    margin-top: var(--space-sm);

    textarea {
      width: 100%;
      height: 80px;
      resize: none;
      border: none;
      outline: none;
      font-size: 14px;
      line-height: 1.6;
      box-sizing: border-box;
    }
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: var(--space-sm);
  }

  &__send {
    padding: 6px 14px;
    border: none;
    border-radius: 4px;
    background: var(--color-active);
    color: #fff;
    cursor: pointer;

    &:disabled {
      background: #b6e6c9;
      cursor: not-allowed;
    }
  }

  &__tip {
    color: var(--color-text-muted);
    font-size: 12px;
  }
}
</style>