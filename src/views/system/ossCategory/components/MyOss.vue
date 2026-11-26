<template>
  <div class="p-2 app-container system-oss-page">
    <el-card shadow="hover">
      <div class="gallery-toolbar">
        <el-button
          v-if="imageUpload || fileUpload"
          v-hasPermi="['system:oss:upload']"
          type="primary"
          icon="Upload"
          @click="handleUpload"
        >
          上传
        </el-button>
        <el-button v-hasPermi="['system:oss:remove']" type="danger" icon="Delete" :disabled="!ids.length" @click="handleDelete()">
          删除
        </el-button>
        <el-button v-hasPermi="['system:oss:download']" icon="Download" :disabled="ids.length !== 1" @click="handleDownload()">
          下载
        </el-button>
        <el-button v-hasPermi="['system:oss:query']" icon="View" :disabled="!previewList.length" @click="showViewer = true">
          预览
        </el-button>
        <el-button v-hasPermi="['system:oss:edit']" icon="Edit" :disabled="ids.length !== 1" @click="handleUpdate()">属性</el-button>
        <el-button v-hasPermi="['system:oss:edit']" icon="Rank" :disabled="!ids.length" @click="handleMove()">移动到</el-button>
        <el-input
          v-model="queryParams.originalName"
          placeholder="搜索文件名"
          clearable
          style="width: 220px"
          @keyup.enter="handleQuery"
        >
          <template #append>
            <el-button icon="Search" @click="handleQuery" />
          </template>
        </el-input>
      </div>

      <div v-loading="loading">
        <div v-if="!ossList.length" class="gallery-empty">暂无数据</div>
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
            v-for="oss in effectiveOssList"
            :key="oss.ossId"
            class="list-card-gallery-item"
            :title="oss.originalName"
            @dblclick.stop="handleUpdate(oss)"
            @click.exact.stop="handleClick(oss)"
            @click.ctrl.exact.stop="handleCtrlClick(oss)"
            @click.shift.exact.stop="handleShiftClick(oss)"
            @click.ctrl.shift.stop="handleShiftClick(oss, true)"
          >
            <div class="list-card-gallery-item__label" :class="{ 'list-card-gallery-item__label--active': oss.active }">
              <figure class="list-card-gallery-figure">
                <figcaption class="list-card-gallery-figure__caption">
                  {{ (oss.fileSuffix || '').replace(/^\./, '') }}
                  <template v-if="thumbnailSize >= 100"> ({{ bytesToSize(oss.size ?? 0).replace(' ', '') }}) </template>
                </figcaption>
                <div class="list-card-gallery-figure__content">
                  <div v-if="getMediaType(oss) !== 'image'" :class="`gallery-doc-icon gallery-doc-icon--${getMediaType(oss)}`">
                    <img :src="iconMap[getMediaType(oss)]" class="gallery-doc-icon__icon" alt="" />
                  </div>
                  <picture v-else class="list-card-gallery-responsive-image">
                    <img
                      class="list-card-gallery-responsive-image__img"
                      :src="thumbUrl(oss.url)"
                      :alt="oss.originalName"
                      draggable="false"
                    />
                  </picture>
                </div>
              </figure>
              <div class="list-card-gallery-item__details">
                <span class="list-card-gallery-item__name">
                  <el-icon v-if="oss.isLock === 1"><Lock /></el-icon>
                  <span>{{ oss.originalName }}</span>
                </span>
                <button
                  type="button"
                  class="list-card-gallery-item__checkmark"
                  :class="{ 'list-card-gallery-item__checkmark--active': oss.active }"
                  @click.stop="buttonChecked(oss)"
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
          <el-upload
            v-if="uploadRowType === 0 && fileUpload"
            ref="ossFileUploadRef"
            v-model:file-list="uploadFileList"
            :action="ossUploadUrl"
            :headers="uploadHeaders"
            :data="ossUploadData"
            :accept="fileAccept"
            multiple
            drag
            :before-upload="handleBeforeFileUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
            class="oss-file-upload"
          >
            <el-icon class="el-icon--upload"><UploadFilled /></el-icon>
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
          </el-upload>
          <el-upload
            v-else-if="uploadRowType === 1 && imageUpload"
            ref="ossImageUploadRef"
            v-model:file-list="uploadImageList"
            :action="ossUploadUrl"
            :headers="uploadHeaders"
            :data="ossUploadData"
            :accept="imageAccept"
            list-type="picture-card"
            multiple
            :before-upload="handleBeforeImageUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
          >
            <el-icon><Plus /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitUploadForm">完 成</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="openView" :title="editDialogTitle" width="620px" append-to-body destroy-on-close>
      <el-form ref="ossFormRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="ossId">{{ form.ossId }}</el-form-item>
        <el-form-item label="文件名">{{ form.fileName }}</el-form-item>
        <el-form-item label="原名" prop="originalName">
          <el-input v-model="form.originalName" placeholder="请输入原名" clearable />
        </el-form-item>
        <el-form-item label="分类" prop="ossCategoryId">
          <el-tree-select
            v-model="form.ossCategoryId"
            :data="ossCategoryOptions"
            :props="{ value: 'ossCategoryId', label: 'categoryName', children: 'children' }"
            check-strictly
            placeholder="请选择分类"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="锁定状态" prop="isLock">
          <el-switch v-model="form.isLock" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="URL">
          <div class="file-url-box">{{ form.url }}</div>
          <el-button link type="primary" @click="handleDownload(form.ossId)">下载</el-button>
          <el-button link type="primary" @click="copyText(form.url)">复制链接</el-button>
        </el-form-item>
        <el-form-item label="分类路径">{{ form.categoryPath ?? '/' }}</el-form-item>
        <el-form-item label="文件类型">{{ form.contentType }}</el-form-item>
        <el-form-item label="大小">{{ bytesToSize(form.size ?? 0).replace(' ', '') }}</el-form-item>
        <el-form-item label="修改时间">{{ parseTime(form.updateTime) }}</el-form-item>
        <el-form-item label="创建时间">{{ parseTime(form.createTime) }}</el-form-item>
      </el-form>
      <template #footer>
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">保 存</el-button>
        <el-button @click="openView = false">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="openMove" title="移动OSS对象" width="500px" append-to-body destroy-on-close>
      <el-form ref="ossMoveRef" :model="moveForm" :rules="moveRules" label-width="80px">
        <el-form-item label="分类" prop="ossCategoryId">
          <el-tree-select
            v-model="moveForm.ossCategoryId"
            :data="ossCategoryOptions"
            :props="{ value: 'ossCategoryId', label: 'categoryName', children: 'children' }"
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

