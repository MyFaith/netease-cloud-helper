<template>
  <div class="cloud">
    <n-data-table :columns="table.columns" :data="table.dataList" :loading="table.loading" striped />
    <div class="pagination">
      <n-pagination
        v-model:page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :item-count="pagination.itemCount"
        show-size-picker
        :page-sizes="[10, 20, 30]"
        :on-update:page="changePage"
      />
    </div>
  </div>
</template>

<script setup>
import * as cloudApi from "@/api/cloud";
import { h, onMounted, reactive, ref } from "vue";
import { getMebibyteStr, formatDate } from "@/utils";
import { NButton, useDialog, useMessage } from "naive-ui";

const message = useMessage();
const dialog = useDialog();

// 匹配歌曲信息
function match() {}

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
      key: "songName"
    },
    {
      title: "歌手",
      key: "artist"
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
        h("div", { class: "operate" }, [
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
        ])
    }
  ]
});

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 30,
  itemCount: 0
});

// 翻页
function changePage(page) {
  pagination.page = page;
  getData();
}

// 获取数据
async function getData() {
  table.loading = true;
  const result = await cloudApi.getList(pagination.page, pagination.limit);
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
  .operate {
    display: flex;
    gap: 10px;
  }
}
</style>
