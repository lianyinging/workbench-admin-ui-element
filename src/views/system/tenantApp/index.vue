<template>
  <div class="p-2 app-container system-tenant-app-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>租户应用列表</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="应用类型" prop="appType">
          <el-select v-model="queryParams.appType" class="filter-control" placeholder="请选择应用类型" clearable>
            <el-option v-for="dict in sys_app_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="应用key" prop="appKey">
          <el-input
            v-model="queryParams.appKey"
            class="filter-control"
            placeholder="请输入应用key"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="应用名称" prop="appName">
          <el-input
            v-model="queryParams.appName"
            class="filter-control"
            placeholder="请输入应用名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="list-toolbar">
        <div class="list-toolbar__left">
          <el-button v-hasPermi="['system:tenantApp:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            v-hasPermi="['system:tenantApp:edit']"
            :disabled="single"
            icon="Edit"
            @click="handleUpdate()"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:tenantApp:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete()"
          >
            删除
          </el-button>
          <el-button
            v-hasPermi="['system:tenantApp:export']"
            type="warning"
            plain
            icon="Download"
            @click="handleExport"
          >
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
        row-key="appid"
        :data="tenantAppList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="应用类型" align="center" prop="appType">
          <template #default="scope">
            <dict-tag :options="sys_app_type" :value="scope.row.appType" />
          </template>
        </el-table-column>
        <el-table-column label="应用key" align="center" prop="appKey" show-overflow-tooltip />
        <el-table-column label="应用名称" align="center" prop="appName" show-overflow-tooltip fixed="left" />
        <el-table-column label="更新时间" align="center" prop="updateTime" width="170">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="170">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
        <el-table-column label="操作" align="center" width="200" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-hasPermi="['system:tenantApp:query']"
                type="primary"
                :underline="false"
                @click="handleDetail(scope.row)"
              >
                详情
              </el-link>
              <el-link
                v-hasPermi="['system:tenantApp:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-link
                v-hasPermi="['system:tenantApp:remove']"
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

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="500px" append-to-body destroy-on-close @closed="resetForm">
      <el-form ref="tenantAppFormRef" v-loading="formLoading" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="应用名称" prop="appName">
          <el-input v-model="form.appName" placeholder="请输入应用名称" clearable />
        </el-form-item>
        <el-form-item label="应用类型" prop="appType">
          <el-select v-model="form.appType" placeholder="请选择应用类型" clearable class="w-full">
            <el-option v-for="dict in sys_app_type" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item prop="appKey">
          <template #label>
            <span>
              <el-tooltip content="请求头 X-APP-KEY" placement="top">
                <el-icon><question-filled /></el-icon>
              </el-tooltip>
              应用key
            </span>
          </template>
          <el-input v-model="form.appKey" placeholder="请输入应用key" clearable />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="openView" title="租户应用管理详情" width="700px" append-to-body>
      <el-descriptions v-loading="openViewLoading" :column="2" border>
        <el-descriptions-item label="应用id">{{ detailForm.appid }}</el-descriptions-item>
        <el-descriptions-item label="应用类型">
          <dict-tag :options="sys_app_type" :value="detailForm.appType" />
        </el-descriptions-item>
        <el-descriptions-item label="应用key">{{ detailForm.appKey }}</el-descriptions-item>
        <el-descriptions-item label="应用名称">{{ detailForm.appName }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(detailForm.updateTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detailForm.createTime) }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailForm.remark }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="TenantApp" lang="ts">
import { addTenantApp, delTenantApp, getTenantApp, listTenantApp, updateTenantApp } from '@/api/system/tenantApp';
import type { TenantAppForm, TenantAppQuery, TenantAppVO } from '@/api/system/tenantApp/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';
import { download as requestDownload } from '@/utils/request';

const { sys_app_type } = toRefs<any>(useDict('sys_app_type'));

const tenantAppList = ref<TenantAppVO[]>([]);
const { loading, withLoading } = useLoading(true);
const { loading: buttonLoading, withLoading: withButtonLoading } = useLoading();
const { loading: formLoading, withLoading: withFormLoading } = useLoading();
const { ids, single, multiple, handleSelectionChange } = useTableSelection<TenantAppVO>(item => item.appid!);
const total = ref(0);
const openView = ref(false);
const openViewLoading = ref(false);
const detailForm = ref<TenantAppVO>({});

const queryFormRef = ref<ElFormInstance>();
const tenantAppFormRef = ref<ElFormInstance>();

const initFormData: TenantAppForm = {};
const data = reactive<PageData<TenantAppForm, TenantAppQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    appType: undefined,
    appKey: undefined,
    appName: undefined
  },
  rules: {
    appType: [{ required: true, message: '应用类型不能为空', trigger: 'change' }],
    appKey: [{ required: true, message: '应用key不能为空', trigger: 'blur' }],
    appName: [{ required: true, message: '应用名称不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const { dialog, resetForm, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: tenantAppFormRef,
  initialFormData: initFormData
});
const { resetQuery } = useSearchReset({
  queryFormRef,
  queryParams,
  pageNumKey: 'pageNum',
  afterReset: () => handleQuery()
});

const getList = async () => {
  await withLoading(async () => {
    const res = await listTenantApp(queryParams.value);
    tenantAppList.value = res.data?.rows ?? [];
    total.value = res.data?.total ?? 0;
  });
};

const cancel = () => {
  closeDialog();
  resetForm();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const handleAdd = () => {
  resetForm();
  openDialog('添加租户应用管理');
};

const handleDetail = async (row: TenantAppVO) => {
  openView.value = true;
  openViewLoading.value = true;
  try {
    const res = await getTenantApp(row.appid!);
    detailForm.value = res.data ?? {};
  } finally {
    openViewLoading.value = false;
  }
};

const handleUpdate = async (row?: TenantAppVO) => {
  resetForm();
  const appid = row?.appid ?? ids.value[0];
  await withFormLoading(async () => {
    const res = await getTenantApp(appid);
    Object.assign(form.value, res.data ?? {});
  });
  showDialog('修改租户应用管理');
};

const submitForm = () => {
  tenantAppFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    await withButtonLoading(async () => {
      if (form.value.appid) {
        await updateTenantApp(form.value);
      } else {
        await addTenantApp(form.value);
      }
    });
    modal.msgSuccess(form.value.appid ? '修改成功' : '新增成功');
    closeDialog();
    await getList();
  });
};

const handleDelete = async (row?: TenantAppVO) => {
  const appids = row?.appid ?? ids.value;
  await modal.confirm(`是否确认删除租户应用管理编号为${appids}的数据项？`);
  await delTenantApp(appids);
  modal.msgSuccess('删除成功');
  await getList();
};

const handleExport = () => {
  requestDownload('system/tenantApp/export', { ...queryParams.value }, `tenantApp_${Date.now()}.xlsx`);
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.w-full {
  width: 100%;
}
</style>