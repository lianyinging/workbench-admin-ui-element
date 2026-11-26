<template>
  <div class="p-2 app-container system-file-page">
    <el-card shadow="hover">
      <div class="gallery-toolbar">
        <el-button v-if="imageUpload || fileUpload" type="primary" icon="Upload" @click="handleUpload">上传</el-button>
        <el-button type="danger" icon="Delete" :disabled="!ids.length" @click="handleDelete()">删除</el-button>
        <el-button icon="Download" :disabled="ids.length !== 1" @click="handleDownload()">下载</el-button>
        <el-button icon="View" :disabled="!previewList.length" @click="showViewer = true">预览</el-button>
        <el-button icon="Edit" :disabled="ids.length !== 1" @click="handleUpdate()">编辑</el-button>
        <el-button icon="Rank" :disabled="!ids.length" @click="handleMove()">移动到</el-button>
        <el-button icon="Unlock" :disabled="!ids.length" @click="handleUnlock()">解锁</el-button>
        <el-button icon="Lock" :disabled="!ids.length" @click="handleLock()">加锁</el-button>
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
            @dblclick.stop="handleUpdate(file)"
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

    <el-dialog v-model="openView" :title="editDialogTitle" width="620px" append-to-body destroy-on-close>
      <el-form ref="fileFormRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="fileId">{{ form.fileId }}</el-form-item>
        <el-form-item label="文件名">{{ form.filename }}</el-form-item>
        <el-form-item label="原名" prop="originalFilename">
          <el-input v-model="form.originalFilename" placeholder="请输入原名" clearable />
        </el-form-item>
        <el-form-item label="分类" prop="fileCategoryId">
          <el-tree-select
            v-model="form.fileCategoryId"
            :data="fileCategoryOptions"
            :props="{ value: 'fileCategoryId', label: 'categoryName', children: 'children' }"
            check-strictly
            placeholder="请选择分类"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="锁定状态" prop="isLock">
          <el-switch v-model="form.isLock" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">保 存</el-button>
        <el-button @click="openView = false">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="openMove" title="移动文件" width="500px" append-to-body destroy-on-close>
      <el-form ref="fileMoveRef" :model="moveForm" :rules="moveRules" label-width="80px">
        <el-form-item label="分类" prop="fileCategoryId">
          <el-tree-select
            v-model="moveForm.fileCategoryId"
            :data="fileCategoryOptions"
            :props="{ value: 'fileCategoryId', label: 'categoryName', children: 'children' }"
            check-strictly
            placeholder="请选择分类"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :loading="buttonLoading" type="primary" @click="submitMoveForm">确 定</el-button>
        <el-button @click="openMove = false">取 消</el-button>
      </template>
    </el-dialog>

    <el-image-viewer v-if="showViewer" :url-list="previewList" @close="showViewer = false" />
  </div>
</template>

<script setup name="MyFileList" lang="ts">
import { delMyFile, getFile, listMyFile, lockMyFile, moveFile, unlockMyFile, updateFile } from '@/api/system/file';
import { listFileCategory } from '@/api/system/fileCategory';
import type { FileCategoryVO } from '@/api/system/fileCategory/types';
import type { FileForm, FileQuery, FileVO } from '@/api/system/file/types';
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
import { bytesToSize, getVisitUrl, handleTree, parseTime } from '@/utils/ruoyi';

export interface FileListProps {
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

const props = withDefaults(defineProps<FileListProps>(), {
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
const openMove = ref(false);
const showViewer = ref(false);
const isCompress = ref(false);
const uploadRowType = ref(0);
const editDialogTitle = ref('编辑文件');
const { loading, withLoading } = useLoading(true);
const { loading: buttonLoading, withLoading: withButtonLoading } = useLoading();
const form = ref<FileForm>({});
const moveForm = ref<FileForm>({});
const fileCategoryOptions = ref<FileCategoryVO[]>([]);
const fileFormRef = ref<ElFormInstance>();
const fileMoveRef = ref<ElFormInstance>();
const fileUploadRef = ref<InstanceType<typeof SystemFileUpload>>();
const imageUploadRef = ref<InstanceType<typeof SystemImageUpload>>();

const formRules = {
  originalFilename: [{ required: true, message: '原名不能为空', trigger: 'blur' }],
  fileCategoryId: [{ required: true, message: '分类不能为空', trigger: 'change' }]
};
const moveRules = {
  fileCategoryId: [{ required: true, message: '分类不能为空', trigger: 'change' }]
};

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
    const res = await listMyFile(queryParams.value);
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

const loadCategoryOptions = async () => {
  const res = await listFileCategory();
  fileCategoryOptions.value = [
    {
      fileCategoryId: 0,
      categoryName: '根分类',
      children: handleTree<FileCategoryVO>(res.data ?? [], 'fileCategoryId', 'parentId')
    }
  ];
};

const handleUpdate = async (row?: FileVO) => {
  await loadCategoryOptions();
  const fileId = row?.fileId ?? ids.value[0];
  const res = await getFile(fileId);
  form.value = { ...(res.data ?? {}) };
  editDialogTitle.value = row ? '编辑文件' : '编辑选中文件';
  openView.value = true;
};

const submitForm = () => {
  fileFormRef.value?.validate(async valid => {
    if (!valid) {
      return;
    }
    await withButtonLoading(async () => {
      await updateFile(form.value);
    });
    modal.msgSuccess('保存成功');
    openView.value = false;
    await getList();
    emit('update');
  });
};

const handleMove = async () => {
  await loadCategoryOptions();
  moveForm.value = { fileCategoryId: props.categoryId };
  openMove.value = true;
};

const submitMoveForm = () => {
  fileMoveRef.value?.validate(async valid => {
    if (!valid) {
      return;
    }
    await withButtonLoading(async () => {
      await moveFile(moveForm.value.fileCategoryId!, ids.value);
    });
    modal.msgSuccess('移动成功');
    openMove.value = false;
    ids.value = [];
    await getList();
    emit('update');
  });
};

const handleDownload = (downloadUrl?: string, filename?: string) => {
  const fileId = ids.value[0];
  const file = fileList.value.find(item => item.fileId === fileId);
  download.file(downloadUrl ?? file?.downloadUrl, filename ?? file?.originalFilename);
};

const handleDelete = async () => {
  await modal.confirm(ids.value.length === 1 ? '是否确认删除选中的文件？' : `是否确认删除选中的 ${ids.value.length} 项文件？`);
  await delMyFile(ids.value);
  modal.msgSuccess('删除成功');
  ids.value = [];
  await getList();
  emit('update');
};

const handleUnlock = async () => {
  await modal.confirm('是否确认解锁选中文件？');
  await unlockMyFile(ids.value);
  modal.msgSuccess('解锁成功');
  ids.value = [];
  await getList();
  emit('update');
};

const handleLock = async () => {
  await modal.confirm('是否确认加锁选中文件？');
  await lockMyFile(ids.value);
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