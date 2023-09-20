<template>
  <div class="playlist">
    <n-select
      v-model:value="playlist.id"
      :on-update:value="getSongs"
      :loading="playlist.loading"
      size="large"
      :options="playlist.options"
      label-field="name"
      value-field="id"
      :render-label="renderLabel"
    />
    <br />
    <n-space justify="end">
      <n-button type="primary" @click="getSongs">刷新</n-button>
    </n-space>
    <br />
    <n-data-table :columns="table.columns" :data="table.dataList" :loading="table.loading" striped />
    <div class="pagination">
      <n-pagination
        v-model:page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :item-count="pagination.itemCount"
        show-size-picker
        :page-sizes="[10, 50, 100, 500, 1000, 3000, 5000, 10000]"
        :on-update:page="changePage"
      />
    </div>
  </div>
  <MatchByUpload ref="matchByUpload" :row="rowData" />
</template>

<script setup>
import * as playlistApi from "@/api/playlist";
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils";
import { NAvatar, NButton, NImage, NSpace } from "naive-ui";
import { h, onMounted, reactive, ref } from "vue";
import MatchByUpload from "@/components/match/upload.vue";

const userStore = useUserStore();

// 弹窗数据
const rowData = ref({});
const matchByUpload = ref(null);

// 上传并匹配歌曲信息
function upload(row) {
  rowData.value = row;
  matchByUpload.value.openModal();
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
      title: "ID",
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
    },
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
                onClick: () => upload(row)
              },
              { default: () => "上传并匹配" }
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
  pageSize: 10,
  itemCount: 0
});

// 翻页
function changePage(page) {
  pagination.page = page;
  getSongs();
}

// 获取歌曲列表
async function getSongs(id) {
  typeof id === "number" ? (playlist.id = id) : (id = playlist.id);
  if (!id) return;

  table.loading = true;
  const result = await playlistApi.getSongList(id, pagination.page, pagination.pageSize);
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
const renderLabel = (option) => {
  return h(
    NSpace,
    { align: "center" },
    {
      default: () => [h(NAvatar, { src: option.coverImgUrl }, { default: () => {} }), h("span", {}, { default: () => option.name })]
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
.playlist {
  padding: 20px;
  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
}
</style>

<style lang="scss">
.n-select .n-avatar {
  margin-top: 6px !important;
}
</style>
