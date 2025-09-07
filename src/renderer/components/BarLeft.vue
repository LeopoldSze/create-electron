<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { createDialog } from '@/common/dialog.ts'
import type { AppWindowOptions } from '@/types/window.ts'

defineOptions({
  name: 'BarLeft'
})

// 菜单列表数组
const mainWindowRoutes = ref([
  { path: '/main/chat', isSelected: true, icon: 'icon-chat', iconSelected: 'icon-chat' },
  {
    path: '/main/contact',
    isSelected: false,
    icon: 'icon-tongxunlu1',
    iconSelected: 'icon-tongxunlu'
  },
  {
    path: '/main/collection',
    isSelected: false,
    icon: 'icon-shoucang1',
    iconSelected: 'icon-shoucang'
  }
])
const route = useRoute()

// 注册路由变化监听器
watch(
  () => route,
  () => mainWindowRoutes.value.forEach((v) => (v.isSelected = v.path === route.fullPath)),
  {
    immediate: true,
    deep: true
  }
)

const openSettingWindow = async () => {
  const config: AppWindowOptions = {
    modal: true,
    width: 1000,
    webPreferences: {
      webviewTag: false
    }
  }
  const dialog = await createDialog('/setting/account', config)
  dialog.postMessage({
    msgName: 'hello',
    value: 'msg from parent'
  })
}

window.addEventListener('message', (e) => {
  alert('msg from child:' + e.data);
})
</script>

<template>
  <div class="bar">
    <div class="bar__icon">
      <img src="../assets/avatar.jpg" alt="" />
    </div>
    <div class="bar__menu">
      <router-link
        v-for="item in mainWindowRoutes"
        :key="item.path"
        :to="item.path"
        :class="['bar__menu-item', { 'bar__menu-item--selected': item.isSelected }]"
      >
        <i :class="['icon', item.isSelected ? item.iconSelected : item.icon]"></i>
      </router-link>
    </div>
    <div class="bar__menu bar__menu--setting">
      <div class="bar__menu-item" @click="openSettingWindow">
        <i class="icon icon-setting"></i>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.bar {
  width: 54px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: var(--color-bg-elevated);
  -webkit-app-region: drag;

  &__icon {
    height: 84px;
    padding-top: 36px;
    box-sizing: border-box;

    img {
      width: 34px;
      height: 34px;
      border-radius: var(--radius-sm);
      margin-left: 10px;
    }
  }

  &__menu {
    flex: 1;
    display: flex;
    flex-direction: column;

    &-item {
      height: 44px;
      line-height: 44px;
      text-align: center;
      padding: 0 12px;
      color: var(--color-text-secondary);
      cursor: pointer;
      -webkit-app-region: no-drag;

      &:hover {
        color: var(--color-hover);
      }

      &--selected {
        color: var(--color-active);

        &:hover {
          color: var(--color-active);
        }
      }

      i {
        font-size: 22px;
      }
    }

    &--setting {
      margin-bottom: 5px;
      flex-grow: 0;
    }
  }
}
</style>
