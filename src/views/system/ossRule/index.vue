<template>
  <div class="p-2 app-container system-oss-rule-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>OSS处理规则</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input
            v-model="queryParams.ruleName"
            class="filter-control"
            placeholder="请输入规则名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="匹配域名" prop="domain">
          <el-input
            v-model="queryParams.domain"
            class="filter-control"
            placeholder="请输入匹配域名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="媒体类型" prop="mimeType">
          <el-input
            v-model="queryParams.mimeType"
            class="filter-control"
            placeholder="请输入媒体类型"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="覆盖字段值" prop="isOverwrite">
          <el-select v-model="queryParams.isOverwrite" class="filter-control" placeholder="请选择" clearable>
            <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-select v-model="queryParams.isDefault" class="filter-control" placeholder="请选择" clearable>
            <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
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
          <el-button v-hasPermi="['system:ossRule:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            v-hasPermi="['system:ossRule:edit']"
            :disabled="single"
            icon="Edit"
            @click="handleUpdate()"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:ossRule:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete()"
          >
            删除
          </el-button>
          <el-button
            v-hasPermi="['system:ossRule:add', 'system:ossRule:edit', 'system:ossRule:remove']"
            type="danger"
            plain
            icon="Refresh"
            @click="handleRefreshCache"
          >
            刷新缓存
          </el-button>
          <el-button v-hasPermi="['system:ossRule:export']" type="warning" plain icon="Download" @click="handleExport">
            导出
          </el-button>
        </div>
        <div class="list-toolbar__right">
          <el-button circle icon="Refresh" title="刷新" @click="getList" />
        </div>
      </div>

      <el-table
        v-loading="loading"
        border
        class="data-table"
        :data="ossRuleList"
        row-key="ossRuleId"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="规则名称" align="center" prop="ruleName" fixed="left" />
        <el-table-column label="匹配域名" align="center" prop="domain" :show-overflow-tooltip="true" />
        <el-table-column label="媒体类型" align="center" prop="mimeType" />
        <el-table-column label="覆盖字段值" align="center" prop="isOverwrite" width="110">
          <template #default="scope">
            <dict-tag :options="sys_yes_no" :value="scope.row.isOverwrite" />
          </template>
        </el-table-column>
        <el-table-column label="是否默认" align="center" prop="isDefault">
          <template #default="scope">
            <dict-tag :options="sys_yes_no" :value="scope.row.isDefault" />
          </template>
        </el-table-column>
        <el-table-column label="启用状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column
          label="规则顺序"
          align="center"
          prop="ruleSort"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
        />
        <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
          <template #default="scope">{{ parseTime(scope.row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">{{ parseTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="260" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-hasPermi="['system:ossRule:query']"
                type="primary"
                :underline="false"
                @click="handleDetail(scope.row)"
              >
                详情
              </el-link>
              <el-link
                v-hasPermi="['system:ossRule:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-popconfirm
                v-if="scope.row.isOverwrite !== 'Y'"
                v-hasPermi="['system:ossRule:edit']"
                :title="`确认设置规则「${scope.row.ruleName}」为覆盖默认字段值？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="260"
                @confirm="applyOverwriteChange(scope.row, 'Y')"
              >
                <template #reference>
                  <el-link type="primary" :underline="false">设为覆盖</el-link>
                </template>
              </el-popconfirm>
              <el-popconfirm
                v-else
                v-hasPermi="['system:ossRule:edit']"
                :title="`确认设置规则「${scope.row.ruleName}」为不覆盖默认字段值？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="260"
                @confirm="applyOverwriteChange(scope.row, 'N')"
              >
                <template #reference>
                  <el-link type="danger" :underline="false">取消覆盖</el-link>
                </template>
              </el-popconfirm>
              <el-link
                v-hasPermi="['system:ossRule:remove']"
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
      width="680px"
      append-to-body
      destroy-on-close
      @closed="handleDialogClosed"
    >
      <el-form ref="ossRuleFormRef" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="规则名称" prop="ruleName">
          <el-input v-model.trim="form.ruleName" placeholder="请输入规则名称" clearable />
        </el-form-item>
        <el-form-item label="匹配域名" prop="domain">
          <el-input v-model.trim="form.domain" placeholder="请输入匹配域名" clearable />
        </el-form-item>
        <el-form-item label="媒体类型" prop="mimeType">
          <el-input v-model.trim="form.mimeType" placeholder="请输入媒体类型" clearable />
        </el-form-item>
        <el-form-item label="规则" prop="rule">
          <el-input ref="ruleInputRef" v-model.trim="form.rule" class="rule-field" type="textarea" :rows="4" placeholder="请输入规则" />
        </el-form-item>
        <el-form-item label="变量插入">
          <el-button v-for="rule in ossRules" :key="rule" size="small" plain @click="insertRuleData(rule)">
            {{ rule.substring(0, 1).toUpperCase() + rule.substring(1) }}
          </el-button>
        </el-form-item>
        <el-form-item label="是否默认" prop="isDefault">
          <el-switch v-model="form.isDefault" active-value="Y" inactive-value="N" />
        </el-form-item>
        <el-form-item label="启用状态" prop="status">
          <el-switch v-model="form.status" active-value="1" inactive-value="0" />
        </el-form-item>
        <el-form-item label="规则顺序" prop="ruleSort">
          <el-input-number v-model="form.ruleSort" :min="0" controls-position="right" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialog.visible" title="OSS处理规则详情" width="700px" append-to-body>
      <el-skeleton :loading="detailLoading" animated>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="规则id">{{ detailForm.ossRuleId }}</el-descriptions-item>
          <el-descriptions-item label="规则名称">{{ detailForm.ruleName }}</el-descriptions-item>
          <el-descriptions-item label="匹配域名">{{ detailForm.domain }}</el-descriptions-item>
          <el-descriptions-item label="媒体类型">{{ detailForm.mimeType }}</el-descriptions-item>
          <el-descriptions-item label="规则" :span="2">{{ detailForm.rule }}</el-descriptions-item>
          <el-descriptions-item label="覆盖默认字段值">
            <dict-tag :options="sys_yes_no" :value="detailForm.isOverwrite" />
          </el-descriptions-item>
          <el-descriptions-item label="是否默认">
            <dict-tag :options="sys_yes_no" :value="detailForm.isDefault" />
          </el-descriptions-item>
          <el-descriptions-item label="启用状态">
            <dict-tag :options="sys_normal_disable" :value="detailForm.status" />
          </el-descriptions-item>
          <el-descriptions-item label="规则顺序">{{ detailForm.ruleSort }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ parseTime(detailForm.updateTime) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(detailForm.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailForm.remark }}</el-descriptions-item>
        </el-descriptions>
      </el-skeleton>
    </el-dialog>
  </div>