<script setup name="MyOss" lang="ts">
import { useClipboard } from '@vueuse/core';
import { compressAccurately } from 'image-conversion';
import type { UploadFile, UploadProps, UploadUserFile } from 'element-plus';
import { delMyOss, getOss, listMyOss, moveOss, updateOss } from '@/api/system/oss';
import type { OssForm, OssQuery, OssVO } from '@/api/system/oss/types';
import { listOssCategory } from '@/api/system/ossCategory';
import type { OssCategoryVO } from '@/api/system/ossCategory/types';
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
import { useLoading } from '@/hooks/async/useLoading';
import download from '@/plugins/download';
import modal from '@/plugins/modal';
import { getMediaType } from '@/utils/fileMedia';
import { globalHeaders } from '@/utils/request';
import { bytesToSize, getVisitUrl, handleTree, parseTime } from '@/utils/ruoyi';

export interface MyOssProps {
  categoryId?: number;
  multiple?: boolean;
  thumbnailSize?: number;
  imageUpload?: boolean;
  fileUpload?: boolean;
  queryParam?: Pick<OssQuery, 'maxSize' | 'contentTypes' | 'suffixes'>;
  imageUploadProps?: Record<string, any>;
  fileUploadProps?: Record<string, any>;
  rectMaxHeight?: string;
}

const props = withDefaults(defineProps<MyOssProps>(), {
  multiple: true,
  thumbnailSize: 120,
  imageUpload: true,
  fileUpload: true,
  rectMaxHeight: 'calc(100vh - 280px)'
});

const emit = defineEmits<{ change: [OssVO[]]; update: [] }>();

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

const ossList = ref<OssVO[]>([]);
const ids = ref<Array<string | number>>([]);
const shiftId = ref<string | number>();
const total = ref(0);
const openUpload = ref(false);
const openView = ref(false);
const openMove = ref(false);
const showViewer = ref(false);
const isCompress = ref(false);
const uploadRowType = ref(0);
const editDialogTitle = ref('OSS对象属性');
const { loading, withLoading } = useLoading(true);
const { loading: buttonLoading, withLoading: withButtonLoading } = useLoading();
const form = ref<OssForm & OssVO>({ isLock: 0 });
const moveForm = ref<OssForm>({});
const ossCategoryOptions = ref<OssCategoryVO[]>([]);
const ossFormRef = ref<ElFormInstance>();
const ossMoveRef = ref<ElFormInstance>();
const ossFileUploadRef = ref();
const ossImageUploadRef = ref();
const uploadFileList = ref<UploadUserFile[]>([]);
const uploadImageList = ref<UploadUserFile[]>([]);

