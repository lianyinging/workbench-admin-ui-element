<template>
  <div class="p-2 app-container system-industry-app-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>行业应用列表</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="标题" prop="title">
          <el-input
            v-model="queryParams.title"
            class="filter-control"
            placeholder="标题"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="模式" prop="mode">
          <el-select v-model="queryParams.mode" class="filter-control" clearable placeholder="全部">
            <el-option value="embed" label="Web 内嵌" />
            <el-option value="plugin" label="本地插件" />
            <el-option value="external" label="外开" />
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
          <el-button v-hasPermi="['system:industryApp:add']" type="primary" icon="Plus" @click="handleAdd">
            新增
          </el-button>
          <el-button
            v-hasPermi="['system:industryApp:remove']"
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
        :data="appList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="排序" prop="sortOrder" width="70" align="center" />
        <el-table-column label="Logo" width="72" align="center">
          <template #default="scope">
            <img v-if="scope.row.logo" :src="scope.row.logo" alt="" class="logo-cell" />
            <span v-else class="logo-empty">-</span>
          </template>
        </el-table-column>
        <el-table-column label="标题" prop="title" min-width="140" show-overflow-tooltip align="center" fixed="left" />
        <el-table-column label="应用键" prop="appKey" min-width="120" show-overflow-tooltip align="center" />
        <el-table-column label="模式" width="100" align="center">
          <template #default="scope">{{ modeLabel(scope.row.mode) }}</template>
        </el-table-column>
        <el-table-column label="入口" min-width="180" show-overflow-tooltip align="center">
          <template #default="scope">
            <span v-if="scope.row.mode === 'plugin'">{{ scope.row.pluginId || '-' }}</span>
            <span v-else>{{ scope.row.url || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="访问权限" width="120" align="center">
          <template #default="scope">
            <el-tag
              :type="scope.row.visibility === 'public' ? 'success' : scope.row.visibility === 'login' ? 'warning' : 'danger'"
              effect="plain"
            >
              {{ visibilityLabel(scope.row.visibility) }}
            </el-tag>
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
                v-hasPermi="['system:industryApp:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-link
                v-if="scope.row.status === '1'"
                v-hasPermi="['system:industryApp:edit']"
                type="danger"
                :underline="false"
                @click="handleToggleStatus(scope.row, '0')"
              >
                停用
              </el-link>
              <el-link
                v-else
                v-hasPermi="['system:industryApp:edit']"
                type="primary"
                :underline="false"
                @click="handleToggleStatus(scope.row, '1')"
              >
                启用
              </el-link>
              <el-link
                v-hasPermi="['system:industryApp:remove']"
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

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="640px" append-to-body destroy-on-close @closed="resetForm">
      <el-form ref="formRef" v-loading="formLoading" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="应用键" prop="appKey">
          <el-input v-model="form.appKey" placeholder="唯一键" :disabled="!!form.appId" />
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" placeholder="展示标题" />
        </el-form-item>
        <el-form-item label="副标题" prop="subtitle">
          <el-input v-model="form.subtitle" placeholder="简短说明" />
        </el-form-item>
        <el-form-item label="Logo">
          <div class="logo-field">
            <div v-if="form.logo" class="logo-preview-wrap">
              <img :src="form.logo" alt="logo" class="logo-preview" />
              <el-button size="small" @click="clearLogo">清除</el-button>
            </div>
            <el-upload
              :auto-upload="false"
              :show-file-list="false"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              :on-change="onLogoChange"
            >
              <el-button type="primary" plain>上传 Logo</el-button>
            </el-upload>
            <div class="logo-hint">图片转 base64 落库，建议 ≤200KB</div>
          </div>
        </el-form-item>
        <el-form-item label="模式" prop="mode">
          <el-radio-group v-model="form.mode">
            <el-radio value="embed">Web 内嵌</el-radio>
            <el-radio value="plugin">本地插件</el-radio>
            <el-radio value="external">外开浏览器</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.mode === 'embed' || form.mode === 'external'" label="URL" prop="url">
          <el-input v-model="form.url" placeholder="https://..." />
        </el-form-item>
        <el-form-item v-if="form.mode === 'plugin'" label="插件ID" prop="pluginId">
          <el-input v-model="form.pluginId" placeholder="如 sample_a" />
        </el-form-item>
        <el-form-item label="访问权限" prop="visibility">
          <el-radio-group v-model="form.visibility">
            <el-radio value="public">公开</el-radio>
            <el-radio value="login">登录</el-radio>
            <el-radio value="subscribe">登录且订阅</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="form.category" style="width: 100%">
            <el-option value="global" label="全局" />
            <el-option value="listing" label="刊登" />
            <el-option value="ops" label="运营" />
            <el-option value="service" label="客服" />
            <el-option value="content" label="内容" />
            <el-option value="analytics" label="分析" />
          </el-select>
        </el-form-item>
        <el-form-item label="标签" prop="tags">
          <el-input v-model="form.tags" placeholder="逗号分隔" />
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
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dialog.visible = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="IndustryApp" lang="ts">
import type { UploadFile } from 'element-plus';
import {
  addIndustryApp,
  changeIndustryAppStatus,
  delIndustryApp,
  getIndustryApp,
  listIndustryApp,
  updateIndustryApp
} from '@/api/system/industryApp';
import type { OpcIndustryAppForm, OpcIndustryAppQuery, OpcIndustryAppVo } from '@/api/system/industryApp/types';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';

const { sys_normal_disable } = toRefs<any>(useDict('sys_normal_disable'));

const appList = ref<OpcIndustryAppVo[]>([]);
const loading = ref(true);
const formLoading = ref(false);
const ids = ref<number[]>([]);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const formRef = ref<ElFormInstance>();

const dialog = reactive({ visible: false, title: '' });

const queryParams = ref<OpcIndustryAppQuery>({
  pageNum: 1,
  pageSize: 10,
  title: undefined,
  mode: undefined,
  status: undefined
});

const initForm = (): OpcIndustryAppForm => ({
  appId: undefined,
  appKey: undefined,
  title: undefined,
  subtitle: undefined,
  category: 'global',
  tags: undefined,
  icon: 'sparkle',
  logo: undefined,
  tone: '#1d4ed8',
  mode: 'embed',
  url: undefined,
  pluginId: undefined,
  visibility: 'subscribe',
  sortOrder: 0,
  status: '1',
  remark: undefined
});

const form = ref<OpcIndustryAppForm>(initForm());

const rules = computed(() => {
  const base: Record<string, any[]> = {
    appKey: [{ required: true, message: '应用键不能为空', trigger: 'blur' }],
    title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
    mode: [{ required: true, message: '请选择模式', trigger: 'change' }]
  };
  if (form.value.mode === 'embed' || form.value.mode === 'external') {
    base.url = [{ required: true, message: '请填写 URL', trigger: 'blur' }];
  }
  if (form.value.mode === 'plugin') {
    base.pluginId = [{ required: true, message: '请填写插件 ID', trigger: 'blur' }];
  }
  return base;
});

const LOGO_MAX_BYTES = 200 * 1024;

function modeLabel(mode?: string) {
  if (mode === 'embed') return 'Web 内嵌';
  if (mode === 'plugin') return '本地插件';
  if (mode === 'external') return '外开';
  return mode || '-';
}

function visibilityLabel(visibility?: string) {
  if (visibility === 'public') return '公开';
  if (visibility === 'login') return '登录';
  if (visibility === 'subscribe') return '登录且订阅';
  return visibility || '-';
}

async function getList() {
  loading.value = true;
  try {
    const res = await listIndustryApp(queryParams.value);
    appList.value = res.data?.rows || [];
    total.value = res.data?.total || 0;
  } finally {
    loading.value = false;
  }
}

function resetForm() {
  form.value = initForm();
  formRef.value?.resetFields();
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('读取图片失败'));
    reader.readAsDataURL(file);
  });
}

