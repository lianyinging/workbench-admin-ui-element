<template>
  <div class="p-2 app-container workflow-task-copy-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>抄送任务</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="任务名称" prop="nodeName">
          <el-input
            v-model="queryParams.nodeName"
            class="filter-control"
            placeholder="请输入任务名称"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="流程定义名称" prop="flowName">
          <el-input
            v-model="queryParams.flowName"
            class="filter-control"
            placeholder="请输入流程定义名称"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="流程定义编码" prop="flowCode">
          <el-input
            v-model="queryParams.flowCode"
            class="filter-control"
            placeholder="请输入流程定义编码"
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="list-toolbar">
        <div class="list-toolbar__left"></div>
        <div class="list-toolbar__right">
          <el-button circle icon="Refresh" title="刷新" @click="handleQuery" />
        </div>
      </div>

      <el-table
        v-loading="loading"
        border
        class="data-table"
        :data="taskList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column align="center" type="index" label="序号" width="60"></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          prop="businessCode"
          align="center"
          label="业务编码"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          prop="businessTitle"
          align="center"
          label="业务标题"
          fixed="left"
        ></el-table-column>
        <el-table-column
          :show-overflow-tooltip="true"
          prop="flowName"
          align="center"
          label="流程定义名称"
        ></el-table-column>
        <el-table-column align="center" prop="flowCode" label="流程定义编码"></el-table-column>
        <el-table-column align="center" prop="categoryName" label="流程分类"></el-table-column>
        <el-table-column align="center" prop="version" label="版本号" width="90">
          <template #default="scope">v{{ scope.row.version }}.0</template>
        </el-table-column>
        <el-table-column align="center" prop="nodeName" label="任务名称"></el-table-column>
        <el-table-column align="center" label="流程状态" min-width="70">
          <template #default="scope">
            <dict-tag :options="wf_business_status" :value="scope.row.flowStatus"></dict-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <div class="op-links">
              <el-link type="primary" :underline="false" @click="handleView(scope.row)">查看</el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <pagination
        v-show="total > 0"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        :total="total"
        @pagination="handleQuery"
      />
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { pageByTaskCopy } from '@/api/workflow/task';
import { TaskQuery } from '@/api/workflow/task/types';
import workflowCommon from '@/api/workflow/workflowCommon';
import { RouterJumpVo } from '@/api/workflow/workflowCommon/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import { useDict } from '@/utils/dict';

const queryFormRef = ref<ElFormInstance>();
const { wf_business_status } = toRefs<any>(useDict('wf_business_status'));
const { loading, withLoading } = useLoading(true);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<any>(item => item.id);
// 总条数
const total = ref(0);
// 模型定义表格数据
const taskList = ref([]);
// 查询参数
const queryParams = ref<TaskQuery>({
  pageNum: 1,
  pageSize: 10,
  nodeName: undefined,
  flowName: undefined,
  flowCode: undefined
});
const { resetQuery } = useSearchReset({
  queryFormRef,
  queryParams,
  pageNumKey: 'pageNum',
  pageSizeKey: 'pageSize',
  initialPageSize: 10,
  afterReset: () => {
    handleQuery();
  }
});
/** 搜索按钮操作 */
const handleQuery = () => {
  getTaskCopyList();
};
//分页
const getTaskCopyList = () => {
  withLoading(async () => {
    const resp = await pageByTaskCopy(queryParams.value);
    taskList.value = resp.data?.rows;
    total.value = resp.data?.total;
  });
};

/** 查看按钮操作 */
const handleView = row => {
  const routerJumpVo = reactive<RouterJumpVo>({
    businessId: row.businessId,
    taskId: row.id,
    type: 'view',
    formCustom: row.formCustom,
    formPath: row.formPath
  });
  workflowCommon.routerJump(routerJumpVo);
};

onMounted(() => {
  getTaskCopyList();
});
</script>