const ossUploadUrl = `${import.meta.env.VITE_APP_BASE_API}/resource/oss/upload`;
const uploadHeaders = ref(globalHeaders());

const defaultFileTypes = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'pdf', 'zip'];
const defaultImageTypes = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'];

const fileAccept = computed(() => {
  const types = props.fileUploadProps?.fileType ?? props.fileUploadProps?.accept ?? defaultFileTypes;
  const list = Array.isArray(types) ? types : String(types).split(',');
  return list.map((item: string) => (item.startsWith('.') ? item : `.${item}`)).join(',');
});

const imageAccept = computed(() => {
  const types = props.imageUploadProps?.fileType ?? props.imageUploadProps?.accept ?? defaultImageTypes;
  const list = Array.isArray(types) ? types : String(types).split(',');
  return list.map((item: string) => (item.startsWith('.') ? item : `.${item}`)).join(',');
});

const ossUploadData = computed(() => ({
  ossCategoryId: props.categoryId ?? ''
}));

const formRules = {
  originalName: [{ required: true, message: '原名不能为空', trigger: 'blur' }],
  ossCategoryId: [{ required: true, message: '分类不能为空', trigger: 'change' }]
};
const moveRules = {
  ossCategoryId: [{ required: true, message: '分类不能为空', trigger: 'change' }]
};

const queryParams = ref<OssQuery>({
  pageNum: 1,
  pageSize: 20,
  originalName: undefined
});

const galleryStyle = computed(() => ({ '--gallery-thumb-size': `${props.thumbnailSize}px` }));
const uploadTitle = computed(() => (uploadRowType.value === 0 ? '上传文件' : '上传图片'));

const sameOssId = (a?: string | number, b?: string | number) => String(a) === String(b);

const effectiveOssList = computed(() =>
  ossList.value.map(oss => ({
    ...oss,
    active: ids.value.some(id => sameOssId(id, oss.ossId))
  }))
);

const previewList = computed(() =>
  effectiveOssList.value
    .filter(oss => oss.active && getMediaType(oss) === 'image')
    .map(oss => getVisitUrl(oss.url))
);

const thumbUrl = (url?: string) =>
  getVisitUrl(url, 'x-oss-process=image/auto-orient,1/resize,m_lfit,w_300/quality,q_90&w=300&q=0.9');

