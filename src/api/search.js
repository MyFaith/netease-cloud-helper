import http from "@/utils/http";

/**
 * 搜索
 * @param {*} page 当前页数
 * @param {*} limit 分页大小
 */
export function search(keywords, page = 1, limit = 30) {
  return http.get("/search", {
    params: {
      keywords,
      limit,
      offset: (page - 1) * limit
    }
  });
}

/**
 * 搜索(更全)
 * @param {*} limit 分页大小
 */
export function cloudSearch(keywords, limit = 30) {
  return http.get("/cloudsearch", {
    params: {
      keywords,
      limit
    }
  });
}
