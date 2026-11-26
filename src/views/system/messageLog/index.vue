<template>
  <div class="p-2 app-container system-message-log-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>消息发送记录</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="消息key" prop="messageKey">
          <el-input
            v-model="queryParams.messageKey"
            class="filter-control"
            placeholder="请输入消息key"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="模板名称" prop="messageTemplateName">
          <el-input
            v-model="queryParams.messageTemplateName"
            class="filter-control"
            placeholder="请输入模板名称"
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
        <el-form-item label="模板类型" prop="templateMode">
          <el-select v-model="queryParams.templateMode" class="filter-control" placeholder="请选择模板类型" clearable>
            <el-option
              v-for="dict in sys_message_template_mode"
              :key="dict.value"
              :label="dict.label"
              :value="dict.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发送账号" prop="account">
          <el-input
            v-model="queryParams.account"
            class="filter-control"
            placeholder="请输入发送账号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="模板ID" prop="templateId">
          <el-input
            v-model="queryParams.templateId"
            class="filter-control"
            placeholder="请输入模板ID"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="平台标识" prop="supplierType">
          <el-select v-model="queryParams.supplierType" class="filter-control" placeholder="请选择平台标识" clearable>
            <el-option
              v-for="item in supplierTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="是否成功" prop="isSuccess">
          <el-select v-model="queryParams.isSuccess" class="filter-control" placeholder="请选择是否成功" clearable>
            <el-option v-for="dict in sys_common_status" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="记录时间">
          <el-date-picker
            v-model="dateRange"
            class="filter-control filter-control--wide"
            value-format="YYYY-MM-DD HH:mm:ss"
            type="daterange"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :default-time="[new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)]"
          />
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="list-toolbar">
        <div class="list-toolbar__left">
          <el-button
            v-hasPermi="['system:messageLog:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete()"
          >
            删除
          </el-button>
          <el-button v-hasPermi="['system:messageLog:remove']" type="danger" plain icon="WarnTriangleFilled" @click="handleClear">
            清空记录
          </el-button>
          <el-button v-hasPermi="['system:messageLog:export']" type="warning" plain icon="Download" @click="handleExport">
            导出
          </el-button>
        </div>
        <div class="list-toolbar__right">
          <el-button circle icon="Refresh" title="刷新" @click="getList" />
        </div>
      </div>

      <el-table
        ref="tableRef"
        v-loading="loading"
        border
        class="data-table"
        :data="messageLogList"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="消息key" align="center" prop="messageKey" fixed="left" />
        <el-table-column label="模板名称" align="center" prop="messageTemplateName" />
        <el-table-column label="消息类型" align="center" prop="messageType">
          <template #default="scope">
            <dict-tag :options="messageTypeOptions" :value="scope.row.messageType" />
          </template>
        </el-table-column>
        <el-table-column label="模板类型" align="center" prop="templateMode">
          <template #default="scope">
            <dict-tag :options="sys_message_template_mode" :value="scope.row.templateMode" />
          </template>
        </el-table-column>
        <el-table-column label="发送账号" align="center" prop="account" />
        <el-table-column label="标题" align="center" prop="title" :show-overflow-tooltip="true" />
        <el-table-column label="发送内容" align="center" prop="content" :show-overflow-tooltip="true" />
        <el-table-column label="平台标识" align="center" prop="supplierType">
          <template #default="scope">
            <dict-tag :options="supplierTypeOptions" :value="scope.row.supplierType" />
          </template>
        </el-table-column>
        <el-table-column label="是否成功" align="center" prop="isSuccess">
          <template #default="scope">
            <dict-tag :options="sys_common_status" :value="scope.row.isSuccess" />
          </template>
        </el-table-column>
        <el-table-column
          label="消耗"
          align="center"
          prop="costTime"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
        >
          <template #default="scope">{{ scope.row.costTime }}毫秒</template>
        </el-table-column>
        <el-table-column
          label="记录时间"
          align="center"
          prop="logTime"
          width="180"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.logTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="140" fixed="right">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-hasPermi="['system:messageLog:query']"
                type="primary"
                :underline="false"
                @click="handleDetail(scope.row)"
              >
                详情
              </el-link>
              <el-link
                v-hasPermi="['system:messageLog:remove']"
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

    <el-dialog v-model="detailDialog.visible" title="消息发送记录详情" width="900px" append-to-body>
      <el-descriptions v-loading="detailLoading" :column="2" border>
        <el-descriptions-item label="消息发送记录id">{{ detailForm.messageLogId }}</el-descriptions-item>
        <el-descriptions-item label="消息模板id">{{ detailForm.messageTemplateId }}</el-descriptions-item>
        <el-descriptions-item label="消息key">{{ detailForm.messageKey }}</el-descriptions-item>
        <el-descriptions-item label="模板名称">{{ detailForm.messageTemplateName }}</el-descriptions-item>
        <el-descriptions-item label="消息类型">
          <dict-tag :options="messageTypeOptions" :value="detailForm.messageType" />
        </el-descriptions-item>
        <el-descriptions-item label="模板类型">
          <dict-tag :options="sys_message_template_mode" :value="detailForm.templateMode" />
        </el-descriptions-item>
        <el-descriptions-item label="发送账号">{{ detailForm.account }}</el-descriptions-item>
        <el-descriptions-item label="标题">{{ detailForm.title }}</el-descriptions-item>
        <el-descriptions-item label="模板ID">{{ detailForm.templateId }}</el-descriptions-item>
        <el-descriptions-item label="消息配置标题">{{ detailForm.messageConfigTitle }}</el-descriptions-item>
        <el-descriptions-item label="平台标识">
          <dict-tag :options="supplierTypeOptions" :value="detailForm.supplierType" />
        </el-descriptions-item>
        <el-descriptions-item label="是否成功">
          <dict-tag :options="sys_common_status" :value="detailForm.isSuccess" />
        </el-descriptions-item>
        <el-descriptions-item label="消耗时间">{{ detailForm.costTime ?? 0 }}毫秒</el-descriptions-item>
        <el-descriptions-item label="记录时间">{{ parseTime(detailForm.logTime) }}</el-descriptions-item>
        <el-descriptions-item label="发送内容" :span="2">
          <div v-html="detailForm.content"></div>
        </el-descriptions-item>
        <el-descriptions-item label="返回主体消息" :span="2">{{ detailForm.responseBody }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup name="MessageLog" lang="ts">
import { getMessageSupplierType } from '@/api/system/messageConfig';
import type { MessageTypeVo } from '@/api/system/messageConfig/types';
import { clearMessageLog, delMessageLog, getMessageLog, listMessageLog } from '@/api/system/messageLog';
import type { MessageLogQuery, MessageLogVO } from '@/api/system/messageLog/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useDialogState } from '@/hooks/dialog/useDialogState';
import { useDateRangeQuery } from '@/hooks/form/useDateRangeQuery';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';
import { download as requestDownload } from '@/utils/request';
import { parseTime } from '@/utils/ruoyi';

const { sys_message_template_mode, sys_common_status } = toRefs<any>(
  useDict('sys_message_template_mode', 'sys_common_status')
);

const messageLogList = ref<MessageLogVO[]>([]);
const supplierTypeList = ref<MessageTypeVo[]>([]);
const { loading, withLoading } = useLoading(true);
const total = ref(0);
const detailLoading = ref(false);
const tableRef = ref<ElTableInstance>();

const queryFormRef = ref<ElFormInstance>();
const { dateRange, applyDateRange, resetDateRange } = useDateRangeQuery('LogTime');

const data = reactive<PageData<Record<string, never>, MessageLogQuery>>({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    messageKey: undefined,
    messageTemplateName: undefined,
    messageType: undefined,
    templateMode: undefined,
    account: undefined,
    templateId: undefined,
    supplierType: undefined,
    isSuccess: undefined
  },
  rules: {}
});

