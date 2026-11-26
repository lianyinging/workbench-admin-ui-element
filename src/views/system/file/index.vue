<template>
  <div class="p-2 app-container system-file-page">
    <el-card shadow="hover">
      <div class="gallery-toolbar">
        <el-button v-if="imageUpload || fileUpload" v-hasPermi="['system:file:upload']" type="primary" icon="Upload" @click="handleUpload">
          上传
        </el-button>
        <el-button v-hasPermi="['system:file:remove']" type="danger" icon="Delete" :disabled="!ids.length" @click="handleDelete()">删除</el-button>
        <el-button v-hasPermi="['system:file:download']" icon="Download" :disabled="ids.length !== 1" @click="handleDownload()">下载</el-button>
        <el-button v-hasPermi="['system:file:query']" icon="View" :disabled="!previewList.length" @click="showViewer = true">预览</el-button>
        <el-button v-hasPermi="['system:file:query']" icon="InfoFilled" :disabled="ids.length !== 1" @click="handleDetail()">详情</el-button>
        <el-button v-hasPermi="['system:file:lock']" icon="Unlock" :disabled="!ids.length" @click="handleUnlock()">解锁</el-button>
        <el-button v-hasPermi="['system:file:lock']" icon="Lock" :disabled="!ids.length" @click="handleLock()">加锁</el-button>
        <el-input v-model="queryParams.originalFilename" placeholder="搜索文件名" clearable style="width: 220px" @keyup.enter="handleQuery">
          <template #append>
            <el-button icon="Search" @click="handleQuery" />
          </template>
        </el-input>
      </div>

      <div v-loading="loading">
        <div v-if="!fileList.length" class="gallery-empty">暂无数据</div>
        <RectSelect
          v-else
          class="list-card-gallery"
          :style="galleryStyle"
          :disabled="!multiple"
          :box-max-height="rectMaxHeight"
          @change="handleRectChange"
          @keydown.ctrl.a.stop.prevent="handleCheckedAll"
        >
          <div
            v-for="file in effectiveFileList"
            :key="file.fileId"
            class="list-card-gallery-item"
            :title="file.originalFilename"
            @dblclick.stop="handleDetail(file)"
            @click.exact.stop="handleClick(file)"
            @click.ctrl.exact.stop="handleCtrlClick(file)"
            @click.shift.exact.stop="handleShiftClick(file)"
            @click.ctrl.shift.stop="handleShiftClick(file, true)"
          >
            <div class="list-card-gallery-item__label" :class="{ 'list-card-gallery-item__label--active': file.active }">
              <figure class="list-card-gallery-figure">
                <figcaption class="list-card-gallery-figure__caption">
                  {{ file.ext }}
                  <template v-if="thumbnailSize >= 100"> ({{ bytesToSize(file.size ?? 0).replace(' ', '') }}) </template>
                </figcaption>
                <div class="list-card-gallery-figure__content">
                  <div v-if="getMediaType(file) !== 'image'" :class="`gallery-doc-icon gallery-doc-icon--${getMediaType(file)}`">
                    <img :src="iconMap[getMediaType(file)]" class="gallery-doc-icon__icon" alt="" />
                  </div>
                  <picture v-else class="list-card-gallery-responsive-image">
                    <img
                      class="list-card-gallery-responsive-image__img"
                      :src="thumbUrl(file.previewUrl)"
                      :alt="file.originalFilename"
                      draggable="false"
                    />
                  </picture>
                </div>
              </figure>
              <div class="list-card-gallery-item__details">
                <span class="list-card-gallery-item__name">
                  <el-icon v-if="file.isLock === 1"><Lock /></el-icon>
                  <span>{{ file.originalFilename }}</span>
                </span>
                <button
                  type="button"
                  class="list-card-gallery-item__checkmark"
                  :class="{ 'list-card-gallery-item__checkmark--active': file.active }"
                  @click.stop="buttonChecked(file)"
                >
                  <el-icon><Select /></el-icon>
                </button>
              </div>
            </div>
          </div>
        </RectSelect>
      </div>

      <div class="list-card-pagination">
        <pagination
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          @pagination="getList"
        />
        <span v-if="ids.length" class="selected-hint">选中 {{ ids.length }} 项</span>
      </div>
    </el-card>

    <el-dialog v-model="openUpload" :title="uploadTitle" width="720px" append-to-body destroy-on-close @closed="clearUploaders">
      <el-form label-width="90px">
        <el-form-item label="上传类型">
          <el-radio-group v-model="uploadRowType">
            <el-radio-button v-if="fileUpload" :value="0">上传文件</el-radio-button>
            <el-radio-button v-if="imageUpload" :value="1">上传图片</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="uploadRowType === 1" label="压缩图片">
          <el-switch v-model="isCompress" />
        </el-form-item>
        <el-form-item :label="uploadRowType === 0 ? '选择文件' : '选择图片'">
          <SystemFileUpload
            v-if="uploadRowType === 0 && fileUpload"
            ref="fileUploadRef"
            :limit="0"
            :file-category-id="categoryId"
            v-bind="fileUploadProps"
          />
          <SystemImageUpload
            v-else-if="uploadRowType === 1 && imageUpload"
            ref="imageUploadRef"
            :limit="0"
            :file-category-id="categoryId"
            :compress-support="isCompress"
            v-bind="imageUploadProps"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitUploadForm">完 成</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="openView" title="文件存储详情" width="720px" append-to-body>
      <el-skeleton :loading="detailLoading" animated>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="文件id">{{ detailForm.fileId }}</el-descriptions-item>
          <el-descriptions-item label="文件名">{{ detailForm.filename }}</el-descriptions-item>
          <el-descriptions-item label="原名">{{ detailForm.originalFilename }}</el-descriptions-item>
          <el-descriptions-item label="锁定状态">{{ detailForm.isLock }}</el-descriptions-item>
          <el-descriptions-item label="URL" :span="2">
            <div class="file-url-box">{{ getVisitUrl(detailForm.previewUrl) }}</div>
            <el-button link type="primary" @click="handleDownload(detailForm.downloadUrl, detailForm.originalFilename)">下载</el-button>
            <el-button link type="primary" @click="copyText(getVisitUrl(detailForm.previewUrl))">复制链接</el-button>
          </el-descriptions-item>
          <el-descriptions-item label="分类路径" :span="2">{{ detailForm.categoryPath ?? '/' }}</el-descriptions-item>
          <el-descriptions-item label="文件类型">{{ detailForm.contentType }}</el-descriptions-item>
          <el-descriptions-item label="大小">{{ bytesToSize(detailForm.size ?? 0).replace(' ', '') }}</el-descriptions-item>
          <el-descriptions-item label="修改时间">{{ parseTime(detailForm.updateTime) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(detailForm.createTime) }}</el-descriptions-item>
        </el-descriptions>
      </el-skeleton>
    </el-dialog>

    <el-image-viewer v-if="showViewer" :url-list="previewList" @close="showViewer = false" />
  </div>
