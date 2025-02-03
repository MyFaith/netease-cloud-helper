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
 * 获取最近播放
 */
export function getRecentPlays() {
  return http.get("/record/recent/song", {
    params: {
      limit: 5
    }
  });
}
