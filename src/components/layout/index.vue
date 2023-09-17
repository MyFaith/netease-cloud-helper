<template>
  <n-layout has-sider>
    <n-layout-sider>
      <Menu />
    </n-layout-sider>
    <n-layout>
      <n-layout-header>
        <Header />
      </n-layout-header>
      <n-layout-content>
        <n-dialog-provider>
          <RouterView />
        </n-dialog-provider>
      </n-layout-content>
      <!-- <n-layout-footer>footer</n-layout-footer> -->
    </n-layout>
  </n-layout>
</template>

<script setup>
import { RouterView } from "vue-router";
import Menu from "./menu.vue";
import Header from "./header.vue";
</script>