const getList = async () => {
  await withLoading(async () => {
    queryParams.value.ossCategoryId = props.categoryId;
    queryParams.value.maxSize = props.queryParam?.maxSize;
    queryParams.value.contentTypes = props.queryParam?.contentTypes;
    queryParams.value.suffixes = props.queryParam?.suffixes?.map(value => (value.startsWith('.') ? value : `.${value}`));
    const res = await listMyOss(queryParams.value);
    ids.value = [];
    shiftId.value = undefined;
    ossList.value = res.data?.rows ?? [];
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
    ossList.value.filter(item => ids.value.some(id => sameOssId(id, item.ossId)))
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
  uploadFileList.value = [];
  uploadImageList.value = [];
  ossFileUploadRef.value?.clearFiles();
  ossImageUploadRef.value?.clearFiles();
};

const fileSizeLimitMb = (propsKey: 'fileUploadProps' | 'imageUploadProps', fallback: number) =>
  props[propsKey]?.fileSize ?? fallback;

const handleBeforeFileUpload: UploadProps['beforeUpload'] = rawFile => {
  const maxMb = fileSizeLimitMb('fileUploadProps', 50);
  if (rawFile.size / 1024 / 1024 >= maxMb) {
    modal.msgError(`上传文件大小不能超过 ${maxMb} MB`);
    return false;
  }
  return true;
};

const handleBeforeImageUpload: UploadProps['beforeUpload'] = async rawFile => {
  const maxMb = fileSizeLimitMb('imageUploadProps', 5);
  let file: File = rawFile;
  if (rawFile.size / 1024 / 1024 >= maxMb) {
    modal.msgError(`上传图片大小不能超过 ${maxMb} MB`);
    return false;
  }
  if (isCompress.value && rawFile.size / 1024 > 300) {
    const blob = await compressAccurately(rawFile, 300);
    file = new File([blob], rawFile.name, { type: rawFile.type });
  }
  return file;
};

const handleUploadSuccess = (response: any, file: UploadFile) => {
  if (response.code === 200) {
    modal.msgSuccess(`${file.name} 上传成功`);
  } else {
    modal.msgError(response.msg || '上传失败');
  }
};

const handleUploadError = () => {
  modal.msgError('上传失败');
};

const submitUploadForm = () => {
  openUpload.value = false;
  clearUploaders();
  getList();
  emit('update');
};

const loadCategoryOptions = async () => {
  const res = await listOssCategory();
  ossCategoryOptions.value = [
    {
      ossCategoryId: 0,
      categoryName: '根分类',
      children: handleTree<OssCategoryVO>(res.data ?? [], 'ossCategoryId', 'parentId')
    }
  ];
};

const handleUpdate = async (row?: OssVO) => {
  await loadCategoryOptions();
  const ossId = row?.ossId ?? ids.value[0];
  const res = await getOss(ossId!);
  form.value = { isLock: 0, ...res.data };
  editDialogTitle.value = row ? 'OSS对象属性' : '编辑选中对象';
  openView.value = true;
};

const submitForm = () => {
  ossFormRef.value?.validate(async valid => {
    if (!valid) {
      return;
    }
    await withButtonLoading(async () => {
      await updateOss({
        ossId: form.value.ossId as number,
        originalName: form.value.originalName,
        ossCategoryId: form.value.ossCategoryId,
        isLock: form.value.isLock
      });
    });
    modal.msgSuccess('保存成功');
    openView.value = false;
    await getList();
    emit('update');
  });
};

const handleMove = async () => {
  await loadCategoryOptions();
  moveForm.value = { ossCategoryId: props.categoryId };
  openMove.value = true;
};

const submitMoveForm = () => {
  ossMoveRef.value?.validate(async valid => {
    if (!valid) {
      return;
    }
    const ossIds = ids.value.map(id => Number(id));
    await withButtonLoading(async () => {
      await moveOss(moveForm.value.ossCategoryId!, ossIds);
    });
    modal.msgSuccess('移动成功');
    openMove.value = false;
    ids.value = [];
    await getList();
    emit('update');
  });
};

const handleDownload = (ossId?: string | number) => {
  const id = ossId ?? ids.value[0];
  if (id !== undefined && id !== '') {
    download.oss(id);
  }
};

const handleDelete = async () => {
  await modal.confirm(
    ids.value.length === 1 ? '是否确认删除选中的OSS对象？' : `是否确认删除选中的 ${ids.value.length} 项OSS对象？`
  );
  await delMyOss(ids.value);
  modal.msgSuccess('删除成功');
  ids.value = [];
  await getList();
  emit('update');
};

const copyText = (text?: string) => {
  if (!text) {
    return;
  }
  const { copy } = useClipboard({ source: text });
  copy()
    .then(() => modal.msgSuccess('复制成功'))
    .catch(() => modal.msgError('复制失败'));
};

const handleRectChange = (indexes: number[]) => {
  showViewer.value = false;
  ids.value = ossList.value.filter((_, index) => indexes.includes(index)).map(item => item.ossId!);
  emitChange();
};

const handleClick = (oss: OssVO) => {
  showViewer.value = false;
  shiftId.value = oss.ossId;
  ids.value = [oss.ossId!];
  emitChange();
};

const handleCtrlClick = (oss: OssVO) => {
  shiftId.value = oss.ossId;
  if (!props.multiple) {
    handleClick(oss);
    return;
  }
  const index = ids.value.findIndex(id => sameOssId(id, oss.ossId));
  if (index >= 0) {
    ids.value.splice(index, 1);
  } else {
    ids.value.push(oss.ossId!);
  }
  emitChange();
};

const handleShiftClick = (oss: OssVO, append = false) => {
  if (!props.multiple) {
    handleClick(oss);
    return;
  }
  const anchorId = shiftId.value ?? ossList.value[0]?.ossId;
  const startIndex = ossList.value.findIndex(item => sameOssId(item.ossId, anchorId));
  const endIndex = ossList.value.findIndex(item => sameOssId(item.ossId, oss.ossId));
  const rangeIds: Array<string | number> = [];
  for (let i = Math.min(startIndex, endIndex); i <= Math.max(startIndex, endIndex); i++) {
    const current = ossList.value[i];
    if (!append || !ids.value.some(id => sameOssId(id, current.ossId))) {
      rangeIds.push(current.ossId!);
    }
  }
  ids.value = append ? [...ids.value, ...rangeIds] : rangeIds;
  emitChange();
};

const buttonChecked = (oss: OssVO) => {
  const index = ids.value.findIndex(id => sameOssId(id, oss.ossId));
  if (index >= 0) {
    ids.value.splice(index, 1);
  } else if (props.multiple) {
    ids.value.push(oss.ossId!);
  } else {
    ids.value = [oss.ossId!];
  }
  emitChange();
};

const handleCheckedAll = () => {
  ids.value = ossList.value.map(item => item.ossId!);
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

.oss-file-upload {
  width: 100%;
}
</style>