<template>
  <div class="p-2 app-container system-sensitive-word-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>敏感词</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="敏感词" prop="word">
          <el-input
            v-model="queryParams.word"
            class="filter-control"
            placeholder="请输入敏感词"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="敏感词类别" prop="category">
          <el-select v-model="queryParams.category" class="filter-control" placeholder="请选择敏感词类别" clearable>
            <el-option
              v-for="dict in sensitive_words_category"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态" prop="status">
          <el-select v-model="queryParams.status" class="filter-control" placeholder="请选择启用状态" clearable>
            <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="list-toolbar">
        <div class="list-toolbar__left">
          <el-button v-hasPermi="['system:sensitiveWord:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            v-hasPermi="['system:sensitiveWord:edit']"
            :disabled="single"
            icon="Edit"
            @click="handleUpdate()"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:sensitiveWord:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete()"
          >
            删除
          </el-button>
          <el-button v-hasPermi="['system:sensitiveWord:import']" type="info" plain icon="Upload" @click="openImportExcel = true">
            导入
          </el-button>
          <el-button v-hasPermi="['system:sensitiveWord:export']" type="warning" plain icon="Download" @click="handleExport">
            导出
          </el-button>
          <el-button v-hasPermi="['system:sensitiveWord:remove']" type="danger" plain icon="Refresh" @click="handleRefreshCache">
            刷新缓存
          </el-button>
          <el-button type="info" plain icon="Filter" @click="openTest = true">测试文本</el-button>
        </div>
        <div class="list-toolbar__right">
          <el-button circle icon="Refresh" title="刷新" @click="getList" />
        </div>
      </div>

      <el-table
        v-loading="loading"
        border
        class="data-table"
        :data="sensitiveWordList"
        row-key="wordId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="敏感词" align="center" prop="word" fixed="left" />
        <el-table-column label="敏感词类别" align="center" prop="category">
          <template #default="scope">
            <dict-tag :options="sensitive_words_category" :value="scope.row.category" />
          </template>
        </el-table-column>
        <el-table-column label="描述" align="center" prop="description" :show-overflow-tooltip="true" />
        <el-table-column label="启用状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
          <template #default="scope">{{ parseTime(scope.row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">{{ parseTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="160" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-hasPermi="['system:sensitiveWord:query']"
                type="primary"
                :underline="false"
                @click="handleDetail(scope.row)"
              >
                详情
              </el-link>
              <el-link
                v-hasPermi="['system:sensitiveWord:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-link
                v-hasPermi="['system:sensitiveWord:remove']"
                type="danger"
                :underline="false"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="getList"
      />
    </el-card>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="520px"
      append-to-body
      destroy-on-close
      @closed="handleDialogClosed"
    >
      <el-form ref="sensitiveWordFormRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="敏感词" prop="word">
          <el-input v-model="form.word" placeholder="请输入敏感词" clearable />
        </el-form-item>
        <el-form-item label="敏感词类别" prop="category">
          <el-select v-model="form.category" placeholder="请选择敏感词类别" clearable style="width: 100%">
            <el-option
              v-for="dict in sensitive_words_category"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" placeholder="请输入描述" />
        </el-form-item>
        <el-form-item label="启用状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="Number(dict.value)">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialog.visible" title="敏感词详情" width="700px" append-to-body>
      <el-skeleton :loading="detailLoading" animated>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="敏感词id">{{ detailForm.wordId }}</el-descriptions-item>
          <el-descriptions-item label="敏感词">{{ detailForm.word }}</el-descriptions-item>
          <el-descriptions-item label="敏感词类别">
            <dict-tag :options="sensitive_words_category" :value="detailForm.category" />
          </el-descriptions-item>
          <el-descriptions-item label="启用状态">
            <dict-tag :options="sys_normal_disable" :value="detailForm.status" />
          </el-descriptions-item>
          <el-descriptions-item label="描述" :span="2">{{ detailForm.description }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ parseTime(detailForm.updateTime) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(detailForm.createTime) }}</el-descriptions-item>
        </el-descriptions>
      </el-skeleton>
    </el-dialog>

    <UploadExcel
      v-model:visible="openImportExcel"
      title="敏感词导入"
      upload-api="system/sensitiveWord/importData"
      download-template-api="/system/sensitiveWord/importTemplate"
      template-filename="sensitiveWord_template"
      @refresh="getList"
    />

    <el-dialog v-model="openTest" title="敏感词测试" width="620px" append-to-body destroy-on-close>
      <el-form ref="sensitiveWordTestRef" :model="testForm" :rules="testRules" label-width="100px">
        <el-form-item label="敏感词类别" prop="category">
          <el-select v-model="testForm.category" multiple collapse-tags collapse-tags-tooltip placeholder="请选择敏感词类别" style="width: 100%">
            <el-option
              v-for="dict in sensitive_words_category"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="测试文本" prop="text">
          <el-input v-model="testForm.text" type="textarea" placeholder="请输入测试文本" />
        </el-form-item>
        <template v-if="testResult">
          <el-divider>敏感词测试结果</el-divider>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="是否包含敏感词">{{ testResult.containsSensitiveWord }}</el-descriptions-item>
            <el-descriptions-item label="替换后文本">{{ testResult.sensitiveWordReplace }}</el-descriptions-item>
            <el-descriptions-item v-if="testResult.sensitiveWords?.length" label="包含的敏感词">
              {{ testResult.sensitiveWords.join(' ') }}
            </el-descriptions-item>
          </el-descriptions>
        </template>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="buttonTestLoading" @click="submitTestForm">测 试</el-button>
        <el-button @click="openTest = false">关 闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="SensitiveWord" lang="ts">
