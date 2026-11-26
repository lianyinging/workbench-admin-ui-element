<template>
  <div class="p-2 app-container system-storage-config-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>存储配置</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="配置名称" prop="name">
          <el-input
            v-model="queryParams.name"
            class="filter-control"
            placeholder="请输入配置名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="平台" prop="platform">
          <el-select v-model="queryParams.platform" class="filter-control" placeholder="请选择平台" clearable>
            <el-option v-for="item in allStoragePlatform" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态" prop="status">
          <el-select v-model="queryParams.status" class="filter-control" placeholder="请选择启用状态" clearable>
            <el-option v-for="dict in sys_normal_disable" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="请求模式" prop="requestMode">
          <el-select v-model="queryParams.requestMode" class="filter-control" placeholder="请选择请求模式" clearable>
            <el-option
              v-for="dict in sys_storage_request_mode"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="list-toolbar">
        <div class="list-toolbar__left">
          <el-button v-hasPermi="['system:storageConfig:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            v-hasPermi="['system:storageConfig:edit']"
            :disabled="single"
            icon="Edit"
            @click="handleUpdate()"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:storageConfig:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete()"
          >
            删除
          </el-button>
          <el-button v-hasPermi="['system:storageConfig:export']" type="warning" plain icon="Download" @click="handleExport">
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
        :data="storageConfigList"
        row-key="storageConfigId"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="配置名称" align="center" prop="name" fixed="left" />
        <el-table-column label="平台" align="center" prop="platform">
          <template #default="scope">
            <dict-tag :options="allStoragePlatform" :value="scope.row.platform" />
          </template>
        </el-table-column>
        <el-table-column label="负载均衡权重" align="center" prop="weight" />
        <el-table-column label="启用状态" align="center" prop="status" width="90">
          <template #default="scope">
            <el-tag :type="scope.row.status === 1 ? 'success' : 'info'" effect="plain">
              {{ scope.row.status === 1 ? '启用' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="请求模式" align="center" prop="requestMode">
          <template #default="scope">
            <dict-tag :options="sys_storage_request_mode" :value="scope.row.requestMode" />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="180">
          <template #default="scope">{{ parseTime(scope.row.createTime) }}</template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="180">
          <template #default="scope">{{ parseTime(scope.row.updateTime) }}</template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column label="操作" align="center" width="240" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-hasPermi="['system:storageConfig:query']"
                type="primary"
                :underline="false"
                @click="handleDetail(scope.row)"
              >
                详情
              </el-link>
              <el-link
                v-hasPermi="['system:storageConfig:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-popconfirm
                v-if="scope.row.status !== 1"
                v-hasPermi="['system:storageConfig:edit']"
                :title="`确认启用配置「${scope.row.name}」？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="220"
                @confirm="applyStatusChange(scope.row, 1)"
              >
                <template #reference>
                  <el-link type="primary" :underline="false">启用</el-link>
                </template>
              </el-popconfirm>
              <el-popconfirm
                v-else
                v-hasPermi="['system:storageConfig:edit']"
                :title="`确认停用配置「${scope.row.name}」？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="220"
                @confirm="applyStatusChange(scope.row, 0)"
              >
                <template #reference>
                  <el-link type="danger" :underline="false">停用</el-link>
                </template>
              </el-popconfirm>
              <el-link
                v-hasPermi="['system:storageConfig:remove']"
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
      width="1000px"
      append-to-body
      destroy-on-close
      top="5vh"
      @closed="handleDialogClosed"
    >
      <el-form ref="storageConfigFormRef" :model="form" :rules="rules" label-width="120px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="配置名称" prop="name">
              <el-input v-model.trim="form.name" placeholder="请输入配置名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="平台" prop="platform">
              <el-select v-model="form.platform" placeholder="请选择平台" clearable filterable>
                <el-option v-for="item in supportPlatform" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负载均衡权重" prop="weight">
              <el-input-number v-model="form.weight" :min="0" controls-position="right" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="启用状态" prop="status">
              <el-switch v-model="form.status" :active-value="1" :inactive-value="0" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="请求模式" prop="requestMode">
              <el-select v-model="form.requestMode" placeholder="请选择请求模式" clearable style="width: 100%">
                <el-option
                  v-for="dict in sys_storage_request_mode"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <FormFieldRenders
            :key="form.storageConfigId"
            v-model="form.configObject"
            :configs="currentStoragePlatformConfigs"
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
        <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialog.visible" title="存储配置详情" width="860px" append-to-body>
      <FieldDescriptions
        :loading="detailLoading"
        :config-value="detailForm.configJson ?? '{}'"
        :field-configs="detailPlatformConfigs"
      >
        <template #prefix>
          <el-descriptions-item label="主键">{{ detailForm.storageConfigId }}</el-descriptions-item>
          <el-descriptions-item label="配置名称">{{ detailForm.name }}</el-descriptions-item>
          <el-descriptions-item label="平台">
            <dict-tag :options="allStoragePlatform" :value="detailForm.platform" />
          </el-descriptions-item>
          <el-descriptions-item label="负载均衡权重">{{ detailForm.weight }}</el-descriptions-item>
          <el-descriptions-item label="启用状态">
            <dict-tag :options="sys_normal_disable" :value="detailForm.status" />
          </el-descriptions-item>
          <el-descriptions-item label="请求模式">
            <dict-tag :options="sys_storage_request_mode" :value="detailForm.requestMode" />
          </el-descriptions-item>
        </template>
        <template #suffix>
          <el-descriptions-item label="创建时间">{{ parseTime(detailForm.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{ parseTime(detailForm.updateTime) }}</el-descriptions-item>
          <el-descriptions-item label="备注" :span="2">{{ detailForm.remark }}</el-descriptions-item>
        </template>
      </FieldDescriptions>
    </el-dialog>
  </div>
</template>

<script setup name="StorageConfig" lang="ts">
import type { FieldConfig, FieldOption } from '@/api/fieldConfig/types';
import {
  addStorageConfig,
  delStorageConfig,
  getAllStoragePlatform,
  getStorageConfig,
  getStoragePlatformConfigs,
  getSupportPlatform,
  listStorageConfig,
  updateStorageConfig,
  updateStorageStatus
} from '@/api/system/storageConfig';
import type { StorageConfigForm, StorageConfigQuery, StorageConfigVO } from '@/api/system/storageConfig/types';
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

const { sys_storage_request_mode, sys_normal_disable } = toRefs<any>(
  useDict('sys_storage_request_mode', 'sys_normal_disable')
);

const storageConfigList = ref<StorageConfigVO[]>([]);
const allStoragePlatform = ref<FieldOption[]>([]);
const supportPlatform = ref<FieldOption[]>([]);
const storagePlatformConfigs = ref<Record<string, Record<string, FieldConfig<any>>>>({});
const { loading, withLoading } = useLoading(true);
const { loading: buttonLoading, withLoading: withButtonLoading } = useLoading();
const total = ref(0);
const detailLoading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const storageConfigFormRef = ref<ElFormInstance>();

const initFormData: StorageConfigForm = {
  storageConfigId: undefined,
  name: undefined,
  platform: undefined,
  weight: 1,
  status: 1,
  requestMode: undefined,
  configObject: {},
  remark: undefined
};

const data = reactive<PageData<StorageConfigForm, StorageConfigQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    platform: undefined,
    status: undefined,
    requestMode: undefined
  },
  rules: {
    name: [
      { required: true, message: '配置名称不能为空', trigger: 'blur' },
      { max: 255, message: '配置名称不能超过255个字符', trigger: 'blur' }
    ],
    platform: [{ required: true, message: '平台不能为空', trigger: 'change' }],
    weight: [{ required: true, message: '负载均衡权重不能为空', trigger: 'blur' }],
    status: [{ required: true, message: '启用状态不能为空', trigger: 'change' }],
    requestMode: [{ required: true, message: '请求模式不能为空', trigger: 'change' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<StorageConfigVO>(item => item.storageConfigId!);
const { dialog, resetForm, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: storageConfigFormRef,
  initialFormData: initFormData
});
const { dialog: detailDialog, openDialog: openDetailDialog } = useDialogState('存储配置详情');
const detailForm = ref<StorageConfigVO>({});

const currentStoragePlatformConfigs = computed(() => {
  if (!form.value.platform) {
    return {};
  }
  return storagePlatformConfigs.value[form.value.platform] ?? {};
});

const detailPlatformConfigs = computed(() => {
  if (!detailForm.value.platform) {
    return {};
  }
  return storagePlatformConfigs.value[detailForm.value.platform] ?? {};
});

const getList = async () => {
  await withLoading(async () => {
    const res = await listStorageConfig(queryParams.value);
    storageConfigList.value = res.data?.rows ?? [];
    total.value = res.data?.total ?? 0;
  });
};

const initStoragePlatformInfo = async () => {
  const [allRes, supportRes, configRes] = await Promise.all([
    getAllStoragePlatform(),
    getSupportPlatform(),
    getStoragePlatformConfigs()
  ]);
  allStoragePlatform.value =
    allRes.data?.map(item => ({ ...item, elTagType: 'primary' })) ?? [];
  supportPlatform.value = supportRes.data ?? [];
  storagePlatformConfigs.value = configRes.data ?? {};
};

const applyStatusChange = (row: StorageConfigVO, status: number) => {
  row.status = status;
  return handleStatusChange(row);
};

const handleStatusChange = async (row: StorageConfigVO) => {
  const text = row.status === 1 ? '启用' : '停用';
  try {
    await updateStorageStatus(row.storageConfigId!, row.status!);
    modal.msgSuccess(`${text}成功`);
    await getList();
  } catch {
    row.status = row.status === 1 ? 0 : 1;
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
  afterReset: () => handleQuery()
});

const handleAdd = () => {
  resetForm();
  form.value.status = 1;
  form.value.weight = 1;
  form.value.configObject = {};
  openDialog('添加存储配置');
};

const handleDetail = async (row: StorageConfigVO) => {
  detailLoading.value = true;
  openDetailDialog();
  try {
    const res = await getStorageConfig(row.storageConfigId!);
    detailForm.value = res.data ?? {};
  } finally {
    detailLoading.value = false;
  }
};

const handleUpdate = async (row?: Partial<StorageConfigVO>) => {
  resetForm();
  const storageConfigId = row?.storageConfigId ?? ids.value[0];
  const res = await getStorageConfig(storageConfigId);
  const payload = res.data ?? {};
  form.value = {
    ...payload,
    configObject: payload.configObject ?? (payload.configJson ? JSON.parse(payload.configJson) : {})
  };
  showDialog('修改存储配置');
};

const submitForm = () => {
  storageConfigFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    await withButtonLoading(async () => {
      const submitData = {
        ...form.value,
        configJson: JSON.stringify(form.value.configObject ?? {})
      };
      if (form.value.storageConfigId) {
        await updateStorageConfig(submitData);
      } else {
        await addStorageConfig(submitData);
      }
    });
    modal.msgSuccess('操作成功');
    closeDialog();
    await getList();
  });
};

const handleDelete = async (row?: Partial<StorageConfigVO>) => {
  const storageConfigIds = row?.storageConfigId ?? ids.value;
  await modal.confirm(`是否确认删除存储配置编号为"${storageConfigIds}"的数据项？`);
  await delStorageConfig(storageConfigIds as number | string);
  modal.msgSuccess('删除成功');
  await getList();
};

const handleExport = () => {
  requestDownload('system/storageConfig/export', { ...queryParams.value }, `storageConfig_${Date.now()}.xlsx`);
};

onMounted(() => {
  initStoragePlatformInfo();
  getList();
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/components/page-shell' as pageShell;

@include pageShell.table-crud-page;
</style>