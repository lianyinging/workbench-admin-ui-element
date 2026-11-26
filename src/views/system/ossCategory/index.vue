<template>
  <div class="p-2 app-container system-oss-category-page">
    <el-row :gutter="16">
      <el-col :lg="4" :xs="24">
        <el-card shadow="hover" class="category-card">
          <div class="category-toolbar">
            <el-input v-model="categoryName" placeholder="搜索分类名称" clearable prefix-icon="Search" />
            <el-button icon="Refresh" @click="getCategoryTree" />
          </div>
          <el-skeleton :loading="loadingOptions" animated>
            <el-tree
              ref="categoryTreeRef"
              :data="ossCategoryTree"
              node-key="ossCategoryId"
              :props="{ label: 'categoryName', children: 'children' }"
              :filter-node-method="filterNode"
              highlight-current
              default-expand-all
              @node-click="handleCategoryClick"
            >
              <template #default="{ data }">
                <span class="tree-node">{{ data.categoryName }} ({{ data.fileCount ?? 0 }})</span>
              </template>
              <template #empty>
                <el-button v-hasPermi="['system:ossCategory:add']" link type="primary" @click="handleCategoryAdd()">
                  新建分类
                </el-button>
              </template>
            </el-tree>
          </el-skeleton>
        </el-card>
      </el-col>
      <el-col :lg="20" :xs="24">
        <MyOss
          :category-id="categoryActived"
          :query-param="queryParam"
          :multiple="multiple"
          :image-upload="imageUpload"
          :file-upload="fileUpload"
          :file-upload-props="fileUploadProps"
          :image-upload-props="imageUploadProps"
          :thumbnail-size="thumbnailSize"
          :rect-max-height="rectMaxHeight"
          @change="values => emit('change', values)"
          @update="getCategoryTree"
        />
      </el-col>
    </el-row>

    <el-dialog v-model="openCategory" :title="categoryTitle" width="520px" append-to-body destroy-on-close>
      <el-form ref="ossCategoryFormRef" :model="categoryForm" :rules="categoryRules" label-width="90px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="categoryForm.categoryName" placeholder="请输入分类名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="父级分类" prop="parentId">
          <el-tree-select
            v-model="categoryForm.parentId"
            :data="ossCategoryOptions"
            :props="{ value: 'ossCategoryId', label: 'categoryName', children: 'children' }"
            check-strictly
            placeholder="请选择父级分类"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="显示顺序" prop="orderNum">
          <el-input-number v-model="categoryForm.orderNum" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :loading="buttonLoading" type="primary" @click="submitCategoryForm">确 定</el-button>
        <el-button @click="openCategory = false">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="openCategoryDetail" title="OSS分类详情" width="700px" append-to-body>
      <el-skeleton :loading="detailLoading" animated>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="分类id">{{ categoryForm.ossCategoryId }}</el-descriptions-item>
          <el-descriptions-item label="分类名称">{{ categoryForm.categoryName }}</el-descriptions-item>
          <el-descriptions-item label="文件数量">{{ categoryForm.fileCount }}</el-descriptions-item>
          <el-descriptions-item label="父级分类">{{ categoryForm.parentCategoryName }}</el-descriptions-item>
          <el-descriptions-item label="分类路径" :span="2">{{ categoryForm.categoryPath }}</el-descriptions-item>
          <el-descriptions-item label="层级">{{ categoryForm.level }}</el-descriptions-item>
          <el-descriptions-item label="显示顺序">{{ categoryForm.orderNum }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ parseTime(categoryForm.updateTime) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(categoryForm.createTime) }}</el-descriptions-item>
        </el-descriptions>
      </el-skeleton>
    </el-dialog>
  </div>
</template>

<script setup name="OssCategory" lang="ts">
import {
  addOssCategory,
  delOssCategory,
  getOssCategory,
  listOssCategory,
  updateOssCategory
} from '@/api/system/ossCategory';
import type { OssCategoryForm, OssCategoryQuery, OssCategoryVO } from '@/api/system/ossCategory/types';
import type { OssQuery, OssVO } from '@/api/system/oss/types';
import { useLoading } from '@/hooks/async/useLoading';
import modal from '@/plugins/modal';
import { handleTree, parseTime } from '@/utils/ruoyi';
import MyOss from './components/MyOss.vue';

export interface OssCategoryPageProps {
  multiple?: boolean;
  thumbnailSize?: number;
  imageUpload?: boolean;
  fileUpload?: boolean;
  queryParam?: Pick<OssQuery, 'maxSize' | 'contentTypes' | 'suffixes'>;
  imageUploadProps?: Record<string, any>;
  fileUploadProps?: Record<string, any>;
  rectMaxHeight?: string;
}

const props = withDefaults(defineProps<OssCategoryPageProps>(), {
  multiple: true,
  thumbnailSize: 120,
  imageUpload: true,
  fileUpload: true,
  rectMaxHeight: 'calc(100vh - 220px)'
});

