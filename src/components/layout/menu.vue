<template>
  <div class="menu-list">
    <RouterLink v-for="(item, i) in menuList" :key="i" class="menu-item" :to="item.to">{{ item.text }}</RouterLink>
  </div>
</template>

<script setup>
import { RouterLink } from "vue-router";

const menuList = [
  {
    text: "首页",
    to: "/"
  },
  {
    text: "歌单",
    to: "/playlist"
  },
  {
    text: "云盘",
    to: "/cloud"
  }
];
</script>

<style lang="scss">
.menu-list {
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--color-border);
  height: 100vh;
  overflow: hidden;
  .menu-item {
    padding: 10px 0;
    color: var(--color-text);
    font-size: 18px;
    text-align: center;
    text-decoration: none;
    &.router-link-active {
      color: var(--color-primary);
      font-weight: bold;
    }
    &:hover {
      background: var(--color-background-light);
    }
  }
}
</style>