</template>

<script setup name="SystemFile" lang="ts">
import { useClipboard } from '@vueuse/core';
import { delFile, getFile, listFile, lockFile, unlockFile } from '@/api/system/file';
import type { FileQuery, FileVO } from '@/api/system/file/types';
import ArchiveSvg from '@/assets/file-type/archive.svg';
import AudioSvg from '@/assets/file-type/audio.svg';
import ExcelSvg from '@/assets/file-type/excel.svg';
import PdfSvg from '@/assets/file-type/pdf.svg';
import PptSvg from '@/assets/file-type/ppt.svg';
import TextSvg from '@/assets/file-type/text.svg';
import UnknownSvg from '@/assets/file-type/unknown.svg';
import VideoSvg from '@/assets/file-type/video.svg';
import WordSvg from '@/assets/file-type/word.svg';
import RectSelect from '@/components/RectSelect/index.vue';
import SystemFileUpload from '@/components/SystemFileUpload/index.vue';
import SystemImageUpload from '@/components/SystemImageUpload/index.vue';
import { useLoading } from '@/hooks/async/useLoading';
import modal from '@/plugins/modal';
import download from '@/plugins/download';
import { getMediaType } from '@/utils/fileMedia';
import { bytesToSize, getVisitUrl, parseTime } from '@/utils/ruoyi';

