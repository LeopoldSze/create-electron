<script setup lang="ts">
import BarLeft from '@/renderer/components/BarLeft.vue'
import BarTop from '@/renderer/components/BarTop.vue'
import { ipcRenderer } from 'electron'
import { onMounted } from 'vue'

defineOptions({
  name: 'WindowMain'
})

onMounted(() => {
  ipcRenderer.invoke('showWindow')
})
</script>

<template>
  <div class="container">
    <BarLeft />
    <div class="content">
      <BarTop title="Sze" />
      <div class="content__wrap">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.container {
  width: 100%;
  height: 100%;
  display: grid;
  grid-template-columns: 54px 1fr;
  min-height: 0; /* 允许子项按需收缩，启用滚动 */
}
.content {
  display: flex;
  flex-direction: column;
  min-height: 0; /* 关键：使下方可滚动 */
}
.content__wrap {
  border-top: 1px solid var(--color-border);
  margin-top: -1px;
  flex: 1; /* 填充剩余空间 */
  min-height: 0; /* 关键：允许内部滚动 */
  display: flex; /* 让 router-view 子页面（chat.vue）可以用 100% 高度 */
  overflow: hidden; /* 避免外层跟随滚动 */
}
</style>
