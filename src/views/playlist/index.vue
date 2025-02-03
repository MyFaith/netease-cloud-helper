<template>
  <div class="playlist" v-if="!userStore.cookie">
    <n-alert type="info" title="提示">
      请先登录以查看您的歌单
    </n-alert>
  </div>
  <div v-else class="playlist-container">
    <n-grid cols="24" x-gap="12">
      <n-gi :span="4">
        <div class="playlist-list">
          <n-scrollbar style="max-height: calc(100vh - 160px)">
            <n-menu v-model:value="playlist.id" :options="playlistMenuOptions" :render-label="renderMenuLabel"
              @update:value="getSongs" />
          </n-scrollbar>
        </div>
      </n-gi>

      <n-gi :span="20">
        <div class="content-box">
          <div class="pagination-header">
            <n-pagination
              v-model:page="pagination.page"
              v-model:page-size="pagination.pageSize"
              :item-count="pagination.itemCount"
              show-size-picker
              :page-sizes="[100, 500, 1000, 3000, 5000, 10000]"
              :on-update:page="changePage"
              :on-update:page-size="changePageSize"
            />
            <n-button
              type="primary"
              @click="getSongs"
              circle
              size="small"
              class="refresh-btn"
            >
              <template #icon>
                <n-icon :component="RefreshIcon" />
              </template>
            </n-button>
          </div>
          <n-data-table :columns="table.columns" :data="table.dataList" :loading="table.loading" striped />
          <div class="pagination">
            <n-pagination v-model:page="pagination.page" v-model:page-size="pagination.pageSize"
              :item-count="pagination.itemCount" show-size-picker :page-sizes="[100, 500, 1000, 3000, 5000, 10000]"
              :on-update:page="changePage" :on-update:page-size="changePageSize" />
          </div>
        </div>
      </n-gi>
    </n-grid>
  </div>
  <MatchPlaylist ref="matchPlaylist" :row="rowData" />
</template>

<script setup>
import * as playlistApi from "@/api/playlist";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils";
import { NAvatar, NButton, NImage, NSpace, NMenu, NScrollbar, NGrid, NGi } from "naive-ui";
import { h, onMounted, reactive, ref, computed } from "vue";
import MatchPlaylist from "@/components/match/playlist.vue";
import { RefreshOutline as RefreshIcon } from '@vicons/ionicons5';

const userStore = useUserStore();

// 弹窗数据
const rowData = ref({});
const matchPlaylist = ref(null);

// 匹配歌曲信息
function match(row) {
  rowData.value = row;
  matchPlaylist.value.openModal();
}

// 来源
function getEnumT(key) {
  const enums = {
    0: "网易云",
    1: "云盘-未匹配",
    2: "云盘-已匹配"
  };
  return enums[key];
}

// 权益
function getEnumFee(key) {
  const enums = {
    0: "免费或无版权",
    1: "VIP",
    4: "购买专辑",
    8: "免费低音质,VIP高音质"
  };
  return enums[key];
}

// 类型
function getEnumOriginCoverType(key) {
  const enums = {
    0: "未知",
    1: "原曲",
    2: "翻唱"
  };
  return enums[key];
}

// 判断是否无版权
function isBlocked(song) {
  if (song.subp != 0 || song.realPayed === 1) {
    return false;
  }
  if (song.pc) {
    return false;
  }
  return true;
}

// 表格配置
const table = reactive({
  loading: false,
  dataList: [],
  columns: [
    {
      title: "专辑封面",
      key: "al.picUrl",
      width: 160,
      render: (row) => h(NImage, { src: row.al.picUrl, width: 100 })
    },
    {
      title: "歌曲ID",
      key: "id",
      width: 120
    },
    {
      title: "歌曲名",
      key: "name"
    },
    {
      title: "歌手",
      key: "artist",
      render: (row) => getArtistName(row)
    },
    {
      title: "专辑",
      key: "al.name"
    },
    {
      title: "版权",
      key: "isBlocked",
      width: 100,
      render: (row) =>
        !isBlocked(row.privileges)
          ? "正常"
          : h(
            "font",
            { color: "red" },
            {
              default: () => "无版权"
            }
          )
    },
    /* {
      title: "来源",
      key: "t",
      width: 120,
      render: (row) => getEnumT(row.t)
    },
    {
      title: "权益",
      key: "fee",
      width: 180,
      render: (row) => getEnumFee(row.fee)
    },
    {
      title: "类型",
      key: "originCoverType",
      width: 100,
      render: (row) => getEnumOriginCoverType(row.originCoverType)
    }, */
    {
      title: "发布时间",
      key: "addTime",
      width: 120,
      render: (row) => formatDate(row.publishTime)
    },
    {
      title: "操作",
      filterMultiple: false,
      defaultFilterOptionValues: [1],
      filterOptions: [
        {
          label: "全部",
          value: 1
        },
        {
          label: "无版权歌曲",
          value: -1
        }
      ],
      filter(value, row) {
        const blocked = isBlocked(row.privileges);
        return value === -1 ? blocked : true;
      },
      render: (row) =>
        h(NSpace, null, {
          default: () => [
            h(
              NButton,
              {
                disabled: !isBlocked(row.privileges),
                size: "small",
                type: "warning",
                onClick: () => match(row)
              },
              { default: () => "匹配云盘文件" }
            )
          ]
        })
    }
  ]
});

