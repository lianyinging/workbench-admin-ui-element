<template>
  <el-upload
    v-model:file-list="fileList"
    :action="uploadUrl"
    :headers="headers"
    :data="uploadData"
    :accept="acceptString"
    :limit="effectiveLimit"
    :before-upload="handleBeforeUpload"
    :on-success="handleSuccess"
    :on-error="handleError"
    :on-exceed="handleExceed"
    multiple
    drag
    class="system-file-upload"
  >
    <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
    <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
    <template v-if="isShowTip" #tip>
      <div class="el-upload__tip">请上传大小不超过 {{ fileSize }}MB 的文件</div>
    </template>
  </el-upload>
</template>

<script setup lang="ts">
import type { UploadFile, UploadProps, UploadUserFile } from 'element-plus';
import modal from '@/plugins/modal';
import { globalHeaders } from '@/utils/request';

const props = withDefaults(
  defineProps<{
    limit?: number;
    fileSize?: number;
    fileType?: string[];
    accept?: string[];
    fileCategoryId?: number;
    isShowTip?: boolean;
  }>(),
  {
    limit: 0,
    fileSize: 50,
    fileType: () => ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf', 'zip'],
    isShowTip: true
  }
);

const emit = defineEmits<{ success: [UploadFile] }>();

const uploadUrl = `${import.meta.env.VITE_APP_BASE_API}/system/file/upload`;
const headers = ref(globalHeaders());
const fileList = ref<UploadUserFile[]>([]);

const effectiveLimit = computed(() => (props.limit > 0 ? props.limit : undefined));

const acceptString = computed(() => {
  if (props.accept?.length) {
    return props.accept.join(',');
  }
  return props.fileType.map(item => `.${item}`).join(',');
});

const uploadData = computed(() => ({
  fileCategoryId: props.fileCategoryId ?? ''
}));

const handleBeforeUpload: UploadProps['beforeUpload'] = rawFile => {
  const ext = rawFile.name.includes('.') ? rawFile.name.split('.').pop()?.toLowerCase() : '';
  const typeOk = !props.fileType.length || (ext && props.fileType.includes(ext));
  const sizeOk = rawFile.size / 1024 / 1024 < props.fileSize;
  if (!typeOk) {
    modal.msgError(`文件格式不正确，请上传 ${props.fileType.join('/')} 格式文件`);
    return false;
  }
  if (!sizeOk) {
    modal.msgError(`上传文件大小不能超过 ${props.fileSize} MB`);
    return false;
  }
  return true;
};

const handleSuccess = (response: any, file: UploadFile) => {
  if (response.code === 200) {
    modal.msgSuccess(`${file.name} 上传成功`);
    emit('success', file);
  } else {
    modal.msgError(response.msg || '上传失败');
    fileList.value = fileList.value.filter(item => item.uid !== file.uid);
  }
};

const handleError = () => {
  modal.msgError('上传失败');
};

const handleExceed = () => {
  if (props.limit > 0) {
    modal.msgError(`最多只能上传 ${props.limit} 个文件`);
  }
};

const clearFiles = () => {
  fileList.value = [];
};

defineExpose({ clearFiles });
</script>