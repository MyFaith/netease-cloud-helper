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
        <n-icon :component="MusicNoteIcon" color="#335eea" size="24" />
        <span class="modal-title">网易云音乐登录</span>
      </div>
    </template>

    <div class="login-content">
      <!-- 登录方式选择 -->
      <n-tabs v-model:value="loginType" type="segment" class="login-tabs">
        <n-tab-pane name="qrcode" tab="二维码登录"></n-tab-pane>
        <n-tab-pane name="password" tab="密码登录"></n-tab-pane>
        <n-tab-pane name="cookie" tab="Cookie登录"></n-tab-pane>
      </n-tabs>

      <!-- 二维码登录 -->
      <div v-if="loginType === 'qrcode'" class="login-panel">
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

      <!-- 密码登录 -->
      <div v-if="loginType === 'password'" class="login-panel">
        <n-form ref="passwordFormRef" :model="passwordForm" :rules="passwordRules" class="password-form">
          <n-form-item path="account" label="手机号/邮箱">
            <n-input
              v-model:value="passwordForm.account"
              placeholder="请输入手机号或邮箱"
              clearable
            />
          </n-form-item>
          <n-form-item path="password" label="密码">
            <n-input
              v-model:value="passwordForm.password"
              type="password"
              placeholder="请输入密码"
              show-password-on="click"
              clearable
            />
          </n-form-item>
          <n-form-item>
            <n-button
              type="primary"
              @click="handlePasswordLogin"
              :loading="passwordLoading"
              :disabled="!passwordForm.account || !passwordForm.password"
              block
            >
              登录
            </n-button>
          </n-form-item>
        </n-form>
      </div>

      <!-- Cookie登录 -->
      <div v-if="loginType === 'cookie'" class="login-panel">
        <n-form ref="cookieFormRef" :model="cookieForm" :rules="cookieRules" class="cookie-form">
          <n-form-item path="cookie" label="Cookie">
            <n-input
              v-model:value="cookieForm.cookie"
              type="textarea"
              placeholder="请输入网易云音乐Cookie"
              :rows="4"
              clearable
            />
          </n-form-item>
          <n-form-item>
            <n-button
              type="primary"
              @click="handleCookieLogin"
              :loading="cookieLoading"
              :disabled="!cookieForm.cookie"
              block
            >
              登录
            </n-button>
          </n-form-item>
        </n-form>
        <n-text depth="3" class="cookie-tip">
          Cookie获取方法：浏览器登录网易云音乐后，打开开发者工具(F12)，在Application/Storage中找到Cookie，复制完整的Cookie字符串（包含MUSIC_U等关键字段）
        </n-text>
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
import { reactive, ref, watch } from "vue";
import * as userApi from "@/api/user";
import { useUserStore } from "@/stores/user";
import { useMessage } from "naive-ui";
import { MusicalNote as MusicNoteIcon } from "@vicons/ionicons5";

const userStore = useUserStore();
const message = useMessage();

// 登录类型
const loginType = ref("qrcode");

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

// 密码登录表单
const passwordFormRef = ref();
const passwordLoading = ref(false);
const passwordForm = reactive({
  account: "",
  password: ""
});

// 密码登录验证规则
const passwordRules = {
  account: [
    { required: true, message: "请输入手机号或邮箱", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, message: "密码长度至少6位", trigger: "blur" }
  ]
};

// Cookie登录表单
const cookieFormRef = ref();
const cookieLoading = ref(false);
const cookieForm = reactive({
  cookie: ""
});

// Cookie登录验证规则
const cookieRules = {
  cookie: [
    { required: true, message: "请输入Cookie", trigger: "blur" }
  ]
};

