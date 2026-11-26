<template>
  <div class="p-2 app-container system-tenant-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>租户列表</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" label-width="85px" class="query-form filter-bar">
        <el-form-item label="租户编号" prop="tenantId">
          <el-input
            v-model="queryParams.tenantId"
            class="filter-control"
            placeholder="请输入租户编号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="联系人" prop="contactUserName">
          <el-input
            v-model="queryParams.contactUserName"
            class="filter-control"
            placeholder="请输入联系人"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="联系电话" prop="contactPhone">
          <el-input
            v-model="queryParams.contactPhone"
            class="filter-control"
            placeholder="请输入联系电话"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="企业名称" prop="companyName">
          <el-input
            v-model="queryParams.companyName"
            class="filter-control"
            placeholder="请输入企业名称"
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
          <el-button v-hasPermi="['system:tenant:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            v-hasPermi="['system:tenant:edit']"
            :disabled="single"
            icon="Edit"
            @click="handleUpdate()"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:tenant:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete()"
          >
            删除
          </el-button>
          <el-button v-hasPermi="['system:tenant:export']" type="warning" plain icon="Download" @click="handleExport">
            导出
          </el-button>
          <el-button
            v-if="String(userStore.userId) === '1'"
            type="success"
            plain
            icon="Refresh"
            @click="handleSyncTenantConfig"
          >
            同步租户参数配置
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
        :data="tenantList"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="租户编号" align="center" prop="tenantId" />
        <el-table-column label="联系人" align="center" prop="contactUserName" />
        <el-table-column label="联系电话" align="center" prop="contactPhone" />
        <el-table-column label="企业名称" align="center" prop="companyName" show-overflow-tooltip fixed="left" />
        <el-table-column label="社会信用代码" align="center" prop="licenseNumber" show-overflow-tooltip />
        <el-table-column label="过期时间" align="center" prop="expireTime" width="170">
          <template #default="scope">
            <span>{{ parseTime(scope.row.expireTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="租户状态" align="center" prop="status" width="90">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="更新时间" align="center" prop="updateTime" width="170">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="创建时间" align="center" prop="createTime" width="170" sortable="custom">
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="280" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-hasPermi="['system:tenant:query']"
                type="primary"
                :underline="false"
                @click="handleDetail(scope.row)"
              >
                详情
              </el-link>
              <el-link
                v-hasPermi="['system:tenant:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-link
                v-if="scope.row.packageId"
                v-hasPermi="['system:tenant:edit']"
                type="primary"
                :underline="false"
                @click="handleSyncTenantPackage(scope.row)"
              >
                同步套餐
              </el-link>
              <el-popconfirm
                v-if="scope.row.status !== '1'"
                v-hasPermi="['system:tenant:edit']"
                :title="`确认启用租户「${scope.row.companyName}」？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="220"
                @confirm="applyStatusChange(scope.row, '1')"
              >
                <template #reference>
                  <el-link type="primary" :underline="false">启用</el-link>
                </template>
              </el-popconfirm>
              <el-popconfirm
                v-else
                v-hasPermi="['system:tenant:edit']"
                :title="`确认停用租户「${scope.row.companyName}」？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="220"
                @confirm="applyStatusChange(scope.row, '0')"
              >
                <template #reference>
                  <el-link type="danger" :underline="false">停用</el-link>
                </template>
              </el-popconfirm>
              <el-link
                v-hasPermi="['system:tenant:remove']"
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

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="800px" append-to-body destroy-on-close @closed="resetForm">
      <el-form ref="tenantFormRef" v-loading="formLoading" :model="form" :rules="rules" label-width="110px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="企业名称" prop="companyName">
              <el-input v-model="form.companyName" placeholder="请输入企业名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系人" prop="contactUserName">
              <el-input v-model="form.contactUserName" placeholder="请输入联系人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="contactPhone">
              <el-input v-model="form.contactPhone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.tenantId !== DEFAULT_TENANT_ID" :span="12">
            <el-form-item label="租户套餐" prop="packageId">
              <el-select v-model="form.packageId" placeholder="请选择租户套餐" clearable class="w-full">
                <el-option
                  v-for="item in packageList"
                  :key="item.packageId"
                  :label="item.packageName"
                  :value="item.packageId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="!form.id" :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" maxlength="30" placeholder="请输入系统用户名" />
            </el-form-item>
          </el-col>
          <el-col v-if="!form.id" :span="12">
            <el-form-item label="用户密码" prop="password">
              <el-input v-model="form.password" type="password" maxlength="20" show-password placeholder="请输入系统用户密码" />
            </el-form-item>
          </el-col>
          <el-col v-if="form.tenantId !== DEFAULT_TENANT_ID" :span="12">
            <el-form-item label="过期时间" prop="expireTime">
              <el-date-picker
                v-model="form.expireTime"
                type="datetime"
                value-format="YYYY-MM-DD HH:mm:ss"
                placeholder="请选择过期时间"
                clearable
                class="w-full"
              />
            </el-form-item>
          </el-col>
          <el-col v-if="form.tenantId !== DEFAULT_TENANT_ID" :span="12">
            <el-form-item prop="accountCount">
              <template #label>
                <span>
                  <el-tooltip content="-1 表示不限制" placement="top">
                    <el-icon><question-filled /></el-icon>
                  </el-tooltip>
                  用户数量
                </span>
              </template>
              <el-input-number v-model="form.accountCount" :min="-1" controls-position="right" class="w-full" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="域名" prop="domain">
              <el-input v-model="form.domain" placeholder="请输入域名" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="地址" prop="address">
              <el-input v-model="form.address" placeholder="请输入地址" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="企业代码" prop="licenseNumber">
              <el-input v-model="form.licenseNumber" placeholder="请输入统一社会信用代码" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="企业简介" prop="intro">
              <el-input v-model="form.intro" type="textarea" placeholder="请输入企业简介" />
            </el-form-item>
          </el-col>
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

    <el-dialog v-model="openView" title="租户详情" width="720px" append-to-body>
      <el-descriptions v-loading="openViewLoading" :column="2" border>
        <el-descriptions-item label="id">{{ detailForm.id }}</el-descriptions-item>
        <el-descriptions-item label="租户编号">{{ detailForm.tenantId }}</el-descriptions-item>
        <el-descriptions-item label="联系人">{{ detailForm.contactUserName }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ detailForm.contactPhone }}</el-descriptions-item>
        <el-descriptions-item label="企业名称">{{ detailForm.companyName }}</el-descriptions-item>
        <el-descriptions-item label="统一社会信用代码">{{ detailForm.licenseNumber }}</el-descriptions-item>
        <el-descriptions-item label="地址">{{ detailForm.address }}</el-descriptions-item>
        <el-descriptions-item label="域名">{{ detailForm.domain }}</el-descriptions-item>
        <el-descriptions-item label="企业简介" :span="2">{{ detailForm.intro }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailForm.remark }}</el-descriptions-item>
        <el-descriptions-item label="租户套餐编号">{{ detailForm.packageId }}</el-descriptions-item>
        <el-descriptions-item label="过期时间">{{ parseTime(detailForm.expireTime) }}</el-descriptions-item>
        <el-descriptions-item label="用户数量">{{ detailForm.accountCount }}</el-descriptions-item>
        <el-descriptions-item label="租户状态">
          <dict-tag :options="sys_normal_disable" :value="detailForm.status" />
        </el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(detailForm.updateTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detailForm.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="Tenant" lang="ts">
import {
  addTenant,
  changeTenantStatus,
  delTenant,
  getTenant,
  listTenant,
  syncTenantConfig,
  syncTenantPackage,
  updateTenant
} from '@/api/system/tenant';
import type { TenantForm, TenantQuery, TenantVO } from '@/api/system/tenant/types';
import { selectTenantPackage } from '@/api/system/tenantPackage';
import type { TenantPackageVO } from '@/api/system/tenantPackage/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { useUserStore } from '@/store/modules/user';
import { useDict } from '@/utils/dict';
import { download as requestDownload } from '@/utils/request';

const DEFAULT_TENANT_ID = '000000';
const userStore = useUserStore();
const { sys_normal_disable } = toRefs<any>(useDict('sys_normal_disable'));

const tenantList = ref<TenantVO[]>([]);
const packageList = ref<TenantPackageVO[]>([]);
const { loading, withLoading } = useLoading(true);
const { loading: buttonLoading, withLoading: withButtonLoading } = useLoading();
const { loading: formLoading, withLoading: withFormLoading } = useLoading();
const { ids, single, multiple, handleSelectionChange } = useTableSelection<TenantVO>(item => item.id!);
const total = ref(0);
const openView = ref(false);
const openViewLoading = ref(false);
const detailForm = ref<TenantVO>({});

const queryFormRef = ref<ElFormInstance>();
const tenantFormRef = ref<ElFormInstance>();

const initFormData: TenantForm = {
  id: undefined,
  accountCount: -1
};
const data = reactive<PageData<TenantForm, TenantQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    tenantId: undefined,
    contactUserName: undefined,
    contactPhone: undefined,
    companyName: undefined
  },
  rules: {}
});