</template>

<script setup name="OssRule" lang="ts">
import {
  addOssRule,
  changeOssRuleOverwrite,
  delOssRule,
  getOssRule,
  listOssRule,
  refreshOssRuleCache,
  updateOssRule
} from '@/api/system/ossRule';
import type { OssRuleForm, OssRuleQuery, OssRuleVO } from '@/api/system/ossRule/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useDialogState } from '@/hooks/dialog/useDialogState';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';
import { download as requestDownload } from '@/utils/request';
import { parseTime } from '@/utils/ruoyi';

const { sys_yes_no, sys_normal_disable } = toRefs<any>(useDict('sys_yes_no', 'sys_normal_disable'));

const ossRules = ['domain', 'path', 'fullPath', 'filename', 'url', 'fullUrl', 'query'];
const ossRuleList = ref<OssRuleVO[]>([]);
const { loading, withLoading } = useLoading(true);
const { loading: buttonLoading, withLoading: withButtonLoading } = useLoading();
const total = ref(0);
const detailLoading = ref(false);
const ruleInputRef = ref();

const queryFormRef = ref<ElFormInstance>();
const ossRuleFormRef = ref<ElFormInstance>();

const initFormData: OssRuleForm = {
  ossRuleId: undefined,
  ruleName: undefined,
  domain: undefined,
  mimeType: undefined,
  rule: undefined,
  isOverwrite: 'N',
  isDefault: 'N',
  status: '1',
  ruleSort: 0,
  remark: undefined
};

