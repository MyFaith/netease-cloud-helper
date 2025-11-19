<template>
  <div class="cloud" v-if="!userStore.cookie">
    <n-alert type="info" title="提示">请先登录以查看您的云盘文件</n-alert>
  </div>
  <div v-else class="cloud">
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
      <div class="action-buttons">
        <n-button type="primary" @click="openUpload" circle size="small" class="action-btn" secondary>
          <template #icon>
            <n-icon :component="UploadIcon" />
          </template>
        </n-button>
        <n-button type="primary" @click="getData" circle size="small" class="refresh-btn" secondary>
          <template #icon>
            <n-icon :component="RefreshIcon" />
          </template>
        </n-button>
      </div>
    </div>
    <n-data-table :columns="table.columns" :data="table.dataList" :loading="table.loading" striped :bordered="false" :single-line="false" />
  </div>
  <MatchCloud ref="matchCloud" :row="rowData" />
  <Upload ref="uploadModal" :only-upload="true" @close="getData" />
</template>

<script setup>
import * as cloudApi from "@/api/cloud";
import { h, onMounted, reactive, ref } from "vue";
import { getMebibyteStr, formatDate } from "@/utils";
import { NButton, NSpace, useDialog, useMessage } from "naive-ui";
import MatchCloud from "@/components/match/cloud.vue";
import Upload from "@/components/upload.vue";
import { useUserStore } from "@/stores/user";
import { RefreshOutline as RefreshIcon, CloudUploadOutline as UploadIcon } from "@vicons/ionicons5";

const message = useMessage();
const dialog = useDialog();
const userStore = useUserStore();

// 弹窗数据
const rowData = ref({});
const matchCloud = ref(null);
const uploadModal = ref(null);

// 匹配歌曲信息
function openUpload() {
  uploadModal.value.openModal();
}

// 匹配歌曲信息
function match(row) {
  rowData.value = row;
  matchCloud.value.openModal();
}

// 删除
function remove(row) {
  dialog.error({
    title: "删除",
    content: "确定删除吗？",
    positiveText: "确定",
    negativeText: "取消",
    onPositiveClick: async () => {
      const result = await cloudApi.remove(row.songId);
      if (result.code === 200) {
        message.success("删除成功!");
        getData();
      } else {
        message.error("删除失败!");
      }
    }
  });
}

// 获取歌手名称
function getArtistName(row) {
  // 检查simpleSong是否存在
  if (!row.simpleSong) {
    return row.artist || "未知歌手";
  }

  // 检查ar字段是否存在
  const artist = row.simpleSong.ar;
  if (!artist || !Array.isArray(artist) || artist.length === 0) {
    return row.artist || "未知歌手";
  }

  // 过滤掉空值并拼接歌手名
  const artistNames = artist.filter((item) => item && item.name).map((item) => item.name);

  return artistNames.length > 0 ? artistNames.join("/") : row.artist || "未知歌手";
}

// 表格配置
const table = reactive({
  loading: false,
  dataList: [],
  columns: [
    {
      title: "云盘ID",
      key: "songId",
      width: 120
    },
    {
      title: "歌曲名",
      key: "simpleSong.name",
      minWidth: 200,
      ellipsis: {
        tooltip: true
      },
      render: (row) => {
        // 安全地获取歌曲名称
        if (row.simpleSong && row.simpleSong.name) {
          return row.simpleSong.name;
        }
        return row.songName || "未知歌曲";
      }
    },
    {
      title: "歌手",
      key: "artist",
      width: 120,
      ellipsis: {
        tooltip: true
      },
      render: (row) => getArtistName(row)
    },
    {
      title: "专辑",
      key: "simpleSong.al.name",
      width: 250,
      ellipsis: {
        tooltip: true
      },
      render: (row) => {
        // 安全地获取专辑名称
        if (row.simpleSong && row.simpleSong.al && row.simpleSong.al.name) {
          return row.simpleSong.al.name;
        }
        return "未知专辑";
      }
    },
    {
      title: "文件名",
      key: "fileName",
      width: 350,
      ellipsis: {
        tooltip: true
      }
    },
    {
      title: "文件大小",
      key: "fileSize",
      width: 100,
      render: (row) => getMebibyteStr(row.fileSize)
    },
    {
      title: "比特率",
      key: "bitrate",
      width: 90,
      render: (row) => `${row.bitrate}kbps`
    },
    {
      title: "上传时间",
      key: "addTime",
      width: 200,
      render: (row) => formatDate(row.addTime)
    },
    {
      title: "操作",
      width: 120,
      render: (row) =>
        h(NSpace, { size: "small" }, {
          default: () => [
            h(
              NButton,
              {
                size: "tiny",
                type: "warning",
                onClick: () => match(row)
              },
              { default: () => "匹配" }
            ),
            h(
              NButton,
              {
                size: "tiny",
                type: "error",
                onClick: () => remove(row)
              },
              { default: () => "删除" }
            )
          ]
        })
    }
  ]
});

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 100,
  itemCount: 0
});

// 翻页
function changePage(page) {
  pagination.page = page;
  getData();
}

// 修改分页大小
function changePageSize(pageSize) {
  pagination.pageSize = pageSize;
  getData();
}

// 获取数据
async function getData() {
  table.loading = true;
  const result = await cloudApi.getList(pagination.page, pagination.pageSize);
  pagination.itemCount = result.count;
  table.dataList = result.data;
  table.loading = false;
}

onMounted(getData);
</script>

<style lang="scss" scoped>
.cloud {
  padding: 20px;
  height: calc(100vh - 100px);
  overflow: hidden;

  .pagination-header {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 16px;

    .action-buttons {
      display: flex;
      gap: 12px;
      margin-left: auto;
    }

    .action-btn {
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
    }
  }

  // 表格列宽优化
  :deep(.n-data-table-th) {
    padding: 8px 12px !important;
    font-weight: 600;
    color: #333;
  }

  :deep(.n-data-table-td) {
    padding: 8px 12px !important;
  }

  // 歌手列特殊处理
  :deep(.n-data-table-td[data-col-key="artist"]) {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  // 歌曲名列特殊处理
  :deep(.n-data-table-td[data-col-key="simpleSong.name"]) {
    max-width: 200px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>

<style lang="scss">
.cloud .n-data-table-wrapper {
  height: calc(100vh - 130px) !important;
  overflow-y: auto !important;
}
</style>