// 获取歌手名称
function getArtistName(row) {
  return row.ar.map((item) => item.name).join("/");
}

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 100,
  itemCount: 0
});

// 翻页
function changePage(page) {
  pagination.page = page;
  getSongs();
}

// 修改分页大小
function changePageSize(pageSize) {
  pagination.pageSize = pageSize;
  getSongs();
}

// 获取歌曲列表
async function getSongs(id) {
  // 如果传id了，则用传入的id获取，如果没传，则用select组件的value获取
  typeof id === "number" ? (playlist.id = id) : (id = playlist.id);
  if (!id) return;

  table.loading = true;
  const result = await playlistApi.getSongList(id, pagination.page || 1, pagination.pageSize);
  // 合并歌曲信息和播放权限信息
  result.songs.map((item) => {
    const privileges = result.privileges.find((e) => e.id === item.id);
    item.privileges = privileges;
  });
  table.dataList = result.songs;
  // 从歌单信息中获取总数量
  pagination.itemCount = playlist.options.find((e) => e.id === id).trackCount || 0;
  table.loading = false;
}

// 歌单列表渲染
const playlistMenuOptions = computed(() => {
  return playlist.options.map(item => ({
    label: item.name,
    key: item.id,
    cover: item.coverImgUrl
  }));
});

const renderMenuLabel = (option) => {
  return h(
    NSpace,
    { align: "center", style: { width: '100%' } },
    {
      default: () => [
        h(NAvatar, {
          src: option.cover,
          size: 'small',
          style: { marginRight: '8px' }
        }),
        h('div', { style: { flex: 1 } }, [
          h('div', {
            style: {
              fontSize: '14px',
              lineHeight: '1.4',
            }
          }, option.label)
        ])
      ]
    }
  );
};

// 歌单数据
const playlist = reactive({
  loading: false,
  id: null,
  options: []
});

// 获取数据
async function getData() {
  const uid = userStore.account.id;
  playlist.loading = true;
  const result = await playlistApi.getList(uid, 1, 10000);
  playlist.options = playlist.options.concat(result.playlist);
  playlist.loading = false;
}

onMounted(getData);
</script>

<style lang="scss" scoped>
.playlist-container {
  padding: 20px;
  height: 100vh;
}

.playlist-list {
  background: #fff;
  border-radius: 8px;
  padding: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  :deep(.n-menu-item-content) {
    padding: 10px 12px !important;
    margin: 4px 0;
    border-radius: 6px;
    transition: all 0.3s;
    display: flex;
    align-items: center;

    &:hover {
      background-color: rgba(51, 94, 234, 0.06);
    }

    .n-avatar {
      width: 32px;
      height: 32px;
      margin: 0 8px 0 2px;
      flex-shrink: 0;
    }

    div>div:first-child {
      display: flex;
      align-items: center;
      height: 100%;
      font-size: 14px;
    }
  }

  :deep(.n-menu-item-content--selected) {
    background-color: rgba(51, 94, 234, 0.08);
    font-weight: 500;
  }
}

.content-box {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-left: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;

  .n-data-table {
    flex: 1;
    margin-top: 16px;
  }
}

.pagination {
  margin: 16px 0;
}

.pagination-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;

  .refresh-btn {
    margin-left: 12px;
  }
}
</style>

<style lang="scss">
.n-select .n-avatar {
  margin-top: 6px !important;
}

.n-space {
  flex-flow: row nowrap !important;
  gap: 8px 0px !important;
}
</style>
