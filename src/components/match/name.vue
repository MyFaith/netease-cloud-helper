<template>
  <n-modal v-model:show="showModal" :on-after-leave="afterClose" preset="dialog" title="匹配歌曲信息" class="modal">
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
      <n-form-item label="搜索歌曲:">
        <n-select
          v-model:value="form.asid"
          filterable
          placeholder="搜索歌曲或输入歌曲ID"
          :options="selectOptions.data"
          :loading="selectOptions.loading"
          clearable
          remote
          value-field="id"
          :clear-filter-after-select="false"
          @search="handleSearch"
        />
      </n-form-item>
      <n-form-item label="输入歌曲ID:">
        <n-input v-model:value="form.asid" type="text" placeholder="搜索歌曲名称或直接输入ID"></n-input>
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
import { reactive, ref } from "vue";
import * as cloudApi from "@/api/cloud";
import * as searchApi from "@/api/search";
import { useMessage } from "naive-ui";

const props = defineProps(["row"]);
const emits = defineEmits(["close"]);
defineExpose({ openModal });

const userStore = useUserStore();
const message = useMessage();
const showModal = ref(false);

// 搜索歌曲配置
const selectOptions = reactive({
  data: [],
  loading: false
});

// 表单
const form = reactive({
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

// 搜索歌曲
async function handleSearch(keywords) {
  selectOptions.loading = true;
  const { result } = await searchApi.search(keywords);
  if (result.songs) {
    result.songs.map((item) => {
      item.asid = `${item.asid}`;
      item.label = `${item.name} - ${item.artists[0].name}, ${item.album.name}`;
    });
  }
  selectOptions.data = result.songs;
  selectOptions.loading = false;
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
  width: 640px;
  .form {
    margin-top: 28px;
  }
}
</style>
