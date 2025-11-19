import http from "@/utils/http";

/**
 * 获取二维码key
 */
export function getKey() {
  return http.get("/login/qr/key");
}

/**
 * 创建二维码
 * @param {*} key
 */
export function createQrcode(key) {
  return http.get("/login/qr/create", {
    params: {
      key,
      qrimg: true
    }
  });
}

/**
 * 根据key获取扫码状态
 * @param {*} key
 */
export function getKeyStatus(key) {
  return http.get("/login/qr/check", {
    params: {
      key
    }
  });
}

/**
 * 获取用户信息
 * @param {*} key
 */
export function getInfo() {
  return http.get("/user/account");
}

/**
 * 获取用户详情
 * @param {*} userId
 */
export function getUserDetail(userId) {
  return http.get("/user/detail", {
    params: {
      uid: userId
    }
  });
}

/**
 * 获取最近播放
 */
export function getRecentPlays() {
  return http.get("/record/recent/song", {
    params: {
      limit: 5
    }
  });
}

/**
 * 手机号登录
 * @param {*} phone 手机号
 * @param {*} password 密码
 */
export function loginCellphone(phone, password) {
  return http.get("/login/cellphone", {
    params: {
      phone,
      password
    }
  });
}

/**
 * 邮箱登录
 * @param {*} email 邮箱
 * @param {*} password 密码
 */
export function loginEmail(email, password) {
  return http.get("/login", {
    params: {
      email,
      password
    }
  });
}

/**
 * 使用cookie登录
 * @param {*} cookie cookie字符串
 */
export function loginWithCookie(cookie) {
  return http.get("/user/account", {
    params: {
      cookie
    }
  });
}
