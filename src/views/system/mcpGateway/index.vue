<template>
  <div class="p-2 app-container system-mcp-gateway-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>MCP 网关配置</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="名称" prop="configName">
          <el-input
            v-model="queryParams.configName"
            class="filter-control"
            placeholder="配置名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" class="filter-control" placeholder="状态" clearable>
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
          <el-button v-hasPermi="['system:mcpGateway:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            v-hasPermi="['system:mcpGateway:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete()"
          >
            删除
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
        :data="configList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="名称" prop="configName" min-width="140" show-overflow-tooltip align="center" fixed="left" />
        <el-table-column label="网关地址" prop="gatewayBaseUrl" min-width="200" show-overflow-tooltip align="center" />
        <el-table-column label="Gateway Key" width="120" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.hasApiKey ? 'success' : 'info'" effect="plain">
              {{ scope.row.hasApiKey ? scope.row.apiKeyHint || '已配置' : '未配置' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sortOrder" width="80" align="center" />
        <el-table-column label="状态" width="90" align="center">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="更新时间" prop="updateTime" width="170" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.updateTime) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="260" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-hasPermi="['system:mcpGateway:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-link
                v-hasPermi="['system:mcpGateway:query']"
                type="primary"
                :underline="false"
                @click="handlePreviewTools(scope.row)"
              >
                工具预览
              </el-link>
              <el-popconfirm
                v-if="scope.row.status === '1'"
                v-hasPermi="['system:mcpGateway:edit']"
                :title="`确认停用「${scope.row.configName}」？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="220"
                @confirm="handleToggleStatus(scope.row, '0')"
              >
                <template #reference>
                  <el-link type="danger" :underline="false">停用</el-link>
                </template>
              </el-popconfirm>
              <el-popconfirm
                v-else
                v-hasPermi="['system:mcpGateway:edit']"
                :title="`确认启用「${scope.row.configName}」？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="220"
                @confirm="handleToggleStatus(scope.row, '1')"
              >
                <template #reference>
                  <el-link type="primary" :underline="false">启用</el-link>
                </template>
              </el-popconfirm>
              <el-popconfirm
                v-hasPermi="['system:mcpGateway:remove']"
                :title="`确认删除「${scope.row.configName}」？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="220"
                @confirm="handleDelete(scope.row)"
              >
                <template #reference>
                  <el-link type="danger" :underline="false">删除</el-link>
                </template>
              </el-popconfirm>
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

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="640px" append-to-body destroy-on-close @closed="resetForm">
      <el-form ref="formRef" v-loading="formLoading" :model="form" :rules="rules" label-width="130px">
        <el-form-item label="配置名称" prop="configName">
          <el-input v-model="form.configName" placeholder="如：默认网关 / 客服同事专用" />
        </el-form-item>
        <el-form-item label="网关地址" prop="gatewayBaseUrl">
          <el-input v-model="form.gatewayBaseUrl" placeholder="https://gateway.example.com" />
        </el-form-item>
        <el-form-item label="Gateway Key" prop="gatewayApiKey">
          <el-input
            v-model="form.gatewayApiKey"
            type="password"
            show-password
            autocomplete="new-password"
            :placeholder="editHasApiKey ? '已配置，留空不修改' : 'Bearer API Key'"
          />
          <div v-if="editHasApiKey" class="field-hint">当前已配置{{ editApiKeyHint ? `（${editApiKeyHint}）` : '' }}</div>
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="form.sortOrder" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="formLoading" @click="submitForm">确 定</el-button>
        <el-button @click="dialog.visible = false">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="toolsDialog.visible"
      :title="toolsDialog.title"
      width="820px"
      class="tools-preview-dialog"
      append-to-body
      destroy-on-close
      @closed="toolSearchKeyword = ''"
    >
      <div v-loading="toolsLoading" class="tools-preview">
        <div class="tools-preview__toolbar">
          <el-input
            v-model="toolSearchKeyword"
            class="tools-preview__search"
            clearable
            placeholder="搜索 Tool ID / 名称 / 描述"
            prefix-icon="Search"
          />
          <span class="tools-preview__count">共 {{ filteredTools.length }} 个工具</span>
        </div>
        <el-empty
          v-if="!toolsLoading && !toolServiceTabs.length"
          class="tools-preview__empty"
          :description="tools.length ? '无匹配工具' : '暂无授权工具'"
          :image-size="72"
        />
        <el-tabs v-else v-model="activeToolServiceTab" type="card" class="tools-preview__tabs">
          <el-tab-pane
            v-for="tab in toolServiceTabs"
            :key="tab.key"
            :name="tab.key"
            :label="`${tab.label} (${tab.tools.length})`"
          >
            <el-table border class="data-table tools-preview__table" :data="tab.tools" size="small" height="100%">
              <el-table-column label="Tool ID" prop="toolId" min-width="160" show-overflow-tooltip fixed="left" />
              <el-table-column label="名称" prop="toolName" min-width="140" show-overflow-tooltip />
              <el-table-column label="描述" prop="description" min-width="220" show-overflow-tooltip />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="McpGateway" lang="ts">
import {
  addMcpGatewayConfig,
  changeMcpGatewayStatus,
  delMcpGatewayConfig,
  getMcpGatewayConfig,
  listMcpGatewayConfig,
  listMcpGatewayTools,
  updateMcpGatewayConfig
} from '@/api/system/mcpGateway';
import type {
  McpGatewayToolItem,
  OpcMcpGatewayConfigForm,
  OpcMcpGatewayConfigQuery,
  OpcMcpGatewayConfigVo
} from '@/api/system/mcpGateway/types';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';
import { parseTime } from '@/utils/ruoyi';

const { sys_normal_disable } = toRefs<any>(useDict('sys_normal_disable'));

const loading = ref(true);
const formLoading = ref(false);
const toolsLoading = ref(false);
const configList = ref<OpcMcpGatewayConfigVo[]>([]);
const tools = ref<McpGatewayToolItem[]>([]);
const toolSearchKeyword = ref('');
const activeToolServiceTab = ref('');
const ids = ref<number[]>([]);
const multiple = ref(true);
const total = ref(0);
const editHasApiKey = ref(false);
const editApiKeyHint = ref('');

const queryFormRef = ref<ElFormInstance>();
const formRef = ref<ElFormInstance>();
const dialog = reactive({ visible: false, title: '' });
const toolsDialog = reactive({ visible: false, title: '' });

interface ToolServiceTab {
  key: string;
  label: string;
  tools: McpGatewayToolItem[];
}

const filteredTools = computed(() => {
  const kw = toolSearchKeyword.value.trim().toLowerCase();
  if (!kw) return tools.value;
  return tools.value.filter(item => {
    const id = (item.toolId || '').toLowerCase();
    const name = (item.toolName || '').toLowerCase();
    const desc = (item.description || '').toLowerCase();
    return id.includes(kw) || name.includes(kw) || desc.includes(kw);
  });
});

const toolServiceTabs = computed<ToolServiceTab[]>(() => {
  const map = new Map<string, ToolServiceTab>();
  for (const item of filteredTools.value) {
    const key = (item.gatewayId || item.gatewayName || '_other').trim() || '_other';
    const label = (item.gatewayName || item.gatewayId || '未分组服务').trim() || '未分组服务';
    let tab = map.get(key);
    if (!tab) {
      tab = { key, label, tools: [] };
      map.set(key, tab);
    }
    tab.tools.push(item);
  }
  return Array.from(map.values());
});

watch(toolServiceTabs, tabs => {
  if (!tabs.length) {
    activeToolServiceTab.value = '';
    return;
  }
  if (!tabs.some(t => t.key === activeToolServiceTab.value)) {
    activeToolServiceTab.value = tabs[0].key;
  }
});

const queryParams = ref<OpcMcpGatewayConfigQuery>({
  pageNum: 1,
  pageSize: 10,
  configName: undefined,
  status: undefined
});

const initForm = (): OpcMcpGatewayConfigForm => ({
  configId: undefined,
  configName: undefined,
  gatewayBaseUrl: undefined,
  gatewayApiKey: undefined,
  remark: undefined,
  status: '1',
  sortOrder: 0
});

const form = ref<OpcMcpGatewayConfigForm>(initForm());
const rules = {
  configName: [{ required: true, message: '配置名称不能为空', trigger: 'blur' }],
  gatewayBaseUrl: [{ required: true, message: '网关地址不能为空', trigger: 'blur' }]
};

async function getList() {
  loading.value = true;
  try {
    const res = await listMcpGatewayConfig(queryParams.value);
    configList.value = res.data?.rows || [];
    total.value = res.data?.total || 0;
  } finally {
    loading.value = false;
  }
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  queryFormRef.value?.resetFields();
  handleQuery();
}

function handleSelectionChange(selection: OpcMcpGatewayConfigVo[]) {
  ids.value = selection.map(item => Number(item.configId)).filter(Boolean);
  multiple.value = !ids.value.length;
}

function handleAdd() {
  resetForm();
  dialog.title = '新增 MCP 网关';
  dialog.visible = true;
}

async function handleUpdate(row?: OpcMcpGatewayConfigVo) {
  resetForm();
  const configId = row?.configId ?? ids.value[0];
  if (!configId) return;
  formLoading.value = true;
  dialog.visible = true;
  dialog.title = '修改 MCP 网关';
  try {
    const res = await getMcpGatewayConfig(configId);
    const data = res.data || {};
    form.value = {
      configId: data.configId,
      configName: data.configName,
      gatewayBaseUrl: data.gatewayBaseUrl,
      gatewayApiKey: undefined,
      remark: data.remark,
      status: data.status ?? '1',
      sortOrder: data.sortOrder ?? 0
    };
    editHasApiKey.value = !!data.hasApiKey;
    editApiKeyHint.value = data.apiKeyHint || '';
  } finally {
    formLoading.value = false;
  }
}

function resetForm() {
  form.value = initForm();
  editHasApiKey.value = false;
  editApiKeyHint.value = '';
  formRef.value?.resetFields();
}

async function submitForm() {
  await formRef.value?.validate();
  formLoading.value = true;
  try {
    if (form.value.configId) {
      await updateMcpGatewayConfig(form.value);
      modal.msgSuccess('修改成功');
    } else {
      await addMcpGatewayConfig(form.value);
      modal.msgSuccess('新增成功');
    }
    dialog.visible = false;
    await getList();
  } finally {
    formLoading.value = false;
  }
}

async function handleToggleStatus(row: OpcMcpGatewayConfigVo, status: string) {
  await changeMcpGatewayStatus(Number(row.configId), status);
  modal.msgSuccess(status === '1' ? '已启用' : '已停用');
  await getList();
}

async function handleDelete(row?: OpcMcpGatewayConfigVo) {
  const configIds = row?.configId != null ? [Number(row.configId)] : ids.value;
  if (!configIds.length) return;
  if (!row) {
    await modal.confirm(`确认删除选中的 ${configIds.length} 条配置？`);
  }
  await delMcpGatewayConfig(configIds);
  modal.msgSuccess('删除成功');
  await getList();
}

async function handlePreviewTools(row: OpcMcpGatewayConfigVo) {
  toolsDialog.title = `工具预览 — ${row.configName || row.configId}`;
  toolsDialog.visible = true;
  toolsLoading.value = true;
  tools.value = [];
  toolSearchKeyword.value = '';
  activeToolServiceTab.value = '';
  try {
    const res = await listMcpGatewayTools(Number(row.configId));
    tools.value = Array.isArray(res.data) ? res.data : [];
    activeToolServiceTab.value = toolServiceTabs.value[0]?.key || '';
  } catch {
    tools.value = [];
    activeToolServiceTab.value = '';
  } finally {
    toolsLoading.value = false;
  }
}

onMounted(() => {
  getList();
});
</script>

<style scoped>
.field-hint {
  margin-top: 6px;
  color: var(--el-text-color-placeholder);
  font-size: 12px;
  width: 100%;
}

.tools-preview {
  display: flex;
  flex-direction: column;
  height: 520px;
}

.tools-preview__toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-shrink: 0;
}

.tools-preview__search {
  width: 280px;
}

.tools-preview__count {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.tools-preview__empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tools-preview__tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.tools-preview__tabs :deep(.el-tabs__header) {
  margin-bottom: 12px;
  flex-shrink: 0;
}

.tools-preview__tabs :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
  padding: 0;
  overflow: hidden;
}

.tools-preview__tabs :deep(.el-tab-pane) {
  height: 100%;
}

.tools-preview__table {
  height: 100%;
}
</style>

<style>
.tools-preview-dialog .el-dialog__body {
  padding-top: 12px;
  padding-bottom: 16px;
}
</style>
