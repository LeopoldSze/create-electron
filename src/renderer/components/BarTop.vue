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
  <div class="top-bar">
    <div class="title">{{ title }}</div>
    <div class="tools">
      <div @click="minimizeMainWindow">
        <i class="icon icon-minimize" />
      </div>
      <div v-if="isMaximized" @click="unmaximizeMainWindow">
        <i class="icon icon-restore" />
      </div>
      <div v-else @click="maximizeMainWin">
        <i class="icon icon-maximize" />
      </div>
      <div @click="closeWindow">
        <i class="icon icon-close" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.top-bar {
  width: 100%;
  height: 45px;
  display: flex;
  align-items: center;
  -webkit-app-region: drag;

  .title {
    flex: 1;
    padding-left: 12px;
    font-size: 16px;
    color: #555;
    font-weight: bold;
  }

  .tools {
    display: flex;
    -webkit-app-region: no-drag;

    div {
      width: 34px;
      height: 45px;
      line-height: 45px;
      text-align: center;
      color: #999;
      cursor: pointer;

      &:hover {
        background: #efefef;
      }

      &:last-child:hover {
        background: #ff7875;

        i {
          color: #fff !important;
        }
      }
    }

    .icon {
      font-size: 12px;
      color: #999;
      font-weight: bold;
    }
  }
}
</style>