const { queryParams, form } = toRefs(data);

const rules = computed((): ElFormRules => {
  const baseRules: ElFormRules = {
    contactUserName: [{ required: true, message: '联系人不能为空', trigger: 'blur' }],
    contactPhone: [
      { required: true, message: '联系电话不能为空', trigger: 'blur' },
      { pattern: /^1[3-9]\d{9}$/, message: '联系电话格式错误', trigger: 'blur' }
    ],
    companyName: [{ required: true, message: '企业名称不能为空', trigger: 'blur' }]
  };
  if (form.value.tenantId !== DEFAULT_TENANT_ID) {
    baseRules.packageId = [{ required: true, message: '租户套餐不能为空', trigger: 'change' }];
  }
  if (!form.value.id) {
    baseRules.username = [
      { required: true, message: '用户名不能为空', trigger: 'blur' },
      { min: 2, max: 20, message: '用户名称长度必须介于 2 和 20 之间', trigger: 'blur' }
    ];
    baseRules.password = [
      { required: true, message: '密码不能为空', trigger: 'blur' },
      { min: 5, max: 20, message: '用户密码长度必须介于 5 和 20 之间', trigger: 'blur' }
    ];
  }
  return baseRules;
});
const { dialog, resetForm, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: tenantFormRef,
  initialFormData: initFormData
});
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