// 处理密码登录
async function handlePasswordLogin() {
  try {
    await passwordFormRef.value.validate();
    passwordLoading.value = true;

    const isPhone = /^1[3-9]\d{9}$/.test(passwordForm.account);
    let result;

    if (isPhone) {
      result = await userApi.loginCellphone(passwordForm.account, passwordForm.password);
    } else {
      result = await userApi.loginEmail(passwordForm.account, passwordForm.password);
    }

    if (result.code === 200) {
      message.success("登录成功");
      // 保存cookie，获取用户信息
      userStore.cookie = result.cookie;
      const { account, profile } = await userApi.getInfo();
      userStore.account = account;
      userStore.profile = profile;
      // 关闭弹窗
      setTimeout(() => {
        userStore.showLogin = false;
      }, 1000);
    } else if (result.code === -460) {
      // 网络环境风险检测
      message.error(result.message || "检测到您的网络环境存在风险，请稍后再试");
      // 可以建议用户尝试其他登录方式
      setTimeout(() => {
        message.info("提示：您可以尝试使用二维码登录或Cookie登录");
      }, 2000);
    } else if (result.code === 502) {
      // 账号或密码错误
      message.error("账号或密码错误，请检查后重试");
    } else if (result.code === 509) {
      // 密码错误次数过多
      message.error("密码错误次数过多，请稍后再试");
    } else if (result.code === 405) {
      // 手机号格式错误
      message.error("手机号格式错误，请检查手机号是否正确");
    } else if (result.code === 501) {
      // 账号不存在
      message.error("该账号不存在，请检查手机号/邮箱是否正确");
    } else if (result.code === 506) {
      // 需要验证码
      message.error("需要验证码，请使用二维码登录或稍后再试");
    } else if (result.code === -1) {
      // 系统错误
      message.error("系统繁忙，请稍后再试");
    } else {
      // 其他错误，显示具体的错误信息
      message.error(result.message || `登录失败（错误码：${result.code}），请检查账号密码或稍后再试`);
    }
  } catch (error) {
    console.error("密码登录失败:", error);
    if (error.response) {
      // 服务器返回了错误响应
      const status = error.response.status;
      const data = error.response.data;

      if (status === 429) {
        message.error("请求过于频繁，请稍后再试");
      } else if (status === 503) {
        message.error("服务器维护中，请稍后再试");
      } else if (data && data.message) {
        message.error(data.message);
      } else if (data && data.code) {
        message.error(`登录失败（错误码：${data.code}）`);
      } else {
        message.error("网络错误，请检查网络连接后重试");
      }
    } else if (error.request) {
      // 请求发出但没有收到响应
      message.error("网络连接超时，请检查网络后重试");
    } else {
      // 其他错误
      message.error("登录失败，请重试");
    }
  } finally {
    passwordLoading.value = false;
  }
}

// 处理Cookie登录
async function handleCookieLogin() {
  try {
    await cookieFormRef.value.validate();
    cookieLoading.value = true;

    // 先设置cookie到userStore，然后调用getInfo获取用户信息
    userStore.cookie = cookieForm.cookie;

    // 调用获取用户信息接口验证cookie有效性
    const result = await userApi.getInfo();

    if (result.code === 200 && result.profile && result.profile.userId) {
      message.success("Cookie登录成功");
      // 保存用户信息
      userStore.account = result.account;
      userStore.profile = result.profile;
      // 关闭弹窗
      setTimeout(() => {
        userStore.showLogin = false;
      }, 1000);
    } else {
      // 清空无效的cookie
      userStore.cookie = "";
      message.error("Cookie无效或已过期，请重新获取");
    }
  } catch (error) {
    // 清空无效的cookie
    userStore.cookie = "";
    console.error("Cookie登录失败:", error);
    if (error.response && error.response.status === 401) {
      message.error("Cookie无效或已过期，请重新获取");
    } else {
      message.error("登录失败，请检查Cookie格式是否正确");
    }
  } finally {
    cookieLoading.value = false;
  }
}

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
  // 只有在二维码登录模式下才初始化二维码
  if (loginType.value === 'qrcode') {
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
}

// 监听登录类型切换
watch(loginType, (newType, oldType) => {
  if (oldType === 'qrcode' && newType !== 'qrcode') {
    // 从二维码登录切换到其他登录方式，停止二维码相关操作
    clearInterval(timer);
    loginInfo.loading = false;
    loginInfo.key = "";
    loginInfo.qrcode = "";
    loginInfo.status = 801;
    loginInfo.nickname = "";
  }
  if (newType === 'qrcode' && oldType !== 'qrcode') {
    // 切换到二维码登录，重新初始化二维码
    handleInit();
  }
});

// 关闭弹窗事件
function handleClose() {
  // 关闭计时器，清空二维码等操作
  clearInterval(timer);
  // 重置二维码状态
  loginInfo.loading = false;
  loginInfo.key = "";
  loginInfo.qrcode = "";
  loginInfo.status = 801;
  loginInfo.nickname = "";
  // 重置表单
  passwordForm.account = "";
  passwordForm.password = "";
  cookieForm.cookie = "";
  passwordLoading.value = false;
  cookieLoading.value = false;
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
    gap: 20px;

    .login-tabs {
      margin-bottom: 16px;
    }

    .login-panel {
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }

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

    .password-form,
    .cookie-form {
      width: 100%;
      max-width: 300px;
    }

    .cookie-tip {
      font-size: 12px;
      line-height: 1.5;
      text-align: center;
      margin-top: 8px;
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
