<!-- 歌单-上传文件并匹配 -->
<template>
  <n-modal v-model:show="showModal" :on-after-leave="afterClose" preset="dialog" title="上传音乐" class="modal" style="width: 600px">
    <n-card>
      <n-space vertical>
        <n-alert type="info" :bordered="false">
          支持上传 MP3、FLAC 等音频格式，文件大小不超过 300MB
        </n-alert>

        <n-upload
          :max="1"
          :on-before-upload="beforeUpload"
          :on-finish="handleFinish"
          :on-error="handleError"
          :on-change="handleChange"
          :show-file-list="true"
          :file-list="fileList"
          :disabled="uploadProgress.percentage > 0"
        >
          <n-upload-dragger>
            <div style="margin-bottom: 12px">
              <n-icon size="48" :depth="3">
                <ArchiveIcon />
              </n-icon>
            </div>
            <n-text style="font-size: 16px">
              点击或拖动文件到此处上传
            </n-text>
            <n-p depth="3" style="margin: 8px 0 0 0">
              支持单个文件上传
            </n-p>
          </n-upload-dragger>
        </n-upload>

        <n-progress
          v-if="uploadProgress.percentage > 0"
          type="line"
          :percentage="uploadProgress.percentage"
          :status="uploadProgress.status"
          :indicator-placement="'inside'"
          :height="24"
          style="margin-top: 16px"
        >
          <span v-if="uploadProgress.status === 'info'">
            上传中... {{ uploadProgress.percentage }}%
          </span>
          <span v-else-if="uploadProgress.status === 'success'">
            上传成功
          </span>
          <span v-else>
            上传失败
          </span>
        </n-progress>
      </n-space>
    </n-card>
  </n-modal>
</template>

<script setup>
import { ref, reactive } from "vue";
import { useMessage } from "naive-ui";
import * as cloudApi from "@/api/cloud";
import { ArchiveOutline as ArchiveIcon } from "@vicons/ionicons5";

const props = defineProps(["row", "onlyUpload"]);
const emits = defineEmits(["close"]);
defineExpose({ openModal });

const message = useMessage();
const showModal = ref(false);
const fileList = ref([]);
const uploadProgress = reactive({
  percentage: 0,
  status: "info"
});

// 打开弹窗
function openModal() {
  showModal.value = true;
  fileList.value = [];
  uploadProgress.percentage = 0;
  uploadProgress.status = "info";
}

// 关闭弹窗后刷新
function afterClose() {
  emits("close");
}

// 上传前校验
function beforeUpload({ file }) {
  if (file.file.size > 300 * 1024 * 1024) {
    message.error("文件大小不能超过300MB");
    return false;
  }
  return true;
}

// 处理文件上传
async function handleUpload(file) {
  try {
    const result = await cloudApi.upload(file.file, (progressEvent) => {
      uploadProgress.percentage = Math.round((progressEvent.loaded * 100) / progressEvent.total);
    });
    
    if (result.code === 200) {
      uploadProgress.status = "success";
      message.success(`${file.name} 上传成功!`);
      setTimeout(() => {
        showModal.value = false;
      }, 1500);
    } else {
      uploadProgress.status = "error";
      message.error(`${file.name} 上传失败!`);
    }
  } catch (err) {
    uploadProgress.status = "error";
    message.error(`${file.name} 上传失败: ${err.message}`);
  }
}

// 文件变化时触发
function handleChange({ file }) {
  fileList.value = [file];
  handleUpload(file);
}

// 上传完成
function handleFinish() {
  message.success("文件上传完成");
  showModal.value = false;
}

// 上传错误
function handleError() {
  message.error("上传出错，请重试");
}
</script>

<style lang="scss" scoped>
.modal {
  width: 600px;

  .n-card {
    border-radius: 8px;
  }

  .n-upload-dragger {
    padding: 24px;
    border-radius: 8px;
    background-color: var(--color-backgrund-light);
    transition: background-color 0.3s ease;

    &:hover {
      background-color: var(--color-border);
    }
  }

  .n-progress {
    margin-top: 16px;
  }
}
</style>
