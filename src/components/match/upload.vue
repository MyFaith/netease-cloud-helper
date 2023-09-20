<template>
  <n-modal v-model:show="showModal" :on-after-leave="afterClose" preset="dialog" :title="props.onlyUpload ? '上传' : '上传并匹配歌曲信息'" class="modal">
    <n-form label-placement="left" label-width="100px" class="form">
      <n-form-item v-if="!props.onlyUpload" label="歌曲ID:">
        <span>{{ props.row.id }}</span>
      </n-form-item>
      <n-form-item label="云盘文件ID:">
        <span>{{ form.sid || "未上传" }}</span>
      </n-form-item>
      <n-form-item v-if="!props.onlyUpload" label="歌曲名称:">
        <span>{{ props.row.name }}</span>
      </n-form-item>
      <n-form-item v-if="!props.onlyUpload" label="歌手:">
        <span>{{ getArtistName(props.row) }}</span>
      </n-form-item>
      <n-form-item v-if="!props.onlyUpload" label="专辑:">
        <span>{{ props.row.al?.name }}</span>
      </n-form-item>
      <n-upload v-if="!form.sid" :custom-request="handleUpload" directory-dnd :max="1" accept="audio/*" :show-file-list="false">
        <n-upload-dragger>
          <div style="margin-bottom: 12px">
            <n-icon size="48" :depth="3">
              <archive-icon />
            </n-icon>
          </div>
          <n-text style="font-size: 16px">点击或者拖动文件到该区域来上传</n-text>
        </n-upload-dragger>
      </n-upload>
      <br />
      <n-form-item label="">
        <n-button v-if="!props.onlyUpload" block type="primary" @click="handleMatch" :loading="btnLoading">确认</n-button>
        <n-button v-else block type="error" @click="showModal = false" :loading="btnLoading">关闭</n-button>
      </n-form-item>
    </n-form>
  </n-modal>
</template>

<script setup>
import { useUserStore } from "@/stores/user";
import { reactive, ref } from "vue";
import * as cloudApi from "@/api/cloud";
import { useMessage } from "naive-ui";
import { ArchiveOutline as ArchiveIcon } from "@vicons/ionicons5";

const props = defineProps(["row", "onlyUpload"]);
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

// 获取歌手名称
function getArtistName(row) {
  if (!row.ar) return;
  return row.ar.map((item) => item.name).join("/");
}

// 上传文件
async function handleUpload(options) {
  try {
    const result = await cloudApi.upload(options.file.file);
    if (result.code === 200) {
      message.success("上传成功!");
      form.sid = result.privateCloud.songId;
    } else {
      message.error("上传失败，请重试!");
    }
  } catch (err) {
    message.error(`上传失败，${err.message}!`);
  }
}

// 匹配加载状态
const btnLoading = ref(false);

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
  width: 740px;
  .form {
    margin-top: 28px;
  }
}
</style>