const loadPackageOptions = async () => {
  const res = await selectTenantPackage();
  packageList.value = res.data ?? [];
};

const getList = async () => {
  await withLoading(async () => {
    const res = await listTenant(queryParams.value);
    tenantList.value = res.data?.rows ?? [];
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

const handleSortChange = (column: { prop?: string; order?: string | null }) => {
  if (!column.prop || !column.order) {
    queryParams.value.orderByColumn = undefined;
    queryParams.value.isAsc = undefined;
  } else {
    queryParams.value.orderByColumn = column.prop;
    queryParams.value.isAsc = column.order === 'ascending' ? 'ascending' : 'descending';
  }
  getList();
};

const handleAdd = async () => {
  resetForm();
  Object.assign(form.value, { accountCount: -1 });
  await loadPackageOptions();
  openDialog('添加租户');
};

const handleDetail = async (row: TenantVO) => {
  openView.value = true;
  openViewLoading.value = true;
  try {
    const res = await getTenant(row.id!);
    detailForm.value = res.data ?? {};
  } finally {
    openViewLoading.value = false;
  }
};

const handleUpdate = async (row?: TenantVO) => {
  resetForm();
  const id = row?.id ?? ids.value[0];
  await loadPackageOptions();
  await withFormLoading(async () => {
    const res = await getTenant(id);
    Object.assign(form.value, res.data ?? {});
  });
  showDialog('修改租户');
};

const submitForm = () => {
  tenantFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    await withButtonLoading(async () => {
      if (form.value.id) {
        await updateTenant(form.value);
      } else {
        await addTenant(form.value);
      }
    });
    modal.msgSuccess(form.value.id ? '修改成功' : '新增成功');
    closeDialog();
    await getList();
  });
};

const handleDelete = async (row?: TenantVO) => {
  const delIds = row?.id ?? ids.value;
  await modal.confirm(`是否确认删除租户编号为${delIds}的数据项？`);
  await delTenant(delIds);
  modal.msgSuccess('删除成功');
  await getList();
};

const applyStatusChange = (row: TenantVO, status: string) => {
  row.status = status;
  return handleStatusChange(row);
};

const handleStatusChange = async (row: TenantVO) => {
  const text = row.status === '1' ? '启用' : '停用';
  try {
    await changeTenantStatus(row.id!, row.tenantId!, row.status!);
    modal.msgSuccess(`${text}成功`);
  } catch {
    row.status = row.status === '1' ? '0' : '1';
  }
};

const handleSyncTenantPackage = async (row: TenantVO) => {
  await modal.confirm(`是否确认同步租户套餐租户编号为"${row.tenantId}"的数据项？`);
  await withLoading(async () => {
    await syncTenantPackage(row.tenantId!, row.packageId!);
  });
  modal.msgSuccess('同步成功');
  await getList();
};

const handleSyncTenantConfig = async () => {
  await modal.confirm('确认要同步所有租户参数配置吗？');
  const res = await syncTenantConfig();
  modal.msgSuccess((res as { msg?: string }).msg || '同步成功');
};

const handleExport = () => {
  requestDownload('system/tenant/export', { ...queryParams.value }, `tenant_${Date.now()}.xlsx`);
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