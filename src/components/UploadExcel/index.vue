<template>
  <el-dialog v-model="visible" :title="title" width="450px" append-to-body destroy-on-close @closed="handleClose">
    <el-upload
      ref="uploadRef"
      v-model:file-list="fileList"
      :limit="1"
      accept=".xlsx,.xls"
      :headers="headers"
      :action="uploadAction"
      :disabled="isUploading"
      :on-progress="handleFileUploadProgress"
      :on-success="handleFileSuccess"
      :on-error="handleFileError"
      :auto-upload="false"
      drag
    >
      <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
      <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      <template #tip>
        <div class="el-upload__tip text-center">
          <el-checkbox v-model="updateSupport" true-value="true" false-value="false" />
          是否更新已经存在的数据
        </div>
        <div class="text-center">
          <el-link type="primary" :underline="false" @click="importTemplate">下载模板</el-link>
        </div>
        <div class="text-center">仅允许导入 xls、xlsx 格式文件。</div>
      </template>
    </el-upload>
    <template #footer>
      <el-button type="primary" :loading="isUploading" @click="submitUpload">确 定</el-button>
      <el-button @click="visible = false">取 消</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import type { UploadFile, UploadInstance, UploadUserFile } from 'element-plus';
import { ElMessageBox } from 'element-plus';
import modal from '@/plugins/modal';
import { download as requestDownload, globalHeaders } from '@/utils/request';

const props = withDefaults(
  defineProps<{
    title?: string;
    uploadApi: string;
    downloadTemplateApi: string;
    templateFilename?: string;
    updateSupportLabel?: string;
  }>(),
  {
    title: '导入',
    templateFilename: 'template'
  }
);

const emit = defineEmits<{ refresh: [] }>();

const visible = defineModel<boolean>('visible', { default: false });
const uploadRef = ref<UploadInstance>();
const fileList = ref<UploadUserFile[]>([]);
const isUploading = ref(false);
const updateSupport = ref('false');
const headers = ref(globalHeaders());

const uploadAction = computed(
  () => `${import.meta.env.VITE_APP_BASE_API}/${props.uploadApi}?updateSupport=${updateSupport.value}`
);

const formatImportResultMessage = (message: unknown) =>
  String(message ?? '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/&nbsp;/gi, ' ')
    .replace(/<[^>]+>/g, '');

const handleClose = () => {
  fileList.value = [];
  isUploading.value = false;
};

const importTemplate = () => {
  requestDownload(props.downloadTemplateApi, {}, `${props.templateFilename}_${Date.now()}.xlsx`);
};

const handleFileUploadProgress = () => {
  isUploading.value = true;
};

const handleFileSuccess = (response: any, file: UploadFile) => {
  visible.value = false;
  handleClose();
  uploadRef.value?.handleRemove(file);
  ElMessageBox.alert(formatImportResultMessage(response.msg), '导入结果', {
    customClass: 'import-result-box'
  });
  emit('refresh');
};

const handleFileError = () => {
  isUploading.value = false;
  modal.msgError('上传失败');
};

const submitUpload = () => {
  uploadRef.value?.submit();
};

watch(visible, val => {
  if (!val) {
    handleClose();
  }
});
</script>