<template>
  <div class="p-2 app-container system-desktop-user-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>桌面端用户</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="账号" prop="userName">
          <el-input
            v-model="queryParams.userName"
            class="filter-control"
            placeholder="请输入账号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input
            v-model="queryParams.nickName"
            class="filter-control"
            placeholder="请输入昵称"
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
          <el-button v-hasPermi="['system:desktopUser:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            v-hasPermi="['system:desktopUser:edit']"
            :disabled="single"
            icon="Edit"
            @click="handleUpdate()"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:desktopUser:remove']"
            type="danger"
            plain
            :disabled="multiple"
            icon="Delete"
            @click="handleDelete()"
          >
            删除
          </el-button>
        </div>
        <div class="list-toolbar__right">
          <el-button circle icon="Refresh" title="刷新" @click="getList" />
        </div>
      </div>

      <el-table v-loading="loading" border class="data-table" :data="userList" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="账号" prop="userName" min-width="120" show-overflow-tooltip align="center" fixed="left" />
        <el-table-column label="昵称" prop="nickName" min-width="120" show-overflow-tooltip align="center" />
        <el-table-column label="登录在线" width="100" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.online ? 'success' : 'info'" effect="plain">
              {{ scope.row.online ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="行业应用" min-width="160" show-overflow-tooltip align="center">
          <template #default="scope">
            <span v-if="scope.row.appTitles?.length">{{ scope.row.appTitles.join('、') }}</span>
            <el-tag v-else type="info" effect="plain">未订阅</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="同事" min-width="140" show-overflow-tooltip align="center">
          <template #default="scope">
            <span v-if="scope.row.coworkerTitles?.length">{{ scope.row.coworkerTitles.join('、') }}</span>
            <el-tag v-else type="info" effect="plain">未授权</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="最后登录" prop="lastLoginTime" width="170" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.lastLoginTime) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="登录IP" prop="lastLoginIp" min-width="120" show-overflow-tooltip align="center" />
        <el-table-column label="操作" align="center" width="280" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-hasPermi="['system:desktopUser:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-link
                v-hasPermi="['system:desktopUser:resetPwd']"
                type="primary"
                :underline="false"
                @click="handleResetPwd(scope.row)"
              >
                重置密码
              </el-link>
              <el-popconfirm
                v-if="scope.row.status === '1'"
                v-hasPermi="['system:desktopUser:edit']"
                :title="`确认停用账号「${scope.row.userName}」？`"
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
                v-hasPermi="['system:desktopUser:edit']"
                :title="`确认启用账号「${scope.row.userName}」？`"
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
                v-hasPermi="['system:desktopUser:remove']"
                :title="`确认删除账号「${scope.row.userName}」？`"
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

    <el-dialog v-model="dialog.visible" :title="dialog.title" width="560px" append-to-body destroy-on-close @closed="resetForm">
      <el-form ref="formRef" v-loading="formLoading" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="账号" prop="userName">
          <el-input v-model="form.userName" placeholder="登录账号" :disabled="!!form.userId" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="form.nickName" placeholder="显示昵称" />
        </el-form-item>
        <el-form-item v-if="!form.userId" label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="登录密码" show-password autocomplete="new-password" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="dict.value">
              {{ dict.label }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="行业应用">
          <el-checkbox-group v-if="industryAppOptions.length" v-model="form.appIds" class="check-group">
            <el-checkbox v-for="app in industryAppOptions" :key="String(app.appId)" :value="Number(app.appId)">
              {{ app.title }}
            </el-checkbox>
          </el-checkbox-group>
          <span v-else class="check-empty">暂无启用中的行业应用</span>
        </el-form-item>
        <el-form-item label="同事">
          <el-checkbox-group
            v-if="coworkerOptions.length"
            v-model="form.coworkerIds"
            class="check-group"
            @change="onCoworkerIdsChange"
          >
            <el-checkbox v-for="cw in coworkerOptions" :key="String(cw.coworkerId)" :value="Number(cw.coworkerId)">
              {{ cw.name }}
            </el-checkbox>
          </el-checkbox-group>
          <span v-else class="check-empty">暂无启用中的同事</span>
        </el-form-item>
        <el-form-item v-if="grantableTools.length" label="工具授权">
          <el-checkbox-group v-model="selectedToolKeys" class="check-group" @change="syncCoworkerTools">
            <el-checkbox v-for="item in grantableTools" :key="item.key" :value="item.key">
              <span>{{ item.coworkerName }} · {{ item.toolName }}</span>
              <span v-if="item.logicalMcp" class="tool-mcp">（{{ item.logicalMcp }}）</span>
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="3" placeholder="备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="dialog.visible = false">取 消</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="DesktopUser" lang="ts">
import { listCoworkerEnabledOptions } from '@/api/system/coworker';
import type { OpcCoworkerVo } from '@/api/system/coworker/types';
import {
  addDesktopUser,
  changeDesktopUserStatus,
  delDesktopUser,
  getDesktopUser,
  listDesktopUser,
  resetDesktopUserPwd,
  updateDesktopUser
} from '@/api/system/desktopUser';
import type {
  OpcDesktopUserCoworkerTool,
  OpcDesktopUserForm,
  OpcDesktopUserQuery,
  OpcDesktopUserVo
} from '@/api/system/desktopUser/types';
import { listIndustryApp } from '@/api/system/industryApp';
import type { OpcIndustryAppVo } from '@/api/system/industryApp/types';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';
import { parseTime } from '@/utils/ruoyi';

const { sys_normal_disable } = toRefs<any>(useDict('sys_normal_disable'));

const userList = ref<OpcDesktopUserVo[]>([]);
const industryAppOptions = ref<OpcIndustryAppVo[]>([]);
const coworkerOptions = ref<OpcCoworkerVo[]>([]);
const selectedToolKeys = ref<string[]>([]);
const loading = ref(true);
const formLoading = ref(false);
const ids = ref<number[]>([]);
const single = ref(true);
const multiple = ref(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const formRef = ref<ElFormInstance>();
const dialog = reactive({ visible: false, title: '' });

const queryParams = ref<OpcDesktopUserQuery>({
  pageNum: 1,
  pageSize: 10,
  userName: undefined,
  nickName: undefined,
  status: undefined
});

const initForm = (): OpcDesktopUserForm => ({
  userId: undefined,
  userName: undefined,
  nickName: undefined,
  password: undefined,
  status: '1',
  subscribed: '0',
  appIds: [],
  coworkerIds: [],
  coworkerTools: [],
  remark: undefined
});

const form = ref<OpcDesktopUserForm>(initForm());

const rules = computed(() => {
  const base: Record<string, any[]> = {
    userName: [
      { required: true, message: '账号不能为空', trigger: 'blur' },
      { min: 2, max: 64, message: '账号长度 2-64', trigger: 'blur' }
    ]
  };
  if (!form.value.userId) {
    base.password = [
      { required: true, message: '密码不能为空', trigger: 'blur' },
      { min: 5, max: 50, message: '密码长度 5-50', trigger: 'blur' }
    ];
  }
  return base;
});

type GrantableTool = {
  key: string;
  coworkerId: number;
  coworkerName: string;
  logicalMcp: string;
  toolName: string;
};

function toolGrantKey(coworkerId: number, logicalMcp?: string, toolName?: string) {
  return `${coworkerId}|${logicalMcp || ''}|${toolName || ''}`;
}

const grantableTools = computed<GrantableTool[]>(() => {
  const idSet = new Set((form.value.coworkerIds || []).map(v => Number(v)));
  const out: GrantableTool[] = [];
  for (const cw of coworkerOptions.value) {
    const cwId = Number(cw.coworkerId);
    if (!idSet.has(cwId)) continue;
    for (const t of cw.tools || []) {
      const toolName = t.toolName || '';
      if (!toolName) continue;
      out.push({
        key: toolGrantKey(cwId, t.logicalMcp, toolName),
        coworkerId: cwId,
        coworkerName: cw.name || String(cwId),
        logicalMcp: t.logicalMcp || '',
        toolName
      });
    }
  }
  return out;
});

async function getList() {
  loading.value = true;
  try {
    const res = await listDesktopUser(queryParams.value);
    userList.value = res.data?.rows || [];
    total.value = res.data?.total || 0;
  } finally {
    loading.value = false;
  }
}

async function loadCoworkerOptions() {
  try {
    const res = await listCoworkerEnabledOptions();
    coworkerOptions.value = Array.isArray(res.data) ? res.data : [];
  } catch {
    coworkerOptions.value = [];
  }
}

async function loadIndustryApps() {
  try {
    const res = await listIndustryApp({ pageNum: 1, pageSize: 200, status: '1' });
    industryAppOptions.value = res.data?.rows || [];
  } catch {
    industryAppOptions.value = [];
  }
}

function syncCoworkerTools() {
  const map = new Map(grantableTools.value.map(g => [g.key, g]));
  form.value.coworkerTools = selectedToolKeys.value
    .map(key => {
      const g = map.get(key);
      if (!g) return null;
      return {
        coworkerId: g.coworkerId,
        logicalMcp: g.logicalMcp,
        toolName: g.toolName
      } as OpcDesktopUserCoworkerTool;
    })
    .filter(Boolean) as OpcDesktopUserCoworkerTool[];
}

function onCoworkerIdsChange() {
  const allowed = new Set(grantableTools.value.map(g => g.key));
  selectedToolKeys.value = selectedToolKeys.value.filter(k => allowed.has(k));
  syncCoworkerTools();
}

function applyCoworkerToolsFromForm(tools?: OpcDesktopUserCoworkerTool[]) {
  selectedToolKeys.value = (tools || [])
    .map(t => toolGrantKey(Number(t.coworkerId), t.logicalMcp, t.toolName))
    .filter(Boolean);
}

function applyUserToForm(data: Partial<OpcDesktopUserVo>) {
  form.value.userId = data.userId;
  form.value.userName = data.userName;
  form.value.nickName = data.nickName;
  form.value.status = data.status ?? '1';
  form.value.subscribed = data.subscribed ?? '0';
  form.value.appIds = (data.appIds || []).map(v => Number(v)).filter(n => !Number.isNaN(n));
  form.value.coworkerIds = (data.coworkerIds || []).map(v => Number(v)).filter(n => !Number.isNaN(n));
  form.value.coworkerTools = [...(data.coworkerTools || [])];
  applyCoworkerToolsFromForm(form.value.coworkerTools);
  form.value.remark = data.remark;
  form.value.password = undefined;
}

function resetForm() {
  form.value = initForm();
  selectedToolKeys.value = [];
  formRef.value?.resetFields();
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

function handleSelectionChange(selection: OpcDesktopUserVo[]) {
  ids.value = selection.map(r => r.userId!).filter(Boolean);
  single.value = selection.length !== 1;
  multiple.value = !selection.length;
}

function handleAdd() {
  resetForm();
  dialog.title = '新增客户端用户';
  dialog.visible = true;
}

async function handleUpdate(row?: OpcDesktopUserVo) {
  const userId = row?.userId || ids.value[0];
  if (!userId) {
    modal.msgError('请选择要修改的用户');
    return;
  }
  resetForm();
  if (row) {
    applyUserToForm(row);
  } else {
    form.value.userId = userId;
  }
  dialog.title = '修改客户端用户';
  dialog.visible = true;
  formLoading.value = true;
  try {
    const res = await getDesktopUser(userId);
    applyUserToForm(res.data || {});
  } finally {
    formLoading.value = false;
  }
}

function submitForm() {
  formRef.value?.validate(async (valid: boolean) => {
    if (!valid) return;
    modal.loading('提交中...');
    try {
      if (form.value.userId) {
        await updateDesktopUser(form.value);
      } else {
        await addDesktopUser(form.value);
      }
      modal.msgSuccess(form.value.userId ? '修改成功' : '新增成功');
      dialog.visible = false;
      await getList();
    } finally {
      modal.closeLoading();
    }
  });
}

async function handleDelete(row?: OpcDesktopUserVo) {
  const userIds = row?.userId ? [row.userId] : ids.value;
  // 行内删除由 Popconfirm 确认；工具栏批量删除仍走弹窗
  if (!row?.userId) {
    await modal.confirm('是否确认删除选中的客户端用户？');
  }
  await delDesktopUser(userIds);
  modal.msgSuccess('删除成功');
  await getList();
}

async function handleToggleStatus(row: OpcDesktopUserVo, status: string) {
  const action = status === '0' ? '停用' : '启用';
  await changeDesktopUserStatus(row.userId!, status);
  modal.msgSuccess(`${action}成功`);
  await getList();
}

async function handleResetPwd(row: OpcDesktopUserVo) {
  try {
    const { value } = await modal.prompt(`请输入"${row.userName}"的新密码（至少5位）`);
    if (!value || value.length < 5) {
      modal.msgError('密码至少5位');
      return;
    }
    await resetDesktopUserPwd(row.userId!, value);
    modal.msgSuccess('密码已重置');
  } catch {
    /* cancelled */
  }
}

onMounted(() => {
  loadIndustryApps();
  loadCoworkerOptions();
  getList();
});
</script>

<style scoped>
.check-group {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
  max-height: 220px;
  overflow: auto;
  width: 100%;
}
.check-empty {
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}
.tool-mcp {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
</style>