async function onLogoChange(uploadFile: UploadFile) {
  const raw = uploadFile.raw;
  if (!raw) return;
  if (!raw.type.startsWith('image/')) {
    modal.msgError('请选择图片文件');
    return;
  }
  if (raw.size > LOGO_MAX_BYTES) {
    modal.msgError('Logo 不能超过 200KB');
    return;
  }
  try {
    form.value.logo = await readAsDataUrl(raw);
    modal.msgSuccess('Logo 已选择');
  } catch {
    modal.msgError('图片读取失败');
  }
}

function clearLogo() {
  form.value.logo = undefined;
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

function handleSelectionChange(selection: OpcIndustryAppVo[]) {
  ids.value = selection.map(r => r.appId!).filter(Boolean);
  multiple.value = !selection.length;
}

function handleAdd() {
  resetForm();
  dialog.title = '新增行业应用';
  dialog.visible = true;
}

async function handleUpdate(row?: OpcIndustryAppVo) {
  resetForm();
  const appId = row?.appId || ids.value[0];
  if (!appId) return;
  dialog.title = '修改行业应用';
  dialog.visible = true;
  formLoading.value = true;
  try {
    const res = await getIndustryApp(appId);
    Object.assign(form.value, res.data || {});
  } finally {
    formLoading.value = false;
  }
}

function submitForm() {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    modal.loading('提交中...');
    try {
      if (form.value.appId) {
        await updateIndustryApp(form.value);
      } else {
        await addIndustryApp(form.value);
      }
      modal.msgSuccess(form.value.appId ? '修改成功' : '新增成功');
      dialog.visible = false;
      await getList();
    } finally {
      modal.closeLoading();
    }
  });
}

async function handleDelete(row?: OpcIndustryAppVo) {
  const appIds = row?.appId ? [row.appId] : ids.value;
  await modal.confirm('是否确认删除选中的行业应用？');
  await delIndustryApp(appIds);
  modal.msgSuccess('删除成功');
  await getList();
}

async function handleToggleStatus(row: OpcIndustryAppVo, status: string) {
  const action = status === '0' ? '停用' : '启用';
  await modal.confirm(`是否确认${action}「${row.title}」？`);
  await changeIndustryAppStatus(row.appId!, status);
  modal.msgSuccess(`${action}成功`);
  await getList();
}

onMounted(() => getList());
</script>

<style scoped>
.logo-cell {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  object-fit: cover;
  vertical-align: middle;
}
.logo-empty {
  color: var(--el-text-color-placeholder);
}
.logo-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}
.logo-preview-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}
.logo-preview {
  width: 56px;
  height: 56px;
  border-radius: 10px;
  object-fit: cover;
  border: 1px solid var(--el-border-color);
}
.logo-hint {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}
</style>