const { queryParams } = toRefs(data);
const { ids, multiple, handleSelectionChange } = useTableSelection<MessageLogVO>(item => item.messageLogId!);
const { dialog: detailDialog, openDialog: openDetailDialog } = useDialogState('消息发送记录详情');
const detailForm = ref<MessageLogVO>({});

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

const getList = async () => {
  await withLoading(async () => {
    const res = await listMessageLog(applyDateRange(queryParams.value));
    messageLogList.value = res.data?.rows ?? [];
    total.value = res.data?.total ?? 0;
  });
};

const handleSortChange = (column: { prop: string; order: 'ascending' | 'descending' | null }) => {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order ?? undefined;
  getList();
};

const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const { resetQuery } = useSearchReset({
  queryFormRef,
  queryParams,
  pageNumKey: 'pageNum',
  resetExtras: () => resetDateRange(),
  afterReset: () => handleQuery()
});

const handleDetail = async (row: MessageLogVO) => {
  detailLoading.value = true;
  openDetailDialog();
  try {
    const res = await getMessageLog(row.messageLogId!);
    detailForm.value = res.data ?? {};
  } finally {
    detailLoading.value = false;
  }
};

const handleDelete = async (row?: Partial<MessageLogVO>) => {
  const messageLogIds = row?.messageLogId ?? ids.value;
  await modal.confirm(`是否确认删除消息发送记录编号为"${messageLogIds}"的数据项？`);
  await delMessageLog(messageLogIds as number | string);
  modal.msgSuccess('删除成功');
  await getList();
};

const handleClear = async () => {
  await modal.confirm('是否确认删除所有消息发送记录？');
  await clearMessageLog();
  modal.msgSuccess('删除成功');
  await getList();
};

const handleExport = () => {
  requestDownload('system/messageLog/export', { ...applyDateRange(queryParams.value) }, `messageLog_${Date.now()}.xlsx`);
};

const initSupplierTypes = async () => {
  const res = await getMessageSupplierType();
  supplierTypeList.value = res.data ?? [];
};

onMounted(() => {
  getList();
  initSupplierTypes();
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/components/page-shell' as pageShell;

@include pageShell.table-crud-page;
</style>