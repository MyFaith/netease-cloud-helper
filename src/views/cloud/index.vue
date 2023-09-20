<template>
  <div class="cloud">
    <n-space justify="end">
      <n-button type="primary" @click="openUpload">上传</n-button>
      <n-button type="primary" @click="getData">刷新</n-button>
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
        :on-update:page-size="changePageSize"
      />
    </div>
  </div>
  <MatchByName ref="matchByName" :row="rowData" />
  <UPload ref="uploadModal" :only-upload="true" :row="rowData" />
</template>

<script setup>
import * as cloudApi from "@/api/cloud";
import { h, onMounted, reactive, ref } from "vue";
import { getMebibyteStr, formatDate } from "@/utils";
import { NButton, NSpace, useDialog, useMessage } from "naive-ui";
import MatchByName from "@/components/match/name.vue";
import UPload from "@/components/match/upload.vue";

const message = useMessage();
const dialog = useDialog();

// 弹窗数据
const rowData = ref({});
const matchByName = ref(null);
const uploadModal = ref(null);

// 匹配歌曲信息
function openUpload(row) {
  rowData.value = row;
  uploadModal.value.openModal();
}

// 匹配歌曲信息
function match(row) {
  rowData.value = row;
  matchByName.value.openModal();
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
  const artist = row.simpleSong.ar;
  if (artist.length > 0) return artist.map((item) => item.name).join("/");
  return row.artist;
}

// 表格配置
const table = reactive({
  loading: false,
  dataList: [],
  columns: [
    {
      title: "ID",
      key: "songId",
      width: 120
    },
    {
      title: "歌曲名",
      key: "simpleSong.name"
    },
    {
      title: "歌手",
      key: "artist",
      render: (row) => getArtistName(row)
    },
    {
      title: "专辑",
      key: "simpleSong.al.name"
    },
    {
      title: "文件名",
      key: "fileName"
    },
    {
      title: "文件大小",
      key: "fileSize",
      width: 120,
      render: (row) => getMebibyteStr(row.fileSize)
    },
    {
      title: "比特率",
      key: "bitrate",
      width: 140,
      render: (row) => `${row.bitrate}kbps`
    },
    {
      title: "上传时间",
      key: "addTime",
      width: 120,
      render: (row) => formatDate(row.addTime)
    },
    {
      title: "操作",
      render: (row) =>
        h(NSpace, null, {
          default: () => [
            h(
              NButton,
              {
                size: "small",
                type: "warning",
                onClick: () => match(row)
              },
              { default: () => "匹配" }
            ),
            h(
              NButton,
              {
                size: "small",
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
  pageSize: 10,
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

<style lang="scss">
.cloud {
  padding: 10px;

  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
}
</style>
