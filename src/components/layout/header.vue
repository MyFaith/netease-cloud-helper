<template>
  <div class="header">
    <div class="title">网易云音乐-云盘匹配工具</div>
    <div class="user">
      <template v-if="userStore.cookie">
        <n-avatar round size="medium" :src="userStore.profile.avatarUrl" />
        <div class="username">{{ userStore.profile.nickname }}</div>
        <a @click="logout" class="logout" href="javascript:;">退出</a>
      </template>
      <a v-else @click="login" class="login" href="javascript:;">点击登录</a>
    </div>
  </div>
  <Login />
</template>

<script setup>
import { useUserStore } from "@/stores/user";
import Login from "@/components/login/index.vue";
import { useDialog, useMessage } from "naive-ui";

const userStore = useUserStore();
const dialog = useDialog();
const message = useMessage();

// 打开页面默认关闭登录弹窗
userStore.showLogin = false;


// 登录
function login() {
  userStore.showLogin = true;
}

// 登出
function logout() {
  dialog.info({
    title: "询问",
    content: "确定退出登录吗？",
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: () => {
      message.success("你已退出登录!");
      window.localStorage.removeItem("user");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  });
}
</script>

<style lang="scss">
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid var(--color-border);

  .title {
    font-size: 22px;
    font-weight: bold;
  }

  .user {
    display: flex;
    align-items: center;
    gap: 10px;

    .login {
      color: var(--color-primary);
    }

    .logout {
      color: var(--color-danger);
    }
  }
}
</style>
