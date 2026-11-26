<template>
  <div class="p-2 app-container monitor-desktop-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>桌面端设备</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="设备名称" prop="deviceName">
          <el-input
            v-model="queryParams.deviceName"
            class="filter-control"
            placeholder="请输入设备名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="在线状态" prop="onlineFilter">
          <el-select v-model="queryParams.onlineFilter" class="filter-control" clearable placeholder="全部">
            <el-option value="online" label="仅在线" />
            <el-option value="all" label="全部" />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="list-toolbar">
        <div class="list-toolbar__left" />
        <div class="list-toolbar__right">
          <el-button circle icon="Refresh" title="刷新" @click="getList" />
        </div>
      </div>

      <el-table v-loading="loading" border class="data-table" :data="deviceList">
        <el-table-column label="设备名称" prop="deviceName" min-width="140" show-overflow-tooltip align="center" fixed="left" />
        <el-table-column label="设备 ID" prop="deviceId" min-width="220" show-overflow-tooltip align="center" />
        <el-table-column label="系统" min-width="140" show-overflow-tooltip align="center">
          <template #default="scope">{{ formatOs(scope.row) }}</template>
        </el-table-column>
        <el-table-column label="版本" prop="appVersion" width="100" align="center" />
        <el-table-column label="绑定用户" prop="userDisplayName" min-width="120" show-overflow-tooltip align="center" />
        <el-table-column label="IP" prop="lastIp" min-width="120" show-overflow-tooltip align="center" />
        <el-table-column label="最后心跳" prop="lastHeartbeatTime" width="180" align="center">
          <template #default="scope">
            <span>{{ parseTime(scope.row.lastHeartbeatTime) || '-' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="在线" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.online ? 'success' : 'info'" effect="plain">
              {{ scope.row.online ? '在线' : '离线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="scope">
            <el-tag :type="scope.row.status === '1' ? 'primary' : 'danger'" effect="plain">
              {{ scope.row.status === '1' ? '正常' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="100" fixed="right" class-name="small-padding fixed-width">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-if="scope.row.status === '1'"
                v-hasPermi="['monitor:desktop:edit']"
                type="danger"
                :underline="false"
                @click="handleToggleStatus(scope.row, '0')"
              >
                禁用
              </el-link>
              <el-link
                v-else
                v-hasPermi="['monitor:desktop:edit']"
                type="primary"
                :underline="false"
                @click="handleToggleStatus(scope.row, '1')"
              >
                启用
              </el-link>
            </div>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="DesktopOnline" lang="ts">
import { listDesktopDevices, updateDesktopDeviceStatus } from '@/api/monitor/desktop';
import type { OpcDesktopDevice } from '@/api/monitor/desktop/types';
import modal from '@/plugins/modal';
import { parseTime } from '@/utils/ruoyi';

const queryFormRef = ref<ElFormInstance>();
const deviceList = ref<OpcDesktopDevice[]>([]);
const loading = ref(false);

const queryParams = ref<{
  deviceName?: string;
  onlineFilter?: string;
}>({
  deviceName: undefined,
  onlineFilter: 'all'
});

function formatOs(row: OpcDesktopDevice) {
  const name = row.osName || '';
  const ver = row.osVersion || '';
  if (!name && !ver) return '-';
  return [name, ver].filter(Boolean).join(' ');
}

async function getList() {
  loading.value = true;
  try {
    const onlineOnly = queryParams.value.onlineFilter === 'online' ? true : undefined;
    const res = await listDesktopDevices({
      deviceName: queryParams.value.deviceName,
      onlineOnly
    });
    deviceList.value = res.data || [];
  } finally {
    loading.value = false;
  }
}

function handleQuery() {
  getList();
}

function resetQuery() {
  queryFormRef.value?.resetFields();
  queryParams.value.deviceName = undefined;
  queryParams.value.onlineFilter = 'all';
  handleQuery();
}

async function handleToggleStatus(row: OpcDesktopDevice, status: string) {
  const action = status === '0' ? '禁用' : '启用';
  await modal.confirm(`是否确认${action}设备「${row.deviceName}」？`);
  await updateDesktopDeviceStatus(row.deviceId, status);
  modal.msgSuccess(`${action}成功`);
  await getList();
}

onMounted(() => {
  getList();
});
</script>