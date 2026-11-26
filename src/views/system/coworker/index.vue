<template>
  <div class="p-2 app-container system-coworker-page">
    <el-row :gutter="16" class="coworker-layout">
      <el-col :lg="4" :xs="24" class="coworker-layout__side">
        <el-card shadow="hover" class="category-card">
          <template #header>
            <div class="category-heading">
              <h3>分类</h3>
              <div class="category-heading__actions">
                <el-button
                  v-hasPermi="['system:coworkerCategory:add']"
                  type="primary"
                  plain
                  size="small"
                  @click="openCategoryDialog()"
                >
                  新增
                </el-button>
                <el-button plain size="small" @click="loadCategorySidebar">刷新</el-button>
              </div>
            </div>
          </template>
          <div v-loading="categoryLoading" class="category-list">
            <button
              type="button"
              class="category-item"
              :class="{ 'is-active': activeCategoryKey === 'all' }"
              @click="selectCategory('all')"
            >
              <span class="category-item__name">全部</span>
              <span class="category-item__count">{{ sidebar.allCount ?? 0 }}</span>
            </button>
            <button
              type="button"
              class="category-item"
              :class="{ 'is-active': activeCategoryKey === 'uncategorized' }"
              @click="selectCategory('uncategorized')"
            >
              <span class="category-item__name">未分类</span>
              <span class="category-item__count">{{ sidebar.uncategorizedCount ?? 0 }}</span>
            </button>
            <div class="category-list__divider" />
            <button
              v-for="cat in categoryList"
              :key="String(cat.categoryId)"
              type="button"
              class="category-item"
              :class="{ 'is-active': activeCategoryKey === String(cat.categoryId) }"
              @click="selectCategory(String(cat.categoryId))"
            >
              <span class="category-item__name" :title="cat.categoryName">{{ cat.categoryName }}</span>
              <span class="category-item__count">{{ cat.coworkerCount ?? 0 }}</span>
              <span class="category-item__ops" @click.stop>
                <el-link
                  v-hasPermi="['system:coworkerCategory:edit']"
                  type="primary"
                  :underline="false"
                  @click="openCategoryDialog(cat)"
                >
                  修改
                </el-link>
                <el-link
                  v-hasPermi="['system:coworkerCategory:remove']"
                  type="danger"
                  :underline="false"
                  @click="handleCategoryDelete(cat)"
                >
                  删除
                </el-link>
              </span>
            </button>
            <el-empty v-if="!categoryList.length" description="暂无分类" :image-size="48" />
          </div>
        </el-card>
      </el-col>

      <el-col :lg="20" :xs="24" class="coworker-layout__main">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>同事列表</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="名称" prop="name">
          <el-input
            v-model="queryParams.name"
            class="filter-control"
            placeholder="名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="Persona" prop="personaKey">
          <el-input
            v-model="queryParams.personaKey"
            class="filter-control"
            placeholder="personaKey"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="权限" prop="visibility">
          <el-select v-model="queryParams.visibility" class="filter-control" clearable placeholder="全部">
            <el-option value="public" label="公开" />
            <el-option value="login" label="登录" />
            <el-option value="subscribe" label="订阅" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" class="filter-control" clearable placeholder="全部">
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
          <el-button v-hasPermi="['system:coworker:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            v-hasPermi="['system:coworker:remove']"
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

      <el-table v-loading="loading" border class="data-table" :data="coworkerList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="排序" prop="sortOrder" width="70" align="center" />
        <el-table-column label="名称" prop="name" min-width="120" show-overflow-tooltip align="center" fixed="left" />
        <el-table-column label="Persona" prop="personaKey" min-width="110" show-overflow-tooltip align="center" />
        <el-table-column label="分类" prop="categoryName" min-width="100" show-overflow-tooltip align="center">
          <template #default="scope">{{ scope.row.categoryName || '未分类' }}</template>
        </el-table-column>
        <el-table-column label="版本" prop="version" width="90" align="center" />
        <el-table-column label="包" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.hasPackage ? 'success' : 'info'" effect="plain">
              {{ scope.row.hasPackage ? '已上传' : '无包' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="权限" width="110" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.visibility === 'public' ? 'success' : scope.row.visibility === 'login' ? 'warning' : 'danger'"
              effect="plain"
            >
              {{ visibilityLabel(scope.row.visibility) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="MCP 网关" prop="mcpConfigName" min-width="120" show-overflow-tooltip align="center">
          <template #default="scope">
            <span>{{ scope.row.mcpConfigName || (scope.row.mcpConfigId ? `#${scope.row.mcpConfigId}` : '未绑定') }}</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="220" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-hasPermi="['system:coworker:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-link
                v-if="scope.row.status === '1'"
                v-hasPermi="['system:coworker:edit']"
                type="danger"
                :underline="false"
                @click="handleToggleStatus(scope.row, '0')"
              >
                停用
              </el-link>
              <el-link
                v-else
                v-hasPermi="['system:coworker:edit']"
                type="primary"
                :underline="false"
                @click="handleToggleStatus(scope.row, '1')"
              >
                启用
              </el-link>
              <el-link
                v-hasPermi="['system:coworker:remove']"
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

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="720px" append-to-body destroy-on-close @closed="resetForm">
      <el-form ref="formRef" v-loading="formLoading" :model="form" :rules="rules" label-width="110px">
        <el-form-item label="Persona" prop="personaKey">
          <el-input v-model="form.personaKey" placeholder="唯一键" :disabled="!!form.coworkerId" />
        </el-form-item>
        <el-form-item label="名称" prop="name">
          <el-input v-model="form.name" placeholder="展示名称" />
        </el-form-item>
        <el-form-item label="一句话" prop="tagline">
          <el-input v-model="form.tagline" placeholder="副标题" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="form.icon" placeholder="图标标识" />
        </el-form-item>
        <el-form-item label="分类" prop="categoryId">
          <el-select v-model="form.categoryId" clearable filterable placeholder="未分类" style="width: 100%">
            <el-option
              v-for="cat in categoryOptions"
              :key="String(cat.categoryId)"
              :label="cat.categoryName"
              :value="Number(cat.categoryId)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="版本" prop="version">
          <el-input v-model="form.version" placeholder="如 1.0.0" />
        </el-form-item>
        <el-form-item label="同事包 zip">
          <div class="zip-field">
            <el-tag v-if="form.coworkerId && editHasPackage" type="success" effect="plain">已有包，重新上传可替换</el-tag>
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              accept=".zip,application/zip"
              :on-change="onZipChange"
            >
              <el-button type="primary" plain>选择 zip</el-button>
            </el-upload>
            <span v-if="zipFileName" class="zip-name">{{ zipFileName }}</span>
            <div class="zip-hint">{{ form.coworkerId ? '编辑时可选；不传则保留原包' : '新增必填，转 base64 上传' }}</div>
          </div>
        </el-form-item>
        <el-form-item label="访问权限" prop="visibility">
          <el-radio-group v-model="form.visibility">
            <el-radio value="public">公开</el-radio>
            <el-radio value="login">登录</el-radio>
            <el-radio value="subscribe">登录且订阅</el-radio>
          </el-radio-group>
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
        <el-form-item label="MCP 网关" prop="mcpConfigId">
          <el-select
            v-model="form.mcpConfigId"
            clearable
            filterable
            placeholder="选择该同事使用的网关秘钥"
            style="width: 100%"
            @change="onMcpConfigChange"
          >
            <el-option
              v-for="opt in mcpOptions"
              :key="String(opt.configId)"
              :label="opt.configName"
              :value="Number(opt.configId)"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="MCP 工具">
          <el-select
            v-model="selectedToolIds"
            multiple
            filterable
            clearable
            :disabled="!form.mcpConfigId"
            :placeholder="form.mcpConfigId ? '从所选网关选择工具' : '请先选择 MCP 网关'"
            style="width: 100%"
            @change="syncToolsFromSelect"
          >
            <el-option
              v-for="gt in gatewayTools"
              :key="String(gt.toolId)"
              :value="String(gt.toolId)"
              :label="`${gt.toolName || gt.toolId}${gt.description ? ' — ' + gt.description : ''}`"
            />
          </el-select>
          <el-table v-if="(form.tools || []).length" border size="small" :data="form.tools" class="tools-table">
            <el-table-column label="工具" prop="toolName" min-width="120" show-overflow-tooltip />
            <el-table-column label="Tool ID" prop="toolId" width="120" show-overflow-tooltip />
            <el-table-column label="Logical MCP" min-width="160">
              <template #default="scope">
                <el-input v-model="scope.row.logicalMcp" placeholder="可空" size="small" />
              </template>
            </el-table-column>
          </el-table>
          <span v-else class="tools-empty">未绑定工具</span>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dialog.visible = false">取 消</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="categoryDialog.visible"
      :title="categoryDialog.title"
      width="480px"
      append-to-body
      destroy-on-close
      @closed="resetCategoryForm"
    >
      <el-form ref="categoryFormRef" :model="categoryForm" :rules="categoryRules" label-width="90px">
        <el-form-item label="分类名称" prop="categoryName">
          <el-input v-model="categoryForm.categoryName" maxlength="64" placeholder="请输入分类名称" />
        </el-form-item>
        <el-form-item label="排序" prop="sortOrder">
          <el-input-number v-model="categoryForm.sortOrder" :min="0" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="categoryForm.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="categoryForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" :loading="categoryFormLoading" @click="submitCategoryForm">确 定</el-button>
        <el-button @click="categoryDialog.visible = false">取 消</el-button>
      </template>
    </el-dialog>
      </el-col>
    </el-row>
  </div>
</template>

<script setup name="Coworker" lang="ts">
import type { UploadFile } from 'element-plus';
import {
  addCoworker,
  changeCoworkerStatus,
  delCoworker,
  getCoworker,
  listCoworker,
  updateCoworker
} from '@/api/system/coworker';
import type { OpcCoworkerForm, OpcCoworkerQuery, OpcCoworkerVo } from '@/api/system/coworker/types';
import {
  addCoworkerCategory,
  delCoworkerCategory,
  getCoworkerCategorySidebar,
  listCoworkerCategoryOptions,
  updateCoworkerCategory
} from '@/api/system/coworkerCategory';
import type {
  OpcCoworkerCategoryForm,
  OpcCoworkerCategorySidebar,
  OpcCoworkerCategoryVo
} from '@/api/system/coworkerCategory/types';
import { listMcpGatewayOptions, listMcpGatewayTools } from '@/api/system/mcpGateway';
import type { McpGatewayToolItem, OpcMcpGatewayConfigVo } from '@/api/system/mcpGateway/types';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';

const { sys_normal_disable } = toRefs<any>(useDict('sys_normal_disable'));

const coworkerList = ref<OpcCoworkerVo[]>([]);
const mcpOptions = ref<OpcMcpGatewayConfigVo[]>([]);
const gatewayTools = ref<McpGatewayToolItem[]>([]);
const selectedToolIds = ref<string[]>([]);
const editHasPackage = ref(false);
const zipFileName = ref('');
const loading = ref(true);
const formLoading = ref(false);
const categoryLoading = ref(false);
const categoryFormLoading = ref(false);
const ids = ref<number[]>([]);
const multiple = ref(true);
const total = ref(0);
const activeCategoryKey = ref('all');
const sidebar = ref<OpcCoworkerCategorySidebar>({ allCount: 0, uncategorizedCount: 0, categories: [] });
const categoryOptions = ref<OpcCoworkerCategoryVo[]>([]);
const categoryList = computed(() => sidebar.value.categories || []);

const queryFormRef = ref<ElFormInstance>();
const formRef = ref<ElFormInstance>();
const categoryFormRef = ref<ElFormInstance>();
const dialog = reactive({ visible: false, title: '' });
const categoryDialog = reactive({ visible: false, title: '' });

const queryParams = ref<OpcCoworkerQuery>({
  pageNum: 1,
  pageSize: 10,
  name: undefined,
  personaKey: undefined,
  categoryId: undefined,
  uncategorized: undefined,
  visibility: undefined,
  status: undefined
});

const initForm = (): OpcCoworkerForm => ({
  coworkerId: undefined,
  personaKey: undefined,
  name: undefined,
  tagline: undefined,
  description: undefined,
  icon: undefined,
  groupKey: 'general',
  categoryId: undefined,
  version: undefined,
  packageZipBase64: undefined,
  visibility: 'subscribe',
  mcpConfigId: undefined,
  sortOrder: 0,
  status: '1',
  remark: undefined,
  tools: []
});

const initCategoryForm = (): OpcCoworkerCategoryForm => ({
  categoryId: undefined,
  categoryName: undefined,
  sortOrder: 0,
  status: '1',
  remark: undefined
});

const form = ref<OpcCoworkerForm>(initForm());
const categoryForm = ref<OpcCoworkerCategoryForm>(initCategoryForm());

const rules = {
  personaKey: [{ required: true, message: 'personaKey 不能为空', trigger: 'blur' }],
  name: [{ required: true, message: '名称不能为空', trigger: 'blur' }]
};

const categoryRules = {
  categoryName: [{ required: true, message: '分类名称不能为空', trigger: 'blur' }]
};

function visibilityLabel(visibility?: string) {
  if (visibility === 'public') return '公开';
  if (visibility === 'login') return '登录';
  if (visibility === 'subscribe') return '登录且订阅';
  return visibility || '-';
}

function applyCategoryFilter() {
  if (activeCategoryKey.value === 'all') {
    queryParams.value.categoryId = undefined;
    queryParams.value.uncategorized = undefined;
  } else if (activeCategoryKey.value === 'uncategorized') {
    queryParams.value.categoryId = undefined;
    queryParams.value.uncategorized = true;
  } else {
    queryParams.value.categoryId = Number(activeCategoryKey.value);
    queryParams.value.uncategorized = undefined;
  }
}

function selectCategory(key: string) {
  activeCategoryKey.value = key;
  applyCategoryFilter();
  handleQuery();
}

async function loadCategorySidebar() {
  categoryLoading.value = true;
  try {
    const res = await getCoworkerCategorySidebar();
    sidebar.value = res.data || { allCount: 0, uncategorizedCount: 0, categories: [] };
  } catch {
    sidebar.value = { allCount: 0, uncategorizedCount: 0, categories: [] };
  } finally {
    categoryLoading.value = false;
  }
}

async function loadCategoryOptions() {
  try {
    const res = await listCoworkerCategoryOptions();
    categoryOptions.value = Array.isArray(res.data) ? res.data : [];
  } catch {
    categoryOptions.value = [];
  }
}

function openCategoryDialog(row?: OpcCoworkerCategoryVo) {
  resetCategoryForm();
  if (row?.categoryId) {
    categoryDialog.title = '修改分类';
    categoryForm.value = {
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      sortOrder: row.sortOrder ?? 0,
      status: row.status ?? '1',
      remark: row.remark
    };
  } else {
    categoryDialog.title = '新增分类';
  }
  categoryDialog.visible = true;
}

function resetCategoryForm() {
  categoryForm.value = initCategoryForm();
  categoryFormRef.value?.resetFields();
}

async function submitCategoryForm() {
  await categoryFormRef.value?.validate();
  categoryFormLoading.value = true;
  try {
    if (categoryForm.value.categoryId) {
      await updateCoworkerCategory(categoryForm.value);
      modal.msgSuccess('修改成功');
    } else {
      await addCoworkerCategory(categoryForm.value);
      modal.msgSuccess('新增成功');
    }
    categoryDialog.visible = false;
    await loadCategorySidebar();
    await loadCategoryOptions();
  } finally {
    categoryFormLoading.value = false;
  }
}

async function handleCategoryDelete(row: OpcCoworkerCategoryVo) {
  if (!row.categoryId) return;
  await modal.confirm(`确认删除分类「${row.categoryName}」？分类下有同事时不可删除。`);
  await delCoworkerCategory(row.categoryId);
  modal.msgSuccess('删除成功');
  if (activeCategoryKey.value === String(row.categoryId)) {
    selectCategory('all');
  }
  await loadCategorySidebar();
  await loadCategoryOptions();
}

async function getList() {
  loading.value = true;
  try {
    const res = await listCoworker(queryParams.value);
    coworkerList.value = res.data?.rows || [];
    total.value = res.data?.total || 0;
  } finally {
    loading.value = false;
  }
}

async function loadMcpOptions() {
  try {
    const res = await listMcpGatewayOptions();
    mcpOptions.value = Array.isArray(res.data) ? res.data : [];
  } catch {
    mcpOptions.value = [];
  }
}

async function loadGatewayTools(configId?: number) {
  if (!configId) {
    gatewayTools.value = [];
    return;
  }
  try {
    const res = await listMcpGatewayTools(configId);
    gatewayTools.value = Array.isArray(res.data) ? res.data : [];
  } catch {
    gatewayTools.value = [];
  }
}

async function onMcpConfigChange() {
  selectedToolIds.value = [];
  form.value.tools = [];
  await loadGatewayTools(form.value.mcpConfigId);
}

function syncToolsFromSelect() {
  const prev = new Map((form.value.tools || []).map(t => [String(t.toolId), t]));
  form.value.tools = selectedToolIds.value.map(id => {
    const gt = gatewayTools.value.find(g => String(g.toolId) === id);
    const old = prev.get(id);
    return {
      logicalMcp: old?.logicalMcp ?? '',
      toolId: id,
      toolName: gt?.toolName ?? old?.toolName ?? id
    };
  });
}

function resetForm() {
  form.value = initForm();
  selectedToolIds.value = [];
  editHasPackage.value = false;
  zipFileName.value = '';
  formRef.value?.resetFields();
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('读取失败'));
    reader.readAsDataURL(file);
  });
}

async function onZipChange(uploadFile: UploadFile) {
  const raw = uploadFile.raw;
  if (!raw) return;
  zipFileName.value = raw.name;
  try {
    form.value.packageZipBase64 = await readAsDataUrl(raw);
    modal.msgSuccess('zip 已选择');
  } catch {
    modal.msgError('读取 zip 失败');
  }
}

function handleQuery() {
  queryParams.value.pageNum = 1;
  getList();
}

function resetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.value.pageNum = 1;
  handleQuery();
}

