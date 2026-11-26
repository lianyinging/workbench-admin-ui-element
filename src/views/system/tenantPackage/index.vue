<template>
  <div class="p-2 app-container system-tenant-package-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>租户套餐列表</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="套餐名称" prop="packageName">
          <el-input
            v-model="queryParams.packageName"
            class="filter-control"
            placeholder="请输入套餐名称"
            clearable
            @keyup.enter="handleQuery"
          />
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
          <el-button v-hasPermi="['system:tenantPackage:add']" type="primary" icon="Plus" @click="handleAdd">
            新增
          </el-button>
          <el-button
            v-hasPermi="['system:tenantPackage:edit']"
            :disabled="single"
            icon="Edit"
            @click="handleUpdate()"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:tenantPackage:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete()"
          >
            删除
          </el-button>
          <el-button
            v-hasPermi="['system:tenantPackage:export']"
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
        row-key="packageId"
        :data="tenantPackageList"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="套餐名称" align="center" prop="packageName" fixed="left" />
        <el-table-column label="状态" align="center" prop="status" sortable="custom" width="90">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" show-overflow-tooltip />
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
        <el-table-column label="操作" align="center" width="260" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-hasPermi="['system:tenantPackage:query']"
                type="primary"
                :underline="false"
                @click="handleDetail(scope.row)"
              >
                详情
              </el-link>
              <el-link
                v-hasPermi="['system:tenantPackage:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-popconfirm
                v-if="scope.row.status !== '1'"
                v-hasPermi="['system:tenantPackage:edit']"
                :title="`确认启用套餐「${scope.row.packageName}」？`"
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
                v-hasPermi="['system:tenantPackage:edit']"
                :title="`确认停用套餐「${scope.row.packageName}」？`"
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
                v-hasPermi="['system:tenantPackage:remove']"
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

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="700px" append-to-body destroy-on-close @closed="onDialogClosed">
      <el-form ref="tenantPackageFormRef" v-loading="formLoading" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="套餐名称" prop="packageName">
          <el-input v-model="form.packageName" placeholder="请输入套餐名称" />
        </el-form-item>
        <el-form-item label="关联菜单" prop="menuIds">
          <el-checkbox v-model="menuExpand" @change="handleCheckedTreeExpand($event, 'menu')">展开/折叠</el-checkbox>
          <el-checkbox v-model="menuNodeAll" @change="handleCheckedTreeNodeAll($event, 'menu')">全选/全不选</el-checkbox>
          <el-checkbox v-model="form.menuCheckStrictly">父子联动</el-checkbox>
          <div class="tree-border menu-tree-wrap">
            <el-tree
              ref="menuRef"
              class="tree-border"
              :data="menuOptions"
              show-checkbox
              node-key="id"
              :check-strictly="!form.menuCheckStrictly"
              empty-text="加载中，请稍候"
              :props="{ label: 'label', children: 'children' }"
            />
          </div>
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

    <el-dialog v-model="openView" title="租户套餐详情" width="700px" append-to-body>
      <el-descriptions v-loading="openViewLoading" :column="2" border>
        <el-descriptions-item label="租户套餐id">{{ detailForm.packageId }}</el-descriptions-item>
        <el-descriptions-item label="套餐名称">{{ detailForm.packageName }}</el-descriptions-item>
        <el-descriptions-item label="菜单树是否关联显示" :span="2">{{ detailForm.menuCheckStrictly }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <dict-tag :options="sys_normal_disable" :value="detailForm.status" />
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailForm.remark }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(detailForm.updateTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detailForm.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="TenantPackage" lang="ts">
import type { MenuTreeOption } from '@/api/system/menu/types';
import {
  addTenantPackage,
  changePackageStatus,
  delTenantPackage,
  getTenantPackage,
  listTenantPackage,
  tenantPackageMenuTreeSelect,
  updateTenantPackage
} from '@/api/system/tenantPackage';
import type { TenantPackageForm, TenantPackageQuery, TenantPackageVO } from '@/api/system/tenantPackage/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';
import { download as requestDownload } from '@/utils/request';

const { sys_normal_disable } = toRefs<any>(useDict('sys_normal_disable'));

const tenantPackageList = ref<TenantPackageVO[]>([]);
const menuOptions = ref<MenuTreeOption[]>([]);
const menuExpand = ref(false);
const menuNodeAll = ref(false);
const menuRef = ref<ElTreeInstance>();

const { loading, withLoading } = useLoading(true);
const { loading: buttonLoading, withLoading: withButtonLoading } = useLoading();
const { loading: formLoading, withLoading: withFormLoading } = useLoading();
const { ids, single, multiple, handleSelectionChange } = useTableSelection<TenantPackageVO>(item => item.packageId!);
const total = ref(0);
const openView = ref(false);
const openViewLoading = ref(false);
const detailForm = ref<TenantPackageVO>({});

const queryFormRef = ref<ElFormInstance>();
const tenantPackageFormRef = ref<ElFormInstance>();

const initFormData: TenantPackageForm = {
  packageId: undefined,
  packageName: undefined,
  menuIds: [],
  menuCheckStrictly: true,
  status: '1',
  remark: undefined
};

const data = reactive<PageData<TenantPackageForm, TenantPackageQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    packageName: undefined,
    status: undefined
  },
  rules: {
    packageName: [{ required: true, message: '套餐名称不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const { dialog, resetForm, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: tenantPackageFormRef,
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

const collectMenuNodeIds = (nodes: MenuTreeOption[]): Array<string | number> => {
  const result: Array<string | number> = [];
  const walk = (list: MenuTreeOption[]) => {
    list.forEach(node => {
      result.push(node.id);
      if (node.children?.length) {
        walk(node.children);
      }
    });
  };
  walk(nodes);
  return result;
};

const getMenuAllCheckedKeys = (): Array<string | number> => {
  const checkedKeys = (menuRef.value?.getCheckedKeys(false) ?? []) as Array<string | number>;
  const halfCheckedKeys = (menuRef.value?.getHalfCheckedKeys() ?? []) as Array<string | number>;
  return [...checkedKeys, ...halfCheckedKeys];
};

const getPackageMenuTreeSelect = async (packageId: number) => {
  const res = await tenantPackageMenuTreeSelect(packageId);
  menuOptions.value = res.data?.menus ?? [];
  return res.data;
};

const resetMenuTreeState = () => {
  menuExpand.value = false;
  menuNodeAll.value = false;
  menuOptions.value = [];
  menuRef.value?.setCheckedKeys([]);
};

const onDialogClosed = () => {
  resetForm();
  resetMenuTreeState();
};

const getList = async () => {
  await withLoading(async () => {
    const res = await listTenantPackage(queryParams.value);
    tenantPackageList.value = res.data?.rows ?? [];
    total.value = res.data?.total ?? 0;
  });
};

const cancel = () => {
  closeDialog();
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

const handleCheckedTreeExpand = (value: unknown) => {
  const expanded = Boolean(value);
  const nodeMap = menuRef.value?.store?.nodesMap as Record<string, { expanded: boolean }> | undefined;
  if (nodeMap) {
    Object.keys(nodeMap).forEach(nodeId => {
      nodeMap[nodeId].expanded = expanded;
    });
  }
};

const handleCheckedTreeNodeAll = (value: unknown) => {
  if (value) {
    menuRef.value?.setCheckedKeys(collectMenuNodeIds(menuOptions.value));
  } else {
    menuRef.value?.setCheckedKeys([]);
  }
};

const handleAdd = async () => {
  resetMenuTreeState();
  resetForm();
  Object.assign(form.value, { status: '1', menuCheckStrictly: true, menuIds: [] });
  await withFormLoading(async () => {
    await getPackageMenuTreeSelect(0);
  });
  openDialog('添加租户套餐');
};

const handleDetail = async (row: TenantPackageVO) => {
  openView.value = true;
  openViewLoading.value = true;
  try {
    const res = await getTenantPackage(row.packageId!);
    detailForm.value = res.data ?? {};
  } finally {
    openViewLoading.value = false;
  }
};

const handleUpdate = async (row?: TenantPackageVO) => {
  resetMenuTreeState();
  resetForm();
  const packageId = row?.packageId ?? ids.value[0];
  showDialog('修改租户套餐');
  await withFormLoading(async () => {
    const detailRes = await getTenantPackage(packageId);
    Object.assign(form.value, detailRes.data ?? {});
    const treeRes = await getPackageMenuTreeSelect(Number(packageId));
    await nextTick();
    menuRef.value?.setCheckedKeys(treeRes?.checkedKeys ?? []);
  });
};

const submitForm = () => {
  tenantPackageFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    form.value.menuIds = getMenuAllCheckedKeys();
    await withButtonLoading(async () => {
      if (form.value.packageId) {
        await updateTenantPackage(form.value);
      } else {
        await addTenantPackage(form.value);
      }
    });
    modal.msgSuccess(form.value.packageId ? '修改成功' : '新增成功');
    closeDialog();
    await getList();
  });
};

const handleDelete = async (row?: TenantPackageVO) => {
  const packageIds = row?.packageId ?? ids.value;
  await modal.confirm(`是否确认删除租户套餐编号为${packageIds}的数据项？`);
  await delTenantPackage(packageIds);
  modal.msgSuccess('删除成功');
  await getList();
};

const applyStatusChange = (row: TenantPackageVO, status: string) => {
  row.status = status;
  return handleStatusChange(row);
};

const handleStatusChange = async (row: TenantPackageVO) => {
  const text = row.status === '1' ? '启用' : '停用';
  try {
    await changePackageStatus(row.packageId!, row.status!);
    modal.msgSuccess(`${text}成功`);
  } catch {
    row.status = row.status === '1' ? '0' : '1';
  }
};

const handleExport = () => {
  requestDownload('system/tenant/package/export', { ...queryParams.value }, `tenantPackage_${Date.now()}.xlsx`);
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
.menu-tree-wrap {
  width: 100%;
  max-height: 360px;
  overflow: auto;
  margin-top: 8px;
  padding: 8px;
}
</style>