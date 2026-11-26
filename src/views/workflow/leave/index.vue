<template>
  <div class="p-2 app-container workflow-leave-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>请假列表</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="请假天数" prop="startLeaveDays">
          <el-input
            v-model="queryParams.startLeaveDays"
            class="filter-control"
            placeholder="请输入请假天数"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item prop="endLeaveDays">至</el-form-item>
        <el-form-item prop="endLeaveDays">
          <el-input
            v-model="queryParams.endLeaveDays"
            class="filter-control"
            placeholder="请输入请假天数"
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
          <el-button v-hasPermi="['workflow:leave:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
          <el-button v-hasPermi="['workflow:leave:export']" icon="Download" @click="handleExport">导出</el-button>
        </div>
        <div class="list-toolbar__right">
          <el-button circle icon="Refresh" title="刷新" @click="getList" />
        </div>
      </div>

      <el-table
        v-loading="loading"
        border
        class="data-table"
        :data="leaveList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="false" label="主键" align="center" prop="id" />
        <el-table-column label="请假类型" align="center" fixed="left">
          <template #default="scope">
            <el-tag>{{ options.find(e => e.value === scope.row.leaveType)?.label }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="开始时间" align="center" prop="startDate">
          <template #default="scope">
            <span>{{ parseTime(scope.row.startDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="结束时间" align="center" prop="endDate">
          <template #default="scope">
            <span>{{ parseTime(scope.row.endDate, '{y}-{m}-{d}') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="请假天数" align="center" prop="leaveDays" />
        <el-table-column label="请假原因" align="center" prop="remark" />
        <el-table-column align="center" label="流程状态" min-width="70">
          <template #default="scope">
            <dict-tag :options="wf_business_status" :value="scope.row.status"></dict-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-if="scope.row.status === 'draft' || scope.row.status === 'cancel' || scope.row.status === 'back'"
                v-hasPermi="['workflow:leave:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-link
                v-if="scope.row.status === 'draft' || scope.row.status === 'cancel' || scope.row.status === 'back'"
                v-hasPermi="['workflow:leave:remove']"
                type="danger"
                :underline="false"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-link>
              <el-link type="primary" :underline="false" @click="handleView(scope.row)">查看</el-link>
              <el-link
                v-if="scope.row.status === 'waiting'"
                type="primary"
                :underline="false"
                @click="handleCancelProcessApply(scope.row.id)"
              >
                撤销
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
  </div>
</template>

<script setup name="Leave" lang="ts">
import { useRoute } from 'vue-router';
import { cancelProcessApply } from '@/api/workflow/instance';
import { delLeave, listLeave } from '@/api/workflow/leave';
import { LeaveForm, LeaveQuery, LeaveVO } from '@/api/workflow/leave/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import tab from '@/plugins/tab';
import router from '@/router';
import { useDict } from '@/utils/dict';
import { download as requestDownload } from '@/utils/request';
import { parseTime } from '@/utils/ruoyi';

const route = useRoute();
const { wf_business_status } = toRefs<any>(useDict('wf_business_status'));
const leaveList = ref<LeaveVO[]>([]);
const { loading, setLoading, withLoading } = useLoading(true);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<LeaveVO>(item => item.id);
const total = ref(0);
const options = [
  {
    value: '1',
    label: '事假'
  },
  {
    value: '2',
    label: '调休'
  },
  {
    value: '3',
    label: '病假'
  },
  {
    value: '4',
    label: '婚假'
  }
];

const queryFormRef = ref<ElFormInstance>();

const data = reactive<PageData<LeaveForm, LeaveQuery>>({
  form: {},
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    startLeaveDays: undefined,
    endLeaveDays: undefined
  },
  rules: {}
});

const { queryParams } = toRefs(data);

/** 查询请假列表 */
const getList = async () => {
  await withLoading(async () => {
    const res = await listLeave(queryParams.value);
    leaveList.value = res.data?.rows;
    total.value = res.data?.total;
  });
};

/** 搜索按钮操作 */
const handleQuery = () => {
  queryParams.value.pageNum = 1;
  getList();
};

const { resetQuery } = useSearchReset({
  queryFormRef,
  queryParams,
  pageNumKey: 'pageNum',
  afterReset: () => {
    handleQuery();
  }
});

/** 新增按钮操作 */
const handleAdd = () => {
  tab.closePage(route);
  router.push({
    path: `/workflow/leaveEdit/index`,
    query: {
      type: 'add'
    }
  });
};

/** 修改按钮操作 */
const handleUpdate = (row?: Partial<LeaveVO>) => {
  tab.closePage(route);
  router.push({
    path: `/workflow/leaveEdit/index`,
    query: {
      id: row.id,
      type: 'update'
    }
  });
};

/** 查看按钮操作 */
const handleView = (row?: Partial<LeaveVO>) => {
  tab.closePage(route);
  router.push({
    path: `/workflow/leaveEdit/index`,
    query: {
      id: row.id,
      type: 'view'
    }
  });
};

/** 删除按钮操作 */
const handleDelete = async (row?: Partial<LeaveVO>) => {
  const leaveIds = row?.id || ids.value;
  await modal.confirm('是否确认删除请假编号为"' + leaveIds + '"的数据项？');
  await delLeave(leaveIds);
  modal.msgSuccess('删除成功');
  await getList();
};

/** 导出按钮操作 */
const handleExport = () => {
  requestDownload(
    'workflow/leave/export',
    {
      ...queryParams.value
    },
    `leave_${new Date().getTime()}.xlsx`
  );
};

/** 撤销按钮操作 */
const handleCancelProcessApply = async (id: string) => {
  await modal.confirm('是否确认撤销当前单据？');
  setLoading(true);
  const data = {
    businessId: id,
    message: '申请人撤销流程！'
  };
  await cancelProcessApply(data).finally(() => setLoading(false));
  await getList();
  modal.msgSuccess('撤销成功');
};
onMounted(() => {
  getList();
});
</script>
