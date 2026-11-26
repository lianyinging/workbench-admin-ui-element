<template>
  <div class="p-2 app-container system-message-config-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>消息配置</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="queryParams.title"
            class="filter-control"
            placeholder="请输入标题"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="消息类型" prop="messageType">
          <el-select v-model="queryParams.messageType" class="filter-control" placeholder="请选择消息类型" clearable>
            <el-option
              v-for="item in messageTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item v-if="queryParams.messageType" label="支持平台" prop="supplierType">
          <el-select v-model="queryParams.supplierType" class="filter-control" placeholder="请选择支持平台" clearable>
            <el-option
              v-for="item in supplierTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" class="filter-control" placeholder="请选择状态" clearable>
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
          <el-button v-hasPermi="['system:messageConfig:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            v-hasPermi="['system:messageConfig:edit']"
            :disabled="single"
            icon="Edit"
            @click="handleUpdate()"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:messageConfig:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete()"
          >
            删除
          </el-button>
          <el-button v-hasPermi="['system:messageConfig:export']" type="warning" plain icon="Download" @click="handleExport">
            导出
          </el-button>
          <el-button v-hasPermi="['system:messageConfig:remove']" type="danger" plain icon="Refresh" @click="handleRefreshCache">
            刷新缓存
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
        :data="messageConfigList"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="标题" align="center" prop="title" fixed="left" />
        <el-table-column label="消息类型" align="center" prop="messageType">
          <template #default="scope">
            <dict-tag :options="messageTypeOptions" :value="scope.row.messageType" />
          </template>
        </el-table-column>
        <el-table-column label="支持平台标识" align="center" prop="supplierType">
          <template #default="scope">
            <dict-tag :options="supplierTypeOptions" :value="scope.row.supplierType" />
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column
          label="更新时间"
          align="center"
          prop="updateTime"
          width="180"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column
          label="创建时间"
          align="center"
          prop="createTime"
          width="180"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="160" fixed="right">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-hasPermi="['system:messageConfig:query']"
                type="primary"
                :underline="false"
                @click="handleDetail(scope.row)"
              >
                详情
              </el-link>
              <el-link
                v-hasPermi="['system:messageConfig:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-link
                v-hasPermi="['system:messageConfig:remove']"
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
      width="820px"
      append-to-body
      destroy-on-close
      top="5vh"
      @closed="handleDialogClosed"
    >
      <el-form ref="messageConfigFormRef" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="标题" prop="title">
              <el-input v-model.trim="form.title" placeholder="请输入标题" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消息类型" prop="messageType">
              <el-select v-model="form.messageType" placeholder="请选择消息类型" clearable filterable @change="handleMessageTypeChange">
                <el-option
                  v-for="item in messageTypeOptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="支持平台" prop="supplierType">
              <el-select v-model="form.supplierType" placeholder="请选择支持平台" clearable filterable>
                <el-option
                  v-for="item in getSupplierTypeMap(form.messageType)"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="Number(dict.value)">
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <FormFieldRenders
            :key="form.messageConfigId"
            v-model="form.configObject"
            :configs="activeMessageFieldConfig.supplierConfig"
            name="configObject"
            :form="form"
          />
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialog.visible" title="消息配置详情" width="860px" append-to-body>
      <FieldDescriptions
        :loading="detailLoading"
        :config-value="detailForm.configJson ?? '{}'"
        :field-configs="activeDetailFieldConfig.supplierConfig ?? {}"
      >
        <template #prefix>
          <el-descriptions-item label="消息设置id">{{ detailForm.messageConfigId }}</el-descriptions-item>
          <el-descriptions-item label="标题">{{ detailForm.title }}</el-descriptions-item>
          <el-descriptions-item label="消息类型">
            <dict-tag :options="messageTypeOptions" :value="detailForm.messageType" />
          </el-descriptions-item>
          <el-descriptions-item label="支持平台标识">
            <dict-tag :options="supplierTypeOptions" :value="detailForm.supplierType" />
          </el-descriptions-item>
        </template>
        <template #suffix>
          <el-descriptions-item label="状态">
            <dict-tag :options="sys_normal_disable" :value="detailForm.status" />
          </el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailForm.remark }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ parseTime(detailForm.updateTime) }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ parseTime(detailForm.createTime) }}</el-descriptions-item>
        </template>
      </FieldDescriptions>
    </el-dialog>
  </div>
</template>

<script setup name="MessageConfig" lang="ts">
import {
  addMessageConfig,
  delMessageConfig,
  getMessageConfig,
  getMessageFieldConfigs,
  getMessageSupplierType,
  listMessageConfig,
  refreshMessageConfigCache,
  updateMessageConfig
} from '@/api/system/messageConfig';
import type {
  MessageConfigForm,
  MessageConfigQuery,
  MessageConfigVO,
  MessageFieldConfig,
  MessageTypeVo
} from '@/api/system/messageConfig/types';
import FieldDescriptions from '@/components/field-config/FieldDescriptions.vue';
import FormFieldRenders from '@/components/field-config/FormFieldRenders';
import { useLoading } from '@/hooks/async/useLoading';
import { useDialogState } from '@/hooks/dialog/useDialogState';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';
import { download as requestDownload } from '@/utils/request';
import { parseTime } from '@/utils/ruoyi';

const { sys_normal_disable } = toRefs<any>(useDict('sys_normal_disable'));

const messageConfigList = ref<MessageConfigVO[]>([]);
const messageFieldConfigs = ref<Record<string, MessageFieldConfig>>({});
const supplierTypeList = ref<MessageTypeVo[]>([]);
const { loading, withLoading } = useLoading(true);
const { loading: buttonLoading, withLoading: withButtonLoading } = useLoading();
const total = ref(0);
const detailLoading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const messageConfigFormRef = ref<ElFormInstance>();