import {
  addSensitiveWord,
  delSensitiveWord,
  getSensitiveWord,
  listSensitiveWord,
  refreshSensitiveWordCache,
  sensitiveWordTest,
  updateSensitiveWord
} from '@/api/system/sensitiveWord';
import type { SensitiveWordForm, SensitiveWordQuery, SensitiveWordTest, SensitiveWordTestVO, SensitiveWordVO } from '@/api/system/sensitiveWord/types';
import UploadExcel from '@/components/UploadExcel/index.vue';
import { useLoading } from '@/hooks/async/useLoading';
import { useDialogState } from '@/hooks/dialog/useDialogState';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';
import { download as requestDownload } from '@/utils/request';
import { parseTime } from '@/utils/ruoyi';

const { sys_normal_disable, sensitive_words_category } = toRefs<any>(
  useDict('sys_normal_disable', 'sensitive_words_category')
);

const sensitiveWordList = ref<SensitiveWordVO[]>([]);
const { loading, withLoading } = useLoading(true);
const { loading: buttonLoading, withLoading: withButtonLoading } = useLoading();
const { loading: buttonTestLoading, withLoading: withTestLoading } = useLoading();
const total = ref(0);
const detailLoading = ref(false);
const openImportExcel = ref(false);
const openTest = ref(false);
const testResult = ref<SensitiveWordTestVO>();

const queryFormRef = ref<ElFormInstance>();
const sensitiveWordFormRef = ref<ElFormInstance>();
const sensitiveWordTestRef = ref<ElFormInstance>();

const initFormData: SensitiveWordForm = {
  wordId: undefined,
  word: undefined,
  category: undefined,
  description: undefined,
  status: 1
};

const testForm = ref<SensitiveWordTest>({ text: '', category: [] });

const data = reactive<PageData<SensitiveWordForm, SensitiveWordQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    word: undefined,
    category: undefined,
    status: undefined
  },
  rules: {
    word: [
      { required: true, message: '敏感词不能为空', trigger: 'blur' },
      { max: 255, message: '敏感词不能超过255个字符', trigger: 'blur' }
    ],
    category: [{ required: true, message: '敏感词类别不能为空', trigger: 'change' }],
    description: [{ max: 500, message: '描述不能超过500个字符', trigger: 'blur' }],
    status: [{ required: true, message: '启用状态不能为空', trigger: 'change' }]
  }
});

const testRules = {
  text: [{ required: true, message: '测试文本不能为空', trigger: 'blur' }]
};

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<SensitiveWordVO>(item => item.wordId!);
const { dialog, resetForm, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: sensitiveWordFormRef,
  initialFormData: initFormData
});
const { dialog: detailDialog, openDialog: openDetailDialog } = useDialogState('敏感词详情');
const detailForm = ref<SensitiveWordVO>({});

const getList = async () => {
  await withLoading(async () => {
    const res = await listSensitiveWord(queryParams.value);
    sensitiveWordList.value = res.data?.rows ?? [];
    total.value = res.data?.total ?? 0;
  });
};

const cancel = () => closeDialog();
const handleDialogClosed = () => resetForm();

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const { resetQuery } = useSearchReset({
  queryFormRef,
  queryParams,
  pageNumKey: 'pageNum',
  afterReset: () => handleQuery()
});

const handleAdd = () => {
  resetForm();
  form.value.status = 1;
  openDialog('添加敏感词');
};

const handleDetail = async (row: SensitiveWordVO) => {
  detailLoading.value = true;
  openDetailDialog();
  try {
    const res = await getSensitiveWord(row.wordId!);
    detailForm.value = res.data ?? {};
  } finally {
    detailLoading.value = false;
  }
};

const handleUpdate = async (row?: Partial<SensitiveWordVO>) => {
  resetForm();
  const wordId = row?.wordId ?? ids.value[0];
  const res = await getSensitiveWord(wordId);
  form.value = { ...(res.data ?? {}) };
  showDialog('修改敏感词');
};

const submitForm = () => {
  sensitiveWordFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    await withButtonLoading(async () => {
      if (form.value.wordId) {
        await updateSensitiveWord(form.value);
      } else {
        await addSensitiveWord(form.value);
      }
    });
    modal.msgSuccess('操作成功');
    closeDialog();
    await getList();
  });
};

const submitTestForm = () => {
  sensitiveWordTestRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    await withTestLoading(async () => {
      const res = await sensitiveWordTest(testForm.value);
      testResult.value = res.data;
    });
  });
};

const handleDelete = async (row?: Partial<SensitiveWordVO>) => {
  const wordIds = row?.wordId ?? ids.value;
  await modal.confirm(`是否确认删除敏感词编号为"${wordIds}"的数据项？`);
  await delSensitiveWord(wordIds as number | string);
  modal.msgSuccess('删除成功');
  await getList();
};

const handleRefreshCache = async () => {
  await modal.confirm('是否确认刷新缓存？');
  await refreshSensitiveWordCache();
  modal.msgSuccess('刷新成功');
};

const handleExport = () => {
  requestDownload('system/sensitiveWord/export', { ...queryParams.value }, `sensitiveWord_${Date.now()}.xlsx`);
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/components/page-shell' as pageShell;

@include pageShell.table-crud-page;
</style>