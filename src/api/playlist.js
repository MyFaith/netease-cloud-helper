import http from "@/utils/http";

/**
 * 获取用户歌单
 * @param {*} page 当前页数
 * @param {*} limit 分页大小
 */
export function getList(uid, page = 1, limit = 30) {
  return http.get("/user/playlist", {
    params: {
      uid,
      limit,
      offset: (page - 1) * limit
    }
  });
}

/**
 * 获取歌单内所以歌曲
 * @param {*} page 当前页数
 * @param {*} limit 分页大小
 */
export function getSongList(id, page = 1, limit = 30) {
  return http.get("/playlist/track/all", {
    params: {
      id,
      limit,
      offset: (page - 1) * limit
    }
  });
}