const initFormData: MessageConfigForm = {
  messageConfigId: undefined,
  title: undefined,
  messageType: undefined,
  supplierType: undefined,
  configObject: {},
  status: 1,
  remark: undefined
};

const data = reactive<PageData<MessageConfigForm, MessageConfigQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    title: undefined,
    messageType: undefined,
    supplierType: undefined,
    status: undefined
  },
  rules: {
    title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
    messageType: [{ required: true, message: '消息类型不能为空', trigger: 'change' }],
    supplierType: [{ required: true, message: '支持平台标识不能为空', trigger: 'change' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<MessageConfigVO>(
  item => item.messageConfigId!
);

const { dialog, resetForm, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: messageConfigFormRef,
  initialFormData: initFormData
});
const { dialog: detailDialog, openDialog: openDetailDialog } = useDialogState('消息配置详情');
const detailForm = ref<MessageConfigVO>({});

const messageTypeOptions = computed(() =>
  supplierTypeList.value.map(item => ({
    label: item.description,
    value: item.messageType,
    elTagType: 'primary'
  }))
);

const supplierTypeOptions = computed(() =>
  supplierTypeList.value.flatMap(item =>
    Object.entries(item.supplierTypeMap).map(([value, label]) => ({
      label,
      value,
      elTagType: 'primary'
    }))
  )
);

const getSupplierTypeMap = (messageType?: string) => {
  const supplierTypeMap = supplierTypeList.value.find(item => item.messageType === messageType)?.supplierTypeMap;
  if (!supplierTypeMap) {
    return [];
  }
  return Object.entries(supplierTypeMap).map(([value, label]) => ({
    value,
    label,
    elTagType: 'primary'
  }));
};

const activeMessageFieldConfig = computed<MessageFieldConfig>(() => {
  if (!form.value.supplierType) {
    return { supplierConfig: {}, messageType: 'SMS', templateMode: { supportTemplateId: false, supportTemplateContent: false } };
  }
  return messageFieldConfigs.value[form.value.supplierType] ?? {
    supplierConfig: {},
    messageType: 'SMS',
    templateMode: { supportTemplateId: false, supportTemplateContent: false }
  };
});

const activeDetailFieldConfig = computed<MessageFieldConfig>(() => {
  if (!detailForm.value.supplierType) {
    return { supplierConfig: {}, messageType: 'SMS', templateMode: { supportTemplateId: false, supportTemplateContent: false } };
  }
  return messageFieldConfigs.value[detailForm.value.supplierType] ?? {
    supplierConfig: {},
    messageType: 'SMS',
    templateMode: { supportTemplateId: false, supportTemplateContent: false }
  };
});

const getList = async () => {
  await withLoading(async () => {
    const res = await listMessageConfig(queryParams.value);
    messageConfigList.value = res.data?.rows ?? [];
    total.value = res.data?.total ?? 0;
  });
};

const handleSortChange = (column: { prop: string; order: 'ascending' | 'descending' | null }) => {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order ?? undefined;
  getList();
};

const handleMessageTypeChange = () => {
  form.value.supplierType = undefined;
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
  form.value.configObject = {};
  openDialog('添加消息配置');
};

const handleDetail = async (row: MessageConfigVO) => {
  detailLoading.value = true;
  openDetailDialog();
  try {
    const res = await getMessageConfig(row.messageConfigId!);
    detailForm.value = res.data ?? {};
  } finally {
    detailLoading.value = false;
  }
};

const handleUpdate = async (row?: Partial<MessageConfigVO>) => {
  resetForm();
  const messageConfigId = row?.messageConfigId ?? ids.value[0];
  const res = await getMessageConfig(messageConfigId);
  const payload = res.data ?? {};
  form.value = {
    ...payload,
    configObject: payload.configJson ? JSON.parse(payload.configJson as string) : {}
  };
  showDialog('修改消息配置');
};

const submitForm = () => {
  messageConfigFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    await withButtonLoading(async () => {
      const submitData = {
        ...form.value,
        configJson: JSON.stringify(form.value.configObject ?? {})
      };
      if (form.value.messageConfigId) {
        await updateMessageConfig(submitData);
      } else {
        await addMessageConfig(submitData);
      }
    });
    modal.msgSuccess('操作成功');
    closeDialog();
    await getList();
  });
};

const handleDelete = async (row?: Partial<MessageConfigVO>) => {
  const messageConfigIds = row?.messageConfigId ?? ids.value;
  await modal.confirm(`是否确认删除消息配置编号为"${messageConfigIds}"的数据项？`);
  await delMessageConfig(messageConfigIds as number | string);
  modal.msgSuccess('删除成功');
  await getList();
};

const handleRefreshCache = async () => {
  await modal.confirm('是否确认刷新消息模板缓存？');
  await refreshMessageConfigCache();
  modal.msgSuccess('刷新成功');
};

const handleExport = () => {
  requestDownload('system/messageConfig/export', { ...queryParams.value }, `messageConfig_${Date.now()}.xlsx`);
};

const initMessageFieldConfigs = async () => {
  const [fieldRes, supplierRes] = await Promise.all([getMessageFieldConfigs(), getMessageSupplierType()]);
  messageFieldConfigs.value = fieldRes.data ?? {};
  supplierTypeList.value = supplierRes.data ?? [];
};

onMounted(() => {
  initMessageFieldConfigs();
  getList();
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/components/page-shell' as pageShell;

@include pageShell.table-crud-page;
</style>