import dayjs from "dayjs";

/**
 * 传入bytes计算出MB
 * @param {*} bytes
 */
export function getMebibyteStr(bytes) {
  if (!bytes) return;
  return (+bytes / 1024 / 1024).toFixed(2) + "MB";
}

/**
 * 格式化时间
 * @param {*} str
 */
export function formatDate(str) {
  if (!str) return;
  return dayjs(str).format("YYYY-MM-DD HH:mm:ss");
}
