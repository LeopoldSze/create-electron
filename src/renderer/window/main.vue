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
}
.content__wrap {
  border-top: 1px solid #e6e6e6;
  margin-top: -1px;
}
</style>