const data = reactive<PageData<OssRuleForm, OssRuleQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    ruleName: undefined,
    domain: undefined,
    mimeType: undefined,
    isOverwrite: undefined,
    isDefault: undefined,
    status: undefined
  },
  rules: {
    ruleName: [{ required: true, message: '规则名称不能为空', trigger: 'blur' }],
    domain: [{ required: true, message: '匹配域名不能为空', trigger: 'blur' }],
    mimeType: [{ required: true, message: '媒体类型不能为空', trigger: 'blur' }],
    rule: [{ required: true, message: '规则不能为空', trigger: 'blur' }],
    isDefault: [{ required: true, message: '是否默认不能为空', trigger: 'change' }],
    status: [{ required: true, message: '启用状态不能为空', trigger: 'change' }],
    ruleSort: [{ required: true, message: '规则顺序不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<OssRuleVO>(item => item.ossRuleId!);
const { dialog, resetForm, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: ossRuleFormRef,
  initialFormData: initFormData
});
const { dialog: detailDialog, openDialog: openDetailDialog } = useDialogState('OSS处理规则详情');
const detailForm = ref<OssRuleVO>({});

const getList = async () => {
  await withLoading(async () => {
    const res = await listOssRule(queryParams.value);
    ossRuleList.value = res.data?.rows ?? [];
    total.value = res.data?.total ?? 0;
  });
};

const handleSortChange = (column: { prop: string; order: 'ascending' | 'descending' | null }) => {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order ?? undefined;
  getList();
};

const insertRuleData = (value: string) => {
  const token = `#{#${value}}`;
  const textarea = ruleInputRef.value?.textarea as HTMLTextAreaElement | undefined;
  if (!textarea) {
    form.value.rule = `${form.value.rule ?? ''}${token}`;
    return;
  }
  const startPos = textarea.selectionStart ?? 0;
  const endPos = textarea.selectionEnd ?? 0;
  const startStr = form.value.rule?.substring(0, startPos) ?? '';
  const endStr = form.value.rule?.substring(endPos) ?? '';
  form.value.rule = startStr + token + endStr;
  nextTick(() => {
    const index = startPos + token.length;
    textarea.setSelectionRange(index, index);
    textarea.focus();
  });
};

const applyOverwriteChange = (row: OssRuleVO, isOverwrite: string) => {
  row.isOverwrite = isOverwrite;
  return handleOverwriteChange(row);
};

const handleOverwriteChange = async (row: OssRuleVO) => {
  const target = ossRuleList.value.find(item => item.ossRuleId === row.ossRuleId);
  if (!target) {
    return;
  }
  target.isOverwrite = row.isOverwrite;
  const text = target.isOverwrite === 'Y' ? '覆盖默认字段值' : '不覆盖默认字段值';
  try {
    await changeOssRuleOverwrite(target.ossRuleId!, target.isOverwrite!);
    modal.msgSuccess(`已设置规则为"${text}"`);
    await getList();
  } catch {
    target.isOverwrite = target.isOverwrite === 'Y' ? 'N' : 'Y';
  }
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
  afterReset: () => {
    queryParams.value.orderByColumn = undefined;
    queryParams.value.isAsc = undefined;
    handleQuery();
  }
});

const handleAdd = () => {
  resetForm();
  form.value.isOverwrite = 'N';
  form.value.isDefault = 'N';
  form.value.status = '1';
  form.value.ruleSort = 0;
  openDialog('添加OSS处理规则');
};

const handleDetail = async (row: OssRuleVO) => {
  detailLoading.value = true;
  openDetailDialog();
  try {
    const res = await getOssRule(row.ossRuleId!);
    detailForm.value = res.data ?? {};
  } finally {
    detailLoading.value = false;
  }
};

const handleUpdate = async (row?: Partial<OssRuleVO>) => {
  resetForm();
  const ossRuleId = row?.ossRuleId ?? ids.value[0];
  const res = await getOssRule(ossRuleId);
  form.value = { ...(res.data ?? {}) };
  showDialog('修改OSS处理规则');
};

const submitForm = () => {
  ossRuleFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    await withButtonLoading(async () => {
      if (form.value.ossRuleId) {
        await updateOssRule(form.value);
      } else {
        await addOssRule(form.value);
      }
    });
    modal.msgSuccess('操作成功');
    closeDialog();
    await getList();
  });
};

const handleDelete = async (row?: Partial<OssRuleVO>) => {
  const ossRuleIds = row?.ossRuleId ?? ids.value;
  await modal.confirm(`是否确认删除OSS处理规则编号为"${ossRuleIds}"的数据项？`);
  await delOssRule(ossRuleIds as number | string);
  modal.msgSuccess('删除成功');
  await getList();
};

const handleRefreshCache = async () => {
  await modal.confirm('是否确认刷新OSS处理规则缓存？');
  await refreshOssRuleCache();
  modal.msgSuccess('刷新成功');
};

const handleExport = () => {
  requestDownload('system/ossRule/export', { ...queryParams.value }, `ossRule_${Date.now()}.xlsx`);
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/components/page-shell' as pageShell;

@include pageShell.table-crud-page;
</style>