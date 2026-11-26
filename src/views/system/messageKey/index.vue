<template>
  <div class="p-2 app-container system-message-key-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>消息常量</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="消息名称" prop="name">
          <el-input
            v-model="queryParams.name"
            class="filter-control"
            placeholder="请输入消息名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="消息key" prop="messageKey">
          <el-input
            v-model="queryParams.messageKey"
            class="filter-control"
            placeholder="请输入消息key"
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
          <el-button v-hasPermi="['system:messageKey:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            v-hasPermi="['system:messageKey:edit']"
            :disabled="single"
            icon="Edit"
            @click="handleUpdate()"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:messageKey:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete()"
          >
            删除
          </el-button>
          <el-button v-hasPermi="['system:messageKey:export']" type="warning" plain icon="Download" @click="handleExport">
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
        :data="messageKeyList"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="消息名称" align="center" prop="name" fixed="left" />
        <el-table-column
          label="消息key"
          align="center"
          prop="messageKey"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
        />
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
                v-hasPermi="['system:messageKey:query']"
                type="primary"
                :underline="false"
                @click="handleDetail(scope.row)"
              >
                详情
              </el-link>
              <el-link
                v-hasPermi="['system:messageKey:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-link
                v-hasPermi="['system:messageKey:remove']"
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

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="520px" append-to-body destroy-on-close @closed="handleDialogClosed">
      <el-form ref="messageKeyFormRef" :model="form" :rules="rules" label-width="90px">
        <el-form-item label="消息名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入消息名称" clearable />
        </el-form-item>
        <el-form-item label="消息key" prop="messageKey">
          <el-input v-model="form.messageKey" placeholder="请输入消息key" clearable />
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

    <el-dialog v-model="detailDialog.visible" title="消息常量详情" width="700px" append-to-body>
      <el-descriptions v-loading="detailLoading" :column="2" border>
        <el-descriptions-item label="消息key主键">{{ detailForm.messageKeyId }}</el-descriptions-item>
        <el-descriptions-item label="消息名称">{{ detailForm.name }}</el-descriptions-item>
        <el-descriptions-item label="消息key">{{ detailForm.messageKey }}</el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailForm.remark }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(detailForm.updateTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detailForm.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="MessageKey" lang="ts">
import { addMessageKey, delMessageKey, getMessageKey, listMessageKey, updateMessageKey } from '@/api/system/messageKey';
import type { MessageKeyForm, MessageKeyQuery, MessageKeyVO } from '@/api/system/messageKey/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useDialogState } from '@/hooks/dialog/useDialogState';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { download as requestDownload } from '@/utils/request';
import { parseTime } from '@/utils/ruoyi';

const messageKeyList = ref<MessageKeyVO[]>([]);
const { loading, withLoading } = useLoading(true);
const { loading: buttonLoading, withLoading: withButtonLoading } = useLoading();
const total = ref(0);
const detailLoading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const messageKeyFormRef = ref<ElFormInstance>();

const initFormData: MessageKeyForm = {
  messageKeyId: undefined,
  name: undefined,
  messageKey: undefined,
  remark: undefined
};

const data = reactive<PageData<MessageKeyForm, MessageKeyQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    name: undefined,
    messageKey: undefined
  },
  rules: {
    name: [{ required: true, message: '消息名称不能为空', trigger: 'blur' }],
    messageKey: [{ required: true, message: '消息key不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<MessageKeyVO>(item => item.messageKeyId!);
const { dialog, resetForm, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: messageKeyFormRef,
  initialFormData: initFormData
});
const { dialog: detailDialog, openDialog: openDetailDialog } = useDialogState('消息常量详情');
const detailForm = ref<MessageKeyVO>({});

const getList = async () => {
  await withLoading(async () => {
    const res = await listMessageKey(queryParams.value);
    messageKeyList.value = res.data?.rows ?? [];
    total.value = res.data?.total ?? 0;
  });
};

const handleSortChange = (column: { prop: string; order: 'ascending' | 'descending' | null }) => {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order ?? undefined;
  getList();
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

const handleAdd = () => openDialog('添加消息常量');

const handleUpdate = async (row?: Partial<MessageKeyVO>) => {
  resetForm();
  const messageKeyId = row?.messageKeyId ?? ids.value[0];
  const res = await getMessageKey(messageKeyId);
  Object.assign(form.value, res.data);
  showDialog('修改消息常量');
};

const handleDetail = async (row: MessageKeyVO) => {
  detailLoading.value = true;
  openDetailDialog();
  try {
    const res = await getMessageKey(row.messageKeyId!);
    detailForm.value = res.data ?? {};
  } finally {
    detailLoading.value = false;
  }
};

const submitForm = () => {
  messageKeyFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    await withButtonLoading(async () => {
      if (form.value.messageKeyId) {
        await updateMessageKey(form.value);
      } else {
        await addMessageKey(form.value);
      }
    });
    modal.msgSuccess('操作成功');
    closeDialog();
    await getList();
  });
};

const handleDelete = async (row?: Partial<MessageKeyVO>) => {
  const messageKeyIds = row?.messageKeyId ?? ids.value;
  await modal.confirm(`是否确认删除消息常量编号为"${messageKeyIds}"的数据项？`);
  await delMessageKey(messageKeyIds as number | string);
  modal.msgSuccess('删除成功');
  await getList();
};

const handleExport = () => {
  requestDownload('system/messageKey/export', { ...queryParams.value }, `messageKey_${Date.now()}.xlsx`);
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/components/page-shell' as pageShell;

@include pageShell.table-crud-page;
</style>