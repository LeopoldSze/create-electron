<script setup lang="ts">
import BarTop from '@/renderer/components/BarTop.vue'

defineOptions({
  name: 'WindowSetting'
})
</script>

<template>
  <div class="setting">
    <BarTop title="设置" />
    <div class="setting__wrap">
      <div class="setting__menu">
        <div class="setting__menu-item">账号设置</div>
        <div class="setting__menu-item">消息通知</div>
        <div class="setting__menu-item">通用设置</div>
        <div class="setting__menu-item">文件管理</div>
        <div class="setting__menu-item">快捷键</div>
        <div class="setting__menu-item">关于</div>
      </div>
      <div class="setting__content">
        <router-view />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.setting {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;

  &__wrap {
    flex: 1;
    display: grid;
    grid-template-columns: 120px 1fr;
  }

  &__menu {
    background-color: var(--color-panel);

    &-item {
      height: 40px;
      line-height: 40px;
      text-align: center;
      cursor: pointer;

      &:hover {
        background-color: var(--color-border);
      }
    }
  }

  &__content {
    padding: 16px;
  }
}
</style>
