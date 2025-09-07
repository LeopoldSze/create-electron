<script setup lang="ts">
import BarTop from '@/renderer/components/BarTop.vue'

defineOptions({
  name: 'WindowSetting'
})
</script>

<template>
  <BarTop title="设置" />
  <div class="setting">
    <div class="setting__menu">
      <div class="setting__menu__item">账号设置</div>
      <div class="setting__menu__item">消息通知</div>
      <div class="setting__menu__item">通用设置</div>
      <div class="setting__menu__item">文件管理</div>
      <div class="setting__menu__item">快捷键</div>
      <div class="setting__menu__item">关于</div>
    </div>
    <router-view />
  </div>
</template>

<style scoped lang="scss">
.setting {
  display: grid;
  grid-template-columns: 120px 1fr;
  padding-top: 50px;

  &__menu {
    border-right: 1px solid #e3e3e3;

    &__item {
      height: 32px;
      line-height: 32px;
      text-align: center;
    }
  }
}
</style>
