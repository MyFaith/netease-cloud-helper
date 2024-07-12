<!-- 歌单-输入云盘id匹配 -->
<template>
  <n-modal v-model:show="showModal" :on-after-leave="afterClose" preset="dialog" title="匹配歌曲信息" class="modal">
    <n-form label-placement="left" label-width="100px" class="form">
      <n-form-item label="云盘文件ID:">
        <n-input v-model:value="form.sid" type="text" placeholder="直接输入云盘ID" clearable></n-input>
      </n-form-item>
      <n-form-item label="选择歌曲:">
        <n-select
          v-model:value="form.sid"
          filterable
          placeholder="搜索歌曲或输入歌曲ID"
          :options="selectOptions.data"
          :loading="selectOptions.loading"
          clearable
          label-field="fileName"
          value-field="songId"
          :clear-filter-after-select="false"
          @scroll="getCloudList(true, $event)"
        />
      </n-form-item>
      <n-form-item label=" ">
        <n-button type="primary" @click="handleMatch" :loading="btnLoading">确认</n-button>
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<script setup>
import { useUserStore } from "@/stores/user";
import { reactive, ref } from "vue";
import * as cloudApi from "@/api/cloud";
import { useMessage } from "naive-ui";

const props = defineProps(["row"]);
const emits = defineEmits(["close"]);
defineExpose({ openModal });

const userStore = useUserStore();
const message = useMessage();
const showModal = ref(false);

// 表单
const form = reactive({
  uid: userStore.account.id,
  sid: "",
  asid: ""
});

const btnLoading = ref(false);

// 选择歌曲配置
const selectOptions = reactive({
  page: 1,
  data: [],
  loading: false
});

// 获取云盘文件列表
async function getCloudList(scrolling = false, e) {
  // 滚动触发判断
  if (scrolling) {
    const currentTarget = e.currentTarget;
    // 判断是否到底部
    if (currentTarget.scrollTop + currentTarget.offsetHeight >= currentTarget.scrollHeight) {
      selectOptions.page++;
    } else {
      return;
    }
  }
  selectOptions.loading = true;
  const { data } = await cloudApi.getList(selectOptions.page);
  selectOptions.data.push(...data);
  selectOptions.loading = false;
}

// 匹配歌曲
async function handleMatch() {
  btnLoading.value = true;
  form.asid = props.row.id;
  const result = await cloudApi.match(form.uid, form.sid, form.asid);
  if (result.data) {
    message.success("匹配成功!");
    showModal.value = false;
  } else {
    message.error("匹配失败!");
  }
  btnLoading.value = false;
}

// 打开弹窗
function openModal() {
  showModal.value = true;
  getCloudList();
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
