<script setup lang="ts">
defineOptions({
  name: 'ChatSearch'
})
</script>

<template>
  <div class="chat-search">
    <div class="chat-search__icon">
      <i class="icon icon-sousuo"></i>
    </div>
    <div class="chat-search__input">
      <input type="text" placeholder="搜索" />
    </div>
    <div class="chat-search__btn">+</div>
  </div>
</template>

<style scoped lang="scss">
.chat-search {
  display: flex;
  background-color: var(--color-panel);
  height: 54px;
  -webkit-app-region: drag;
  box-sizing: border-box;
  padding: 22px var(--space-sm) 0;
  position: relative;
  border-right: 1px solid rgb(214, 214, 214);

  &__icon {
    position: absolute;
    left: 13px;
    top: 24px;
    width: 23px;
    text-align: center;
    color: var(--color-text-muted);

    i {
      font-size: 10px;
    }
  }

  &__input {
    -webkit-app-region: no-drag;
    flex: 1;
    margin-right: 8px;
    height: 23px;
    line-height: 22px;
    background: var(--color-panel);
    box-sizing: border-box;
    overflow: hidden;
    border: 1px solid var(--color-border);
    border-radius: 3px;
    outline: none;
    padding-left: 23px;
    font-size: 12px;
    padding-right: 6px;

    input:focus {
      background: #fff;
    }
  }

  &__btn {
    -webkit-app-region: no-drag;
    width: 24px;
    height: 23px;
    background: var(--color-panel);
    font-size: 18px;
    text-align: center;
    line-height: 22px;
    border-radius: 3px;
    color: var(--color-text-secondary);
    cursor: pointer;
    box-sizing: border-box;

    &:hover {
      background: var(--color-hover);
    }
  }
}
</style>
