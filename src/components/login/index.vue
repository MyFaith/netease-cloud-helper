<template>
  <n-modal v-model:show="userStore.showLogin" :on-after-enter="handleInit" :on-after-leave="handleClose" preset="dialog" title="登录">
    <div class="login">
      <n-spin :show="loginInfo.loading">
        <img :src="loginInfo.qrcode" />
      </n-spin>
      <div class="status">
        <n-tag v-if="loginInfo.status === 800" type="error">二维码过期，请重新登录</n-tag>
        <n-tag v-if="loginInfo.status === 801">请使用网易云音乐APP扫码</n-tag>
        <n-tag v-if="loginInfo.status === 802" type="warning">{{ loginInfo.nickname }} 已扫码，等待确认</n-tag>
        <n-tag v-if="loginInfo.status === 803" type="success">登录成功，请稍后...</n-tag>
      </div>
    </div>
  </n-modal>
</template>

<script setup>
import { reactive } from "vue";
import * as userApi from "@/api/user";
import { useUserStore } from "@/stores/user";

const userStore = useUserStore();

// 轮询
let timer = null;

// 登录信息
const loginInfo = reactive({
  loading: false,
  key: "",
  qrcode: "",
  status: 801,
  nickname: ""
});

// 检查扫码状态
async function checkStatus() {
  const { code, nickname, cookie } = await userApi.getKeyStatus(loginInfo.key);
  loginInfo.status = code;
  if (code === 800) {
    // 二维码过期
    clearInterval(timer);
  } else if (code === 802) {
    // 已扫码，保留昵称
    loginInfo.nickname = nickname;
  } else if (code === 803) {
    // 登录成功
    clearInterval(timer);
    // 保存cookie，获取用户信息
    userStore.cookie = cookie;
    const { account, profile } = await userApi.getInfo();
    userStore.account = account;
    userStore.profile = profile;
    // 关闭弹窗，延迟2s
    setTimeout(() => {
      userStore.showLogin = false;
    }, 2000);
  }
}

// 初始化弹窗事件
async function handleInit() {
  // 获取二维码
  loginInfo.loading = true;
  const keyResult = await userApi.getKey();
  loginInfo.key = keyResult.data.unikey;
  const qrResult = await userApi.createQrcode(loginInfo.key);
  loginInfo.qrcode = qrResult.data.qrimg;
  loginInfo.loading = false;
  // 轮询检查扫码状态
  timer = setInterval(checkStatus, 3000);
}

// 关闭弹窗事件
function handleClose() {
  // 关闭计时器，清空二维码等操作
}
</script>

<style lang="scss">
.login {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .status {
    margin-top: 10px;
  }
}
</style>
