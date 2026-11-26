<template>
  <div class="p-2 app-container system-oss-config-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>OSS 配置</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="配置key" prop="configKey">
          <el-input
            v-model="queryParams.configKey"
            class="filter-control"
            placeholder="配置key"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="桶名称" prop="bucketName">
          <el-input
            v-model="queryParams.bucketName"
            class="filter-control"
            placeholder="请输入桶名称"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        <el-form-item label="是否默认" prop="status">
          <el-select v-model="queryParams.status" class="filter-control" placeholder="请选择状态" clearable>
            <el-option v-for="dict in sys_yes_no" :key="dict.value" :label="dict.label" :value="dict.value" />
          </el-select>
        </el-form-item>
        <el-form-item class="filter-actions">
          <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <div class="list-toolbar">
        <div class="list-toolbar__left">
          <el-button v-hasPermi="['system:ossConfig:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            v-hasPermi="['system:ossConfig:edit']"
            :disabled="single"
            icon="Edit"
            @click="handleUpdate()"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:ossConfig:remove']"
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
        :data="ossConfigList"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column v-if="columns[0].visible" label="主建" align="center" prop="ossConfigId" />
        <el-table-column v-if="columns[1].visible" label="配置key" align="center" prop="configKey" fixed="left" />
        <el-table-column v-if="columns[2].visible" label="访问站点" align="center" prop="endpoint" width="200" />
        <el-table-column v-if="columns[3].visible" label="自定义域名" align="center" prop="domainUrl" width="200" />
        <el-table-column v-if="columns[4].visible" label="桶名称" align="center" prop="bucketName" />
        <el-table-column v-if="columns[5].visible" label="前缀" align="center" prop="prefix" />
        <el-table-column v-if="columns[6].visible" label="域" align="center" prop="region" />
        <el-table-column v-if="columns[7].visible" label="桶权限类型" align="center" prop="accessPolicy">
          <template #default="scope">
            <el-tag v-if="scope.row.accessPolicy === '0'" type="warning">private</el-tag>
            <el-tag v-if="scope.row.accessPolicy === '1'" type="success">public</el-tag>
            <el-tag v-if="scope.row.accessPolicy === '2'" type="info">custom</el-tag>
          </template>
        </el-table-column>
        <el-table-column v-if="columns[8].visible" label="是否默认" align="center" prop="status" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'Y' ? 'success' : 'info'" effect="plain">
              {{ scope.row.status === 'Y' ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" align="center" width="220" class-name="small-padding">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-hasPermi="['system:ossConfig:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-popconfirm
                v-if="scope.row.status !== 'Y'"
                v-hasPermi="['system:ossConfig:edit']"
                :title="`确认将「${scope.row.configKey}」设为默认？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="240"
                @confirm="applyStatusChange(scope.row, 'Y')"
              >
                <template #reference>
                  <el-link type="primary" :underline="false">设为默认</el-link>
                </template>
              </el-popconfirm>
              <el-popconfirm
                v-else
                v-hasPermi="['system:ossConfig:edit']"
                :title="`确认取消「${scope.row.configKey}」的默认状态？`"
                confirm-button-text="确定"
                cancel-button-text="取消"
                width="240"
                @confirm="applyStatusChange(scope.row, 'N')"
              >
                <template #reference>
                  <el-link type="danger" :underline="false">取消默认</el-link>
                </template>
              </el-popconfirm>
              <el-link
                v-hasPermi="['system:ossConfig:remove']"
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
    <!-- 添加或修改对象存储配置对话框 -->
    <el-dialog v-model="dialog.visible" :title="dialog.title" width="800px" append-to-body>
      <el-form ref="ossConfigFormRef" :model="form" :rules="rules" label-width="120px">
        <el-form-item label="配置key" prop="configKey">
          <el-input v-model="form.configKey" placeholder="请输入配置key" />
        </el-form-item>
        <el-form-item label="访问站点" prop="endpoint">
          <el-input v-model="form.endpoint" placeholder="请输入访问站点">
            <template #prefix>
              <span style="color: #999">{{ protocol }}</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="自定义域名" prop="domainUrl">
          <el-input v-model="form.domainUrl" placeholder="请输入自定义域名">
            <template #prefix>
              <span style="color: #999">{{ protocol }}</span>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="accessKey" prop="accessKey">
          <el-input v-model="form.accessKey" placeholder="请输入accessKey" />
        </el-form-item>
        <el-form-item label="secretKey" prop="secretKey">
          <el-input v-model="form.secretKey" placeholder="请输入秘钥" show-password />
        </el-form-item>
        <el-form-item label="桶名称" prop="bucketName">
          <el-input v-model="form.bucketName" placeholder="请输入桶名称" />
        </el-form-item>
        <el-form-item label="前缀" prop="prefix">
          <el-input v-model="form.prefix" placeholder="请输入前缀" />
        </el-form-item>
        <el-form-item label="是否HTTPS">
          <el-radio-group v-model="form.isHttps">
            <el-radio v-for="dict in sys_yes_no" :key="dict.value" :value="dict.value">{{ dict.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="桶权限类型">
          <el-radio-group v-model="form.accessPolicy">
            <el-radio value="0">private</el-radio>
            <el-radio value="1">public</el-radio>
            <el-radio value="2">custom</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="域" prop="region">
          <el-input v-model="form.region" placeholder="请输入域" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" placeholder="请输入内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="OssConfig" lang="ts">
import {
  listOssConfig,
  getOssConfig,
  delOssConfig,
  addOssConfig,
  updateOssConfig,
  changeOssConfigStatus
} from '@/api/system/ossConfig';
import { OssConfigForm, OssConfigQuery, OssConfigVO } from '@/api/system/ossConfig/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';

const { sys_yes_no } = toRefs<any>(useDict('sys_yes_no'));
const ossConfigList = ref<OssConfigVO[]>([]);
const buttonLoading = ref(false);
const { loading, setLoading, withLoading } = useLoading(true);
const total = ref(0);

const queryFormRef = ref<ElFormInstance>();
const ossConfigFormRef = ref<ElFormInstance>();

// 列显隐信息
const columns = ref<FieldOption[]>([
  { key: 0, label: `主建`, visible: false },
  { key: 1, label: `配置key`, visible: true },
  { key: 2, label: `访问站点`, visible: true },
  { key: 3, label: `自定义域名`, visible: true },
  { key: 4, label: `桶名称`, visible: true },
  { key: 5, label: `前缀`, visible: true },
  { key: 6, label: `域`, visible: true },
  { key: 7, label: `桶权限类型`, visible: true },
  { key: 8, label: `状态`, visible: true }
]);

const initFormData: OssConfigForm = {
  ossConfigId: undefined,
  configKey: '',
  accessKey: '',
  secretKey: '',
  bucketName: '',
  prefix: '',
  endpoint: '',
  domainUrl: '',
  isHttps: 'N',
  accessPolicy: '1',
  region: '',
  status: 'N',
  remark: ''
};
const data = reactive<PageData<OssConfigForm, OssConfigQuery>>({
  form: { ...initFormData },
  // 查询参数
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    configKey: '',
    bucketName: '',
    status: ''
  },
  rules: {
    configKey: [{ required: true, message: 'configKey不能为空', trigger: 'blur' }],
    accessKey: [
      { required: true, message: 'accessKey不能为空', trigger: 'blur' },
      {
        min: 2,
        max: 200,
        message: 'accessKey长度必须介于 2 和 100 之间',
        trigger: 'blur'
      }
    ],
    secretKey: [
      { required: true, message: 'secretKey不能为空', trigger: 'blur' },
      {
        min: 2,
        max: 100,
        message: 'secretKey长度必须介于 2 和 100 之间',
        trigger: 'blur'
      }
    ],
    bucketName: [
      { required: true, message: 'bucketName不能为空', trigger: 'blur' },
      {
        min: 2,
        max: 100,
        message: 'bucketName长度必须介于 2 和 100 之间',
        trigger: 'blur'
      }
    ],
    endpoint: [
      { required: true, message: 'endpoint不能为空', trigger: 'blur' },
      {
        min: 2,
        max: 100,
        message: 'endpoint名称长度必须介于 2 和 100 之间',
        trigger: 'blur'
      }
    ],
    accessPolicy: [{ required: true, message: 'accessPolicy不能为空', trigger: 'blur' }]
  }
});

const { queryParams, form, rules } = toRefs(data);
const protocol = computed(() => (form.value.isHttps === 'Y' ? 'https://' : 'http://'));
const { ids, single, multiple, handleSelectionChange } = useTableSelection<OssConfigVO>(item => item.ossConfigId);
const {
  dialog,
  resetForm: reset,
  openDialog,
  showDialog,
  closeDialog
} = useFormDialog({
  form,
  formRef: ossConfigFormRef,
  initialFormData: initFormData
});

/** 查询对象存储配置列表 */
const getList = async () => {
  await withLoading(async () => {
    const res = await listOssConfig(queryParams.value);
    ossConfigList.value = res.data?.rows;
    total.value = res.data?.total;
  });
};
/** 取消按钮 */
const cancel = () => {
  reset();
  closeDialog();
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
  openDialog('添加对象存储配置');
};
/** 修改按钮操作 */
const handleUpdate = async (row?: Partial<OssConfigVO>) => {
  reset();
  const ossConfigId = row?.ossConfigId || ids.value[0];
  const res = await getOssConfig(ossConfigId);
  Object.assign(form.value, res.data);
  showDialog('修改对象存储配置');
};
/** 提交按钮 */
const submitForm = () => {
  ossConfigFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      buttonLoading.value = true;
      if (form.value.ossConfigId) {
        await updateOssConfig(form.value).finally(() => (buttonLoading.value = false));
      } else {
        await addOssConfig(form.value).finally(() => (buttonLoading.value = false));
      }
      modal.msgSuccess('新增成功');
      closeDialog();
      await getList();
    }
  });
};
/** 操作列设为默认/取消默认 */
const applyStatusChange = (row: Partial<OssConfigVO>, status: string) => {
  row.status = status;
  return handleStatusChange(row);
};

/** 状态修改  */
const handleStatusChange = async (row: Partial<OssConfigVO>) => {
  const text = row.status === 'Y' ? '设为默认' : '取消默认';
  try {
    await changeOssConfigStatus(row.ossConfigId, row.status, row.configKey);
    await getList();
    modal.msgSuccess(text + '成功');
  } catch {
    row.status = row.status === 'Y' ? 'N' : 'Y';
  }
};
/** 删除按钮操作 */
const handleDelete = async (row?: Partial<OssConfigVO>) => {
  const ossConfigIds = row?.ossConfigId || ids.value;
  await modal.confirm('是否确认删除OSS配置编号为"' + ossConfigIds + '"的数据项?');
  setLoading(true);
  await delOssConfig(ossConfigIds).finally(() => setLoading(false));
  await getList();
  modal.msgSuccess('删除成功');
};

onMounted(() => {
  getList();
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/components/page-shell' as pageShell;

@include pageShell.table-crud-page;
</style>
