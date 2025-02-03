<template>
  <n-modal 
    v-model:show="userStore.showLogin" 
    :on-after-enter="handleInit" 
    :on-after-leave="handleClose" 
    preset="dialog"
    :style="{ '--n-width': '360px' }"
    class="custom-login-modal"
  >
    <template #header>
      <div class="modal-header">
        <n-icon :component="MusicNote24Filled" color="#335eea" size="24" />
        <span class="modal-title">网易云音乐登录</span>
      </div>
    </template>

    <div class="login-content">
      <n-spin :show="loginInfo.loading" description="二维码加载中...">
        <div class="qrcode-wrapper">
          <transition name="fade" mode="out-in">
            <img 
              v-if="loginInfo.qrcode" 
              :src="loginInfo.qrcode" 
              class="qrcode-image"
              alt="登录二维码"
            />
            <n-skeleton 
              v-else
              height="240px"
              width="240px"
              :sharp="false"
            />
          </transition>
        </div>
      </n-spin>

      <div class="status-tips">
        <transition name="slide-fade">
          <n-alert 
            v-if="loginInfo.status === 800"
            type="error"
            title="二维码已过期"
            class="status-alert"
          >
            请点击刷新重新获取二维码
          </n-alert>
          
          <n-alert 
            v-else-if="loginInfo.status === 801"
            type="info"
            title="扫码登录"
            class="status-alert"
          >
            打开网易云音乐APP <n-text strong>扫一扫</n-text>
          </n-alert>

          <n-alert 
            v-else-if="loginInfo.status === 802"
            type="warning"
            :title="`欢迎 ${loginInfo.nickname}`"
            class="status-alert"
          >
            扫码成功，请在手机端确认登录
          </n-alert>

          <n-alert 
            v-else-if="loginInfo.status === 803"
            type="success"
            title="登录成功"
            class="status-alert"
          >
            正在跳转，请稍候...
          </n-alert>
        </transition>
      </div>
    </div>

    <template #footer>
      <div class="modal-footer">
        <n-text depth="3" class="tip-text">
          手机端点击「发现」→「扫一扫」
        </n-text>
      </div>
    </template>
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

<style lang="scss" scoped>
.custom-login-modal {
  --n-padding: 24px;
  --n-bezier: cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 12px;
  overflow: hidden;

  .modal-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-bottom: 16px;
    
    .modal-title {
      font-size: 18px;
      font-weight: 600;
      color: #1d2129;
    }
  }

  .login-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;

    .qrcode-wrapper {
      padding: 12px;
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      
      .qrcode-image {
        width: 240px;
        height: 240px;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        transition: transform 0.2s;
        
        &:hover {
          transform: scale(1.02);
        }
      }
    }

    .status-alert {
      width: 100%;
      border-radius: 8px;
      transition: all 0.3s ease;
    }
  }

  .modal-footer {
    padding-top: 16px;
    border-top: 1px solid #f0f0f0;
    text-align: center;
    
    .tip-text {
      font-size: 12px;
    }
  }
}

// 过渡动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
