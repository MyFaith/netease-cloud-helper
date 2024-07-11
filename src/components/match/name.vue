<!-- 云盘文件-根据ID或手动搜索，匹配歌曲信息 -->
<template>
  <n-modal v-model:show="showModal" :on-after-leave="afterClose" preset="dialog" title="匹配歌曲信息" class="modal" style="width: 1200px">
    <n-form label-placement="left" label-width="100px" class="form">
      <n-form-item label="云盘ID:">
        <span>{{ props.row.songId }}</span>
      </n-form-item>
      <n-form-item label="文件名:">
        <span>{{ props.row.fileName }}</span>
      </n-form-item>
      <n-form-item label="上传时间:">
        <span>{{ formatDate(props.row.addTime) }}</span>
      </n-form-item>
      <n-form-item label="输入歌曲ID:">
        <n-input v-model:value="form.asid" type="text" placeholder="搜索歌曲名称或直接输入ID"></n-input>
      </n-form-item>
      <n-form-item label="搜索歌曲:">
        <n-input-group>
          <n-input v-model:value="form.keyword" placeholder="请输入歌曲关键字" clearable />
          <n-button @click="handleSearch" type="primary" ghost :loading="table.loading">搜索</n-button>
        </n-input-group>
      </n-form-item>
      <n-form-item label="搜索结果：" v-if="table.dataList.length > 0">
        <div class="search-result">
          <n-pagination
            v-model:page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :item-count="pagination.itemCount"
            show-size-picker
            :page-sizes="[30, 50, 100]"
            :on-update:page="changePage"
            :on-update:page-size="changePageSize"
          />
          <br />
          <n-data-table
            v-model:checked-row-keys="table.checkedRowKeys"
            :row-key="(row) => row.id"
            :columns="table.columns"
            :data="table.dataList"
            :loading="table.loading"
            @update:checked-row-keys="setId"
            striped
          />
          <br />
          <n-pagination
            v-model:page="pagination.page"
            v-model:page-size="pagination.pageSize"
            :item-count="pagination.itemCount"
            show-size-picker
            :page-sizes="[30, 50, 100]"
            :on-update:page="changePage"
            :on-update:page-size="changePageSize"
          />
        </div>
      </n-form-item>
      <n-form-item label=" ">
        <n-button type="primary" @click="handleMatch" :loading="btnLoading">确认</n-button>
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<script setup>
import { useUserStore } from "@/stores/user";
import { formatDate } from "@/utils";
import { h, reactive, ref } from "vue";
import * as cloudApi from "@/api/cloud";
import * as searchApi from "@/api/search";
import { useMessage, NImage } from "naive-ui";

const props = defineProps(["row"]);
const emits = defineEmits(["close"]);
defineExpose({ openModal });

const userStore = useUserStore();
const message = useMessage();
const showModal = ref(false);

// 表单
const form = reactive({
  keyword: "",
  uid: userStore.account.id,
  sid: "",
  asid: ""
});

const btnLoading = ref(false);

// 匹配歌曲
async function handleMatch() {
  btnLoading.value = true;
  form.sid = props.row.songId;
  const result = await cloudApi.match(form.uid, form.sid, form.asid);
  if (result.data) {
    message.success("匹配成功!");
    showModal.value = false;
  } else {
    message.error("匹配失败!");
  }
  btnLoading.value = false;
}

// 表格配置
const table = reactive({
  loading: false,
  checkedRowKeys: [],
  dataList: [],
  columns: [
    {
      type: "selection",
      multiple: false
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
      key: "album.name"
    },
    {
      title: "发布时间",
      key: "album.publishTime",
      width: 120,
      render: (row) => formatDate(row.album.publishTime)
    }
  ]
});

// 选中搜索结果
function setId(rowKeys) {
  form.asid = rowKeys[0];
}

// 获取歌手名称
function getArtistName(row) {
  const artist = row.artists;
  if (artist.length > 0) return artist.map((item) => item.name).join("/");
  return row.name;
}

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 30,
  itemCount: 0
});

// 翻页
function changePage(page) {
  pagination.page = page;
  handleSearch();
}

// 修改分页大小
function changePageSize(pageSize) {
  pagination.pageSize = pageSize;
  handleSearch();
}

// 搜索歌曲
async function handleSearch() {
  table.loading = true;
  const { result } = await searchApi.search(form.keyword, pagination.page, pagination.pageSize);
  pagination.itemCount = result.songCount;
  table.dataList = result.songs;
  table.loading = false;
}

// 打开弹窗
function openModal() {
  showModal.value = true;
}

// 关闭弹窗
function afterClose() {
  form.asid = "";
  form.sid = "";
  form.uid = "";
}
</script>

<style lang="scss" scoped>
.modal {
  .form {
    margin-top: 28px;
  }
  .search-result {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }
}
</style>