export interface SystemFilePageProps {
  categoryId?: number;
  multiple?: boolean;
  thumbnailSize?: number;
  imageUpload?: boolean;
  fileUpload?: boolean;
  queryParam?: Pick<FileQuery, 'maxSize' | 'contentTypes' | 'suffixes'>;
  imageUploadProps?: Record<string, any>;
  fileUploadProps?: Record<string, any>;
  rectMaxHeight?: string;
}

const props = withDefaults(defineProps<SystemFilePageProps>(), {
  multiple: true,
  thumbnailSize: 120,
  imageUpload: true,
  fileUpload: true,
  rectMaxHeight: 'calc(100vh - 280px)'
});

const emit = defineEmits<{ change: [FileVO[]]; update: [] }>();

const iconMap: Record<string, string> = {
  archive: ArchiveSvg,
  audio: AudioSvg,
  excel: ExcelSvg,
  pdf: PdfSvg,
  ppt: PptSvg,
  text: TextSvg,
  unknown: UnknownSvg,
  video: VideoSvg,
  word: WordSvg
};

const fileList = ref<FileVO[]>([]);
const ids = ref<number[]>([]);
const shiftId = ref<number>();
const total = ref(0);
const openUpload = ref(false);
const openView = ref(false);
const showViewer = ref(false);
const isCompress = ref(false);
const uploadRowType = ref(0);
const { loading, withLoading } = useLoading(true);
const detailLoading = ref(false);
const detailForm = ref<FileVO>({});
const fileUploadRef = ref<InstanceType<typeof SystemFileUpload>>();
const imageUploadRef = ref<InstanceType<typeof SystemImageUpload>>();

const queryParams = ref<FileQuery>({
  pageNum: 1,
  pageSize: 20,
  originalFilename: undefined
});

const galleryStyle = computed(() => ({ '--gallery-thumb-size': `${props.thumbnailSize}px` }));
const uploadTitle = computed(() => (uploadRowType.value === 0 ? '上传文件' : '上传图片'));

const effectiveFileList = computed(() =>
  fileList.value.map(file => ({
    ...file,
    active: ids.value.includes(file.fileId!)
  }))
);

const previewList = computed(() =>
  effectiveFileList.value
    .filter(file => file.active && getMediaType(file) === 'image')
    .map(file => getVisitUrl(file.previewUrl))
);

const thumbUrl = (url?: string) =>
  getVisitUrl(url, 'x-oss-process=image/auto-orient,1/resize,m_lfit,w_300/quality,q_90&w=300&q=0.9');

const getList = async () => {
  await withLoading(async () => {
    queryParams.value.fileCategoryId = props.categoryId;
    queryParams.value.maxSize = props.queryParam?.maxSize;
    queryParams.value.contentTypes = props.queryParam?.contentTypes;
    queryParams.value.suffixes = props.queryParam?.suffixes;
    const res = await listFile(queryParams.value);
    ids.value = [];
    shiftId.value = undefined;
    fileList.value = res.data?.rows ?? [];
    total.value = res.data?.total ?? 0;
  });
};

watch(() => [props.categoryId, props.queryParam], () => getList(), { deep: true });
watch(
  () => props.multiple,
  (value, oldValue) => {
    if (oldValue && !value && ids.value.length > 1) {
      ids.value = ids.value.slice(0, 1);
    }
  }
);

