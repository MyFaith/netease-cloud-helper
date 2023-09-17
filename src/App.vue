<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN">
    <n-message-provider>
      <n-dialog-provider>
        <Layout>
          <RouterView />
        </Layout>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup>
import { zhCN, dateZhCN } from "naive-ui";
import { RouterView } from "vue-router";
import Layout from "@/components/layout/index.vue";
</script>