const emit = defineEmits<{ change: [OssVO[]] }>();

const categoryName = ref('');
const categoryActived = ref<number>();
const ossCategoryTree = ref<OssCategoryVO[]>([]);
const ossCategoryOptions = ref<OssCategoryVO[]>([]);
const openCategory = ref(false);
const openCategoryDetail = ref(false);
const categoryTitle = ref('');
const categoryForm = ref<OssCategoryForm & OssCategoryVO>({ orderNum: 0 });
const ossCategoryFormRef = ref<ElFormInstance>();
const categoryTreeRef = ref();
const { loading: loadingOptions, withLoading: withOptionsLoading } = useLoading();
const { loading: buttonLoading, withLoading: withButtonLoading } = useLoading();
const detailLoading = ref(false);

const categoryRules = {
  categoryName: [
    { required: true, message: '分类名称不能为空', trigger: 'blur' },
    { pattern: /^[^/%_*]*$/, message: '分类名不能包含下列任何字符：/%_*', trigger: 'blur' }
  ],
  parentId: [{ required: true, message: '父级分类不能为空', trigger: 'change' }],
  orderNum: [{ required: true, message: '显示顺序不能为空', trigger: 'blur' }]
};

const categoryQuery = computed<OssCategoryQuery>(() => ({
  suffixes: props.queryParam?.suffixes?.map(value => `.${value}`),
  maxSize: props.queryParam?.maxSize,
  contentTypes: props.queryParam?.contentTypes
}));

watch(categoryName, val => categoryTreeRef.value?.filter(val));

const filterNode = (value: string, data: OssCategoryVO) => {
  if (!value) {
    return true;
  }
  return (data.categoryName ?? '').includes(value);
};

const getCategoryTree = async () => {
  await withOptionsLoading(async () => {
    const res = await listOssCategory(categoryQuery.value);
    ossCategoryTree.value = handleTree<OssCategoryVO>(res.data ?? [], 'ossCategoryId', 'parentId');
  });
};

const getCategoryOptions = async () => {
  const res = await listOssCategory();
  ossCategoryOptions.value = [
    {
      ossCategoryId: 0,
      categoryName: '根分类',
      children: handleTree<OssCategoryVO>(res.data ?? [], 'ossCategoryId', 'parentId')
    }
  ];
};

const handleCategoryClick = (data: OssCategoryVO) => {
  categoryActived.value = data.ossCategoryId;
};

const resetCategoryForm = () => {
  categoryForm.value = { orderNum: 0 };
  ossCategoryFormRef.value?.resetFields();
};

const handleCategoryAdd = async (parent?: OssCategoryVO, orderNum?: number) => {
  resetCategoryForm();
  await getCategoryOptions();
  categoryForm.value.parentId = parent?.ossCategoryId ?? 0;
  if (orderNum !== undefined) {
    categoryForm.value.orderNum = orderNum;
  }
  categoryTitle.value = '添加OSS分类';
  openCategory.value = true;
};

const handleCategoryDetail = async (row: OssCategoryVO) => {
  detailLoading.value = true;
  openCategoryDetail.value = true;
  try {
    const res = await getOssCategory({ ...categoryQuery.value, ossCategoryId: row.ossCategoryId! });
    categoryForm.value = res.data ?? {};
  } finally {
    detailLoading.value = false;
  }
};

const handleCategoryUpdate = async (row: OssCategoryVO) => {
  resetCategoryForm();
  await getCategoryOptions();
  const res = await getOssCategory({ ...categoryQuery.value, ossCategoryId: row.ossCategoryId! });
  categoryForm.value = res.data ?? {};
  categoryTitle.value = '修改OSS分类';
  openCategory.value = true;
};

const handleCategoryDelete = async (row: OssCategoryVO) => {
  await modal.confirm(`是否确认删除【${row.categoryName}】分类？`);
  await delOssCategory(row.ossCategoryId!);
  if (categoryActived.value === row.ossCategoryId) {
    categoryActived.value = undefined;
  }
  modal.msgSuccess('删除成功');
  await getCategoryTree();
};

const submitCategoryForm = () => {
  ossCategoryFormRef.value?.validate(async valid => {
    if (!valid) {
      return;
    }
    await withButtonLoading(async () => {
      if (categoryForm.value.ossCategoryId) {
        await updateOssCategory(categoryForm.value);
      } else {
        await addOssCategory(categoryForm.value);
      }
    });
    modal.msgSuccess('操作成功');
    openCategory.value = false;
    await getCategoryTree();
  });
};

defineExpose({
  handleCategoryAdd,
  handleCategoryDetail,
  handleCategoryUpdate,
  handleCategoryDelete
});

watch(
  () => props.queryParam,
  () => getCategoryTree(),
  { deep: true }
);

onMounted(() => {
  getCategoryTree();
});
</script>

<style lang="scss" scoped>
.category-card {
  min-height: 520px;
}

.category-toolbar {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.tree-node {
  font-size: 13px;
}
</style>