function handleSelectionChange(selection: OpcCoworkerVo[]) {
  ids.value = selection.map(r => r.coworkerId!).filter(Boolean);
  multiple.value = !selection.length;
}

async function handleAdd() {
  resetForm();
  dialog.title = '新增同事';
  dialog.visible = true;
  await Promise.all([loadMcpOptions(), loadCategoryOptions()]);
  if (activeCategoryKey.value !== 'all' && activeCategoryKey.value !== 'uncategorized') {
    form.value.categoryId = Number(activeCategoryKey.value);
  }
  if (mcpOptions.value.length === 1) {
    form.value.mcpConfigId = Number(mcpOptions.value[0].configId);
    await loadGatewayTools(form.value.mcpConfigId);
  }
}

async function handleUpdate(row?: OpcCoworkerVo) {
  resetForm();
  const coworkerId = row?.coworkerId || ids.value[0];
  if (!coworkerId) return;
  dialog.title = '修改同事';
  dialog.visible = true;
  formLoading.value = true;
  await Promise.all([loadMcpOptions(), loadCategoryOptions()]);
  try {
    const res = await getCoworker(coworkerId);
    const data = res.data || {};
    form.value = {
      coworkerId: data.coworkerId,
      personaKey: data.personaKey,
      name: data.name,
      tagline: data.tagline,
      description: data.description,
      icon: data.icon,
      groupKey: data.groupKey || 'general',
      categoryId: data.categoryId,
      version: data.version,
      packageZipBase64: undefined,
      visibility: data.visibility || 'subscribe',
      mcpConfigId: data.mcpConfigId,
      sortOrder: data.sortOrder ?? 0,
      status: data.status ?? '1',
      remark: data.remark,
      tools: [...(data.tools || [])]
    };
    editHasPackage.value = !!data.hasPackage;
    selectedToolIds.value = (data.tools || []).map(t => String(t.toolId)).filter(Boolean);
    await loadGatewayTools(form.value.mcpConfigId);
  } finally {
    formLoading.value = false;
  }
}

function submitForm() {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    if (!form.value.coworkerId && !form.value.packageZipBase64) {
      modal.msgError('请上传同事 zip 包');
      return;
    }
    const payload = { ...form.value };
    if (form.value.coworkerId && !payload.packageZipBase64) {
      delete payload.packageZipBase64;
    }
    modal.loading('提交中...');
    try {
      if (form.value.coworkerId) {
        await updateCoworker(payload);
      } else {
        await addCoworker(payload);
      }
      modal.msgSuccess(form.value.coworkerId ? '修改成功' : '新增成功');
      dialog.visible = false;
      await Promise.all([getList(), loadCategorySidebar()]);
    } finally {
      modal.closeLoading();
    }
  });
}

async function handleDelete(row?: OpcCoworkerVo) {
  const coworkerIds = row?.coworkerId ? [row.coworkerId] : ids.value;
  await modal.confirm('是否确认删除选中的同事？');
  await delCoworker(coworkerIds);
  modal.msgSuccess('删除成功');
  await Promise.all([getList(), loadCategorySidebar()]);
}

async function handleToggleStatus(row: OpcCoworkerVo, status: string) {
  const action = status === '0' ? '停用' : '启用';
  await modal.confirm(`是否确认${action}「${row.name}」？`);
  await changeCoworkerStatus(row.coworkerId!, status);
  modal.msgSuccess(`${action}成功`);
  await getList();
}

onMounted(async () => {
  await loadCategorySidebar();
  await getList();
});
</script>

<style scoped>
.coworker-layout {
  align-items: stretch;
}

.category-card {
  height: 100%;
  min-height: 560px;
}

.category-card :deep(.el-card__header) {
  padding: 12px 16px;
}

.category-card :deep(.el-card__body) {
  padding: 8px 10px 12px;
}

.category-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.category-heading h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.2;
}

.category-heading__actions {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.category-heading__actions :deep(.el-button) {
  margin: 0;
  width: auto;
  min-width: 0;
  padding: 5px 10px;
}

.category-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 420px;
}

.category-list__divider {
  height: 1px;
  margin: 6px 8px;
  background: var(--el-border-color-lighter);
}

.category-item {
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
  margin: 0;
  padding: 8px 10px;
  border: 0;
  border-radius: 6px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  line-height: 1.4;
}

.category-item:hover,
.category-item.is-active {
  background: var(--el-color-primary-light-9);
}

.category-item.is-active {
  color: var(--el-color-primary);
  font-weight: 600;
}

.category-item__name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-item__count {
  flex-shrink: 0;
  min-width: 1.5em;
  color: var(--el-text-color-secondary);
  font-size: 12px;
  text-align: right;
}

.category-item__ops {
  display: none;
  flex-shrink: 0;
  gap: 6px;
}

.category-item:hover .category-item__ops {
  display: inline-flex;
}

.category-item:hover .category-item__count {
  display: none;
}

.zip-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.zip-hint,
.tools-empty {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
.zip-name {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.tools-table {
  margin-top: 8px;
  width: 100%;
}
</style>