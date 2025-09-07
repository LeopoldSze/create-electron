<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { ipcRenderer } from 'electron'

defineOptions({
  name: 'BarTop'
})
defineProps<{ title?: string }>()

const isMaximized = ref(false)

/**
 * 关闭窗口
 */
const closeWindow = () => {
  ipcRenderer.invoke('closeWindow')
}

/**
 * 最大化窗口
 */
const maximizeMainWin = () => {
  ipcRenderer.invoke('maximizeWindow')
}

/**
 * 最小化窗口
 */
const minimizeMainWindow = () => {
  ipcRenderer.invoke('minimizeWindow')
}

/**
 * 取消最大化窗口
 */
const unmaximizeMainWindow = () => {
  ipcRenderer.invoke('unmaximizeWindow')
}

/**
 * 监听窗口最大化事件
 */
const winMaximizeEvent = () => {
  isMaximized.value = true
}

/**
 * 监听窗口取消最大化事件
 */
const winUnmaximizeEvent = () => {
  isMaximized.value = false
}

onMounted(() => {
  ipcRenderer.on('windowMaximized', winMaximizeEvent)
  ipcRenderer.on('windowUnmaximized', winUnmaximizeEvent)
})
onUnmounted(() => {
  ipcRenderer.off('windowMaximized', winMaximizeEvent)
  ipcRenderer.off('windowUnmaximized', winUnmaximizeEvent)
})
</script>

<template>
  <div class="bar-top">
    <div class="bar-top__title">{{ title }}</div>
    <div class="bar-top__tools">
      <div class="bar-top__tools-item" @click="minimizeMainWindow">
        <i class="icon icon-minimize" />
      </div>
      <div v-if="isMaximized" class="bar-top__tools-item" @click="unmaximizeMainWindow">
        <i class="icon icon-restore" />
      </div>
      <div v-else class="bar-top__tools-item" @click="maximizeMainWin">
        <i class="icon icon-maximize" />
      </div>
      <div class="bar-top__tools-item bar-top__tools-item--danger" @click="closeWindow">
        <i class="icon icon-close" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bar-top {
  width: 100%;
  height: 45px;
  display: flex;
  align-items: center;
  -webkit-app-region: drag;

  &__title {
    flex: 1;
    padding-left: 12px;
    font-size: 16px;
    color: var(--color-text-title);
    font-weight: bold;
  }

  &__tools {
    display: flex;
    -webkit-app-region: no-drag;

    &-item {
      width: 34px;
      height: 45px;
      line-height: 45px;
      text-align: center;
      color: var(--color-text-muted);
      cursor: pointer;

      &:hover {
        background: var(--color-border);
      }

      &--danger:hover {
        background: var(--color-danger);

        i {
          color: #fff !important;
        }
      }

      .icon {
        font-size: 12px;
        color: var(--color-text-muted);
        font-weight: bold;
      }
    }
  }
}
</style>