const emitChange = () => {
  emit(
    'change',
    fileList.value.filter(item => ids.value.includes(item.fileId!))
  );
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const handleUpload = () => {
  openUpload.value = true;
};

const clearUploaders = () => {
  fileUploadRef.value?.clearFiles();
  imageUploadRef.value?.clearFiles();
};

const submitUploadForm = () => {
  openUpload.value = false;
  clearUploaders();
  getList();
  emit('update');
};

const handleDetail = async (row?: FileVO) => {
  detailLoading.value = true;
  openView.value = true;
  try {
    const fileId = row?.fileId ?? ids.value[0];
    const res = await getFile(fileId);
    detailForm.value = res.data ?? {};
  } finally {
    detailLoading.value = false;
  }
};

const handleDownload = (downloadUrl?: string, filename?: string) => {
  const fileId = ids.value[0];
  const file = fileList.value.find(item => item.fileId === fileId);
  download.file(downloadUrl ?? file?.downloadUrl, filename ?? file?.originalFilename);
};

const copyText = async (text?: string) => {
  if (!text) {
    return;
  }
  const { copy } = useClipboard();
  await copy(text);
  modal.msgSuccess('复制成功');
};

const handleDelete = async () => {
  await modal.confirm(ids.value.length === 1 ? '是否确认删除选中的文件？' : `是否确认删除选中的 ${ids.value.length} 项文件？`);
  await delFile(ids.value);
  modal.msgSuccess('删除成功');
  ids.value = [];
  await getList();
  emit('update');
};

const handleUnlock = async () => {
  await modal.confirm('是否确认解锁选中文件？');
  await unlockFile(ids.value);
  modal.msgSuccess('解锁成功');
  ids.value = [];
  await getList();
  emit('update');
};

const handleLock = async () => {
  await modal.confirm('是否确认加锁选中文件？');
  await lockFile(ids.value);
  modal.msgSuccess('加锁成功');
  ids.value = [];
  await getList();
  emit('update');
};

const handleRectChange = (indexes: number[]) => {
  showViewer.value = false;
  ids.value = fileList.value.filter((_, index) => indexes.includes(index)).map(item => item.fileId!);
  emitChange();
};

const handleClick = (file: FileVO) => {
  showViewer.value = false;
  shiftId.value = file.fileId;
  ids.value = [file.fileId!];
  emitChange();
};

const handleCtrlClick = (file: FileVO) => {
  shiftId.value = file.fileId;
  if (!props.multiple) {
    handleClick(file);
    return;
  }
  const index = ids.value.indexOf(file.fileId!);
  if (index >= 0) {
    ids.value.splice(index, 1);
  } else {
    ids.value.push(file.fileId!);
  }
  emitChange();
};

const handleShiftClick = (file: FileVO, append = false) => {
  if (!props.multiple) {
    handleClick(file);
    return;
  }
  const anchorId = shiftId.value ?? fileList.value[0]?.fileId;
  const startIndex = fileList.value.findIndex(item => item.fileId === anchorId);
  const endIndex = fileList.value.findIndex(item => item.fileId === file.fileId);
  const rangeIds: number[] = [];
  for (let i = Math.min(startIndex, endIndex); i <= Math.max(startIndex, endIndex); i++) {
    const current = fileList.value[i];
    if (!append || !ids.value.includes(current.fileId!)) {
      rangeIds.push(current.fileId!);
    }
  }
  ids.value = append ? [...ids.value, ...rangeIds] : rangeIds;
  emitChange();
};

const buttonChecked = (file: FileVO) => {
  const index = ids.value.indexOf(file.fileId!);
  if (index >= 0) {
    ids.value.splice(index, 1);
  } else if (props.multiple) {
    ids.value.push(file.fileId!);
  } else {
    ids.value = [file.fileId!];
  }
  emitChange();
};

const handleCheckedAll = () => {
  ids.value = fileList.value.map(item => item.fileId!);
  emitChange();
};

onMounted(() => {
  if (props.fileUpload === false) {
    uploadRowType.value = 1;
  }
  getList();
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/components/file-gallery';

.file-url-box {
  word-break: break-all;
  border: 1px solid var(--el-border-color);
  padding: 8px;
  margin-bottom: 8px;
}

.selected-hint {
  margin-left: 8px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
</style>