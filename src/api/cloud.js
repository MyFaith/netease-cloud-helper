import http from "@/utils/http";

/**
 * 获取云盘列表
 * @param {*} page 当前页数
 * @param {*} limit 分页大小
 */
export function getList(page = 1, limit = 30) {
  return http.get("/user/cloud", {
    params: {
      limit,
      offset: (page - 1) * limit
    }
  });
}

/**
 * 删除云盘歌曲
 * @param {*} id
 */
export function remove(id) {
  return http.get("/user/cloud/del", {
    params: {
      id
    }
  });
}

/**
 * 获取云盘列表
 * @param {*} uid 用户ID
 * @param {*} sid 云盘的歌曲 id
 * @param {*} asid 要匹配的歌曲 id
 */
export function match(uid, sid, asid) {
  return http.get("/cloud/match", {
    params: {
      uid,
      sid,
      asid
    }
  });
}

/**
 * 云盘上传
 * @param {*} file 文件
 * @param {*} onProgress 进度回调
 */
export function upload(file, onProgress) {
  const formData = new FormData();
  formData.append("songFile", file);
  return http({
    method: "post",
    url: "/cloud",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data"
    },
    onUploadProgress: onProgress
  });
}
