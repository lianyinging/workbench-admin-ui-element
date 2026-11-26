<template>
  <div class="p-2 app-container system-message-template-page">
    <el-card shadow="hover" class="table-panel">
      <template #header>
        <div class="table-heading">
          <h3>消息模板</h3>
        </div>
      </template>

      <el-form ref="queryFormRef" :model="queryParams" :inline="true" class="query-form filter-bar">
        <el-form-item label="模板名称" prop="templateName">
          <el-input
            v-model="queryParams.templateName"
            class="filter-control"
            placeholder="请输入模板名称"
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
        <el-form-item label="消息类型" prop="messageType">
          <el-select v-model="queryParams.messageType" class="filter-control" placeholder="请选择消息类型" clearable>
            <el-option v-for="item in messageTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
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
        <el-form-item label="状态" prop="status">
          <el-select v-model="queryParams.status" class="filter-control" placeholder="请选择状态" clearable>
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
          <el-button v-hasPermi="['system:messageTemplate:add']" type="primary" icon="Plus" @click="handleAdd">新增</el-button>
          <el-button
            v-hasPermi="['system:messageTemplate:edit']"
            :disabled="single"
            icon="Edit"
            @click="handleUpdate()"
          >
            修改
          </el-button>
          <el-button
            v-hasPermi="['system:messageTemplate:remove']"
            type="danger"
            plain
            icon="Delete"
            :disabled="multiple"
            @click="handleDelete()"
          >
            删除
          </el-button>
          <el-button v-hasPermi="['system:messageTemplate:export']" type="warning" plain icon="Download" @click="handleExport">
            导出
          </el-button>
          <el-button
            v-hasPermi="['system:messageTemplate:remove']"
            type="danger"
            plain
            icon="Refresh"
            @click="handleRefreshCache"
          >
            刷新缓存
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
        :data="messageTemplateList"
        @selection-change="handleSelectionChange"
        @sort-change="handleSortChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column label="模板名称" align="center" prop="templateName" fixed="left" />
        <el-table-column
          label="消息key"
          align="center"
          prop="messageKey"
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
        />
        <el-table-column label="消息类型" align="center" prop="messageType">
          <template #default="scope">
            <dict-tag :options="messageTypeOptions" :value="scope.row.messageType" />
          </template>
        </el-table-column>
        <el-table-column label="支持平台标识" align="center" prop="supplierType">
          <template #default="scope">
            <dict-tag :options="supplierTypeOptions" :value="scope.row.supplierType" />
          </template>
        </el-table-column>
        <el-table-column label="模板类型" align="center" prop="templateMode">
          <template #default="scope">
            <dict-tag :options="sys_message_template_mode" :value="scope.row.templateMode" />
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center" prop="status">
          <template #default="scope">
            <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
          </template>
        </el-table-column>
        <el-table-column label="内容" align="center" prop="content" :show-overflow-tooltip="true" />
        <el-table-column label="备注" align="center" prop="remark" :show-overflow-tooltip="true" />
        <el-table-column
          label="更新时间"
          align="center"
          prop="updateTime"
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
          sortable="custom"
          :sort-orders="['descending', 'ascending']"
        >
          <template #default="scope">
            <span>{{ parseTime(scope.row.createTime) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width" width="200" fixed="right">
          <template #default="scope">
            <div class="op-links">
              <el-link
                v-hasPermi="['system:messageTemplate:test']"
                type="primary"
                :underline="false"
                @click="handleTest(scope.row)"
              >
                测试
              </el-link>
              <el-link
                v-hasPermi="['system:messageTemplate:query']"
                type="primary"
                :underline="false"
                @click="handleDetail(scope.row)"
              >
                详情
              </el-link>
              <el-link
                v-hasPermi="['system:messageTemplate:edit']"
                type="primary"
                :underline="false"
                @click="handleUpdate(scope.row)"
              >
                修改
              </el-link>
              <el-link
                v-hasPermi="['system:messageTemplate:remove']"
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

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.title"
      width="760px"
      append-to-body
      destroy-on-close
      top="5vh"
      @closed="handleDialogClosed"
    >
      <el-form ref="messageTemplateFormRef" :model="form" :rules="rules" label-width="100px">
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="模板名称" prop="templateName">
              <el-input v-model="form.templateName" placeholder="请输入模板名称" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消息key" prop="messageKeyId">
              <el-select v-model="form.messageKeyId" placeholder="请选择消息key" clearable filterable>
                <el-option
                  v-for="item in messageKeys"
                  :key="item.messageKeyId"
                  :label="item.name"
                  :value="item.messageKeyId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="消息类型" prop="messageType">
              <el-select
                v-model="form.messageType"
                placeholder="请选择消息类型"
                clearable
                @change="handleMessageTypeChange"
              >
                <el-option v-for="item in messageTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-show="form.messageType" :span="12">
            <el-form-item label="消息配置" prop="messageConfigId">
              <el-select
                v-model="form.messageConfigId"
                placeholder="请选择消息配置"
                filterable
                clearable
                @change="form.templateMode = undefined"
              >
                <el-option
                  v-for="item in messageConfigs"
                  :key="item.messageConfigId"
                  :label="item.title"
                  :value="item.messageConfigId"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="form.messageType === 'SMS'" :span="12">
            <el-form-item label="签名" prop="signature">
              <el-input v-model="form.signature" placeholder="请输入签名" clearable />
            </el-form-item>
          </el-col>
          <el-col v-if="form.messageType === 'MAIL'" :span="12">
            <el-form-item label="标题" prop="title">
              <el-input
                v-model="form.title"
                placeholder="请输入标题"
                clearable
                @change="handleVarsChange"
              />
              <div class="field-help">支持变量模式：${title}</div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio v-for="dict in sys_normal_disable" :key="dict.value" :value="Number(dict.value)">
                  {{ dict.label }}
                </el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col v-show="form.messageConfigId" :span="12">
            <el-form-item label="模板类型" prop="templateMode">
              <el-select v-model="form.templateMode" placeholder="请选择模板类型" clearable>
                <el-option
                  v-for="dict in filteredTemplateModes"
                  :key="dict.value"
                  :label="dict.label"
                  :value="dict.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col v-if="form.templateMode === 'TEMPLATE_ID'" :span="12">
            <el-form-item label="模板ID" prop="templateId">
              <el-input v-model="form.templateId" placeholder="请输入模板ID" clearable />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="内容" prop="content">
              <template #label>
                <span>内容</span>
              </template>
              <el-input v-model="form.content" type="textarea" :rows="5" placeholder="请输入内容" @change="handleVarsChange" />
              <div class="field-help">
                <b>变量格式</b>：${name}；例如，尊敬的 ${name}，您的快递已飞奔在路上，将今天 ${time} 送达您的手里，请留意查收。
              </div>
              <div v-if="form.templateMode === 'TEMPLATE_ID'" class="field-help is-danger">
                <b>模版内容以实际平台配置的内容为准</b>
              </div>
            </el-form-item>
          </el-col>
          <el-col v-if="form.varsList?.length" :span="24">
            <el-form-item label="变量属性">
              <el-form-item
                v-for="(item, index) in form.varsList"
                :key="item.key"
                :label="item.key"
                :prop="`varsList.${index}.value`"
                :rules="[{ required: true, message: '输入变量不能为空', trigger: 'blur' }]"
              >
                <el-input v-model="form.varsList[index].value" />
              </el-form-item>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="备注" prop="remark">
              <el-input v-model="form.remark" type="textarea" placeholder="请输入备注" />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="buttonLoading" type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialog.visible" title="消息模板详情" width="860px" append-to-body>
      <el-descriptions v-loading="detailLoading" :column="2" border>
        <el-descriptions-item label="消息模板id">{{ detailForm.messageTemplateId }}</el-descriptions-item>
        <el-descriptions-item label="模板名称">{{ detailForm.templateName }}</el-descriptions-item>
        <el-descriptions-item label="消息配置id">{{ detailForm.messageConfigId }}</el-descriptions-item>
        <el-descriptions-item label="消息key">{{ detailForm.messageKey }}</el-descriptions-item>
        <el-descriptions-item label="消息类型">
          <dict-tag :options="messageTypeOptions" :value="detailForm.messageType" />
        </el-descriptions-item>
        <el-descriptions-item label="支持平台类型">
          <dict-tag :options="supplierTypeOptions" :value="detailForm.supplierType" />
        </el-descriptions-item>
        <el-descriptions-item label="模板类型">
          <dict-tag :options="sys_message_template_mode" :value="detailForm.templateMode" />
        </el-descriptions-item>
        <el-descriptions-item label="标题">{{ detailForm.title }}</el-descriptions-item>
        <el-descriptions-item label="签名">{{ detailForm.signature }}</el-descriptions-item>
        <el-descriptions-item label="模板id">{{ detailForm.templateId }}</el-descriptions-item>
        <el-descriptions-item label="内容" :span="2">
          <div v-html="detailForm.content"></div>
        </el-descriptions-item>
        <el-descriptions-item label="输入变量" :span="2">{{ detailForm.varsJson }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <dict-tag :options="sys_normal_disable" :value="detailForm.status" />
        </el-descriptions-item>
        <el-descriptions-item label="备注" :span="2">{{ detailForm.remark }}</el-descriptions-item>
        <el-descriptions-item label="更新时间">{{ parseTime(detailForm.updateTime) }}</el-descriptions-item>
        <el-descriptions-item label="创建时间">{{ parseTime(detailForm.createTime) }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog v-model="testDialog.visible" title="消息模板测试" width="520px" append-to-body destroy-on-close>
      <el-form ref="testFormRef" :model="formTest" :rules="testRules" label-width="100px">
        <el-form-item label="发送账号" prop="account">
          <el-input v-model="formTest.account" placeholder="请输入手机号/邮箱" clearable />
        </el-form-item>
        <template v-for="(value, key) in formTest.vars" :key="key">
          <el-form-item :label="String(key)" :prop="`vars.${key}`" :rules="[{ required: true, message: '输入变量不能为空', trigger: 'blur' }]">
            <el-input v-model="formTest.vars![key]" />
          </el-form-item>
        </template>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button :loading="testLoading" type="primary" @click="submitTestForm">发送测试</el-button>
          <el-button @click="closeTestDialog">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="MessageTemplate" lang="ts">
import { getMessageFieldConfigs, getMessageSupplierType } from '@/api/system/messageConfig';
import type { MessageConfigVO, MessageFieldConfig, MessageTypeVo } from '@/api/system/messageConfig/types';
import type { MessageKeyVO } from '@/api/system/messageKey/types';
import {
  addMessageTemplate,
  delMessageTemplate,
  getMessageConfigs,
  getMessageKeys,
  getMessageTemplate,
  listMessageTemplate,
  refreshMessageTemplateCache,
  sendMessageTest,
  updateMessageTemplate
} from '@/api/system/messageTemplate';
import type {
  MessageTemplateForm,
  MessageTemplateQuery,
  MessageTemplateTest,
  MessageTemplateVar,
  MessageTemplateVO
} from '@/api/system/messageTemplate/types';
import { useLoading } from '@/hooks/async/useLoading';
import { useDialogState } from '@/hooks/dialog/useDialogState';
import { useFormDialog } from '@/hooks/dialog/useFormDialog';
import { useSearchReset } from '@/hooks/form/useSearchReset';
import { useTableSelection } from '@/hooks/table/useTableSelection';
import modal from '@/plugins/modal';
import { useDict } from '@/utils/dict';
import { download as requestDownload } from '@/utils/request';
import { parseTime } from '@/utils/ruoyi';

const { sys_message_template_mode, sys_normal_disable } = toRefs<any>(
  useDict('sys_message_template_mode', 'sys_normal_disable')
);

const messageTemplateList = ref<MessageTemplateVO[]>([]);
const messageKeys = ref<MessageKeyVO[]>([]);
const messageConfigs = ref<MessageConfigVO[]>([]);
const messageFieldConfigs = ref<Record<string, MessageFieldConfig>>({});
const supplierTypeList = ref<MessageTypeVo[]>([]);

const { loading, withLoading } = useLoading(true);
const { loading: buttonLoading, withLoading: withButtonLoading } = useLoading();
const { loading: testLoading, withLoading: withTestLoading } = useLoading();
const total = ref(0);
const detailLoading = ref(false);

const queryFormRef = ref<ElFormInstance>();
const messageTemplateFormRef = ref<ElFormInstance>();
const testFormRef = ref<ElFormInstance>();

const initFormData: MessageTemplateForm = {
  messageTemplateId: undefined,
  templateName: undefined,
  messageConfigId: undefined,
  messageKeyId: undefined,
  messageType: undefined,
  templateMode: undefined,
  title: undefined,
  signature: undefined,
  templateId: undefined,
  content: undefined,
  varsList: [],
  status: 1,
  remark: undefined
};

const formTest = ref<MessageTemplateTest>({ vars: {} });

const data = reactive<PageData<MessageTemplateForm, MessageTemplateQuery>>({
  form: { ...initFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    templateName: undefined,
    messageKey: undefined,
    messageType: undefined,
    templateMode: undefined,
    status: undefined
  },
  rules: {
    templateName: [{ required: true, message: '模板名称不能为空', trigger: 'blur' }],
    messageConfigId: [{ required: true, message: '消息配置不能为空', trigger: 'change' }],
    messageKeyId: [{ required: true, message: '消息key不能为空', trigger: 'change' }],
    messageType: [{ required: true, message: '消息类型不能为空', trigger: 'change' }],
    title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
    templateMode: [{ required: true, message: '模板类型不能为空', trigger: 'change' }],
    status: [{ required: true, message: '状态不能为空', trigger: 'change' }],
    templateId: [{ required: true, message: '模板ID不能为空', trigger: 'blur' }],
    content: [{ required: true, message: '内容不能为空', trigger: 'blur' }]
  }
});

const testRules = {
  account: [{ required: true, message: '账号不能为空', trigger: 'blur' }]
};

const { queryParams, form, rules } = toRefs(data);
const { ids, single, multiple, handleSelectionChange } = useTableSelection<MessageTemplateVO>(
  item => item.messageTemplateId!
);

const { dialog, resetForm, openDialog, showDialog, closeDialog } = useFormDialog({
  form,
  formRef: messageTemplateFormRef,
  initialFormData: initFormData
});
const { dialog: detailDialog, openDialog: openDetailDialog } = useDialogState('消息模板详情');
const { dialog: testDialog, openDialog: openTestDialog, closeDialog: closeTestDialog } = useDialogState('消息模板测试');
const detailForm = ref<MessageTemplateVO>({});

const varRegExp = /\$\{([^}]+)\}/g;

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

const currentMessageFieldConfig = computed<MessageFieldConfig | null>(() => {
  if (!form.value.messageConfigId) {
    return null;
  }
  const config = messageConfigs.value.find(item => item.messageConfigId === form.value.messageConfigId);
  if (!config?.supplierType) {
    return null;
  }
  return messageFieldConfigs.value[config.supplierType] ?? null;
});

const filteredTemplateModes = computed(() =>
  sys_message_template_mode.value.filter((dict: DictDataOption) => {
    const mode = currentMessageFieldConfig.value?.templateMode;
    if (!mode) {
      return true;
    }
    return (
      (dict.value === 'TEMPLATE_ID' && mode.supportTemplateId) ||
      (dict.value === 'TEMPLATE_CONTENT' && mode.supportTemplateContent)
    );
  })
);

function getVars(...contents: string[]) {
  let vars: string[] = [];
  contents.forEach(content => {
    if (!content) {
      return;
    }
    const rex = new RegExp(varRegExp);
    let temp: RegExpExecArray | null;
    do {
      temp = rex.exec(content);
      if (temp) {
        vars.push(temp[1]);
      }
    } while (temp);
  });
  return vars.filter((value, index) => vars.indexOf(value) === index);
}

const handleVarsChange = () => {
  const vars =
    form.value.messageType === 'SMS'
      ? getVars(form.value.content ?? '')
      : getVars(form.value.title ?? '', form.value.content ?? '');
  form.value.varsList = vars.map<MessageTemplateVar>(key => {
    const existing = form.value.varsList?.find(item => item.key === key);
    return { key, value: existing?.value ?? `\${${key}}` };
  });
};

const getList = async () => {
  await withLoading(async () => {
    const res = await listMessageTemplate(queryParams.value);
    messageTemplateList.value = res.data?.rows ?? [];
    total.value = res.data?.total ?? 0;
  });
};

const handleSortChange = (column: { prop: string; order: 'ascending' | 'descending' | null }) => {
  queryParams.value.orderByColumn = column.prop;
  queryParams.value.isAsc = column.order ?? undefined;
  getList();
};

const handleMessageTypeChange = async (messageType?: string) => {
  form.value.messageConfigId = undefined;
  messageTemplateFormRef.value?.clearValidate(['messageConfigId']);
  if (!messageType) {
    messageConfigs.value = [];
    return;
  }
  const res = await getMessageConfigs(messageType);
  messageConfigs.value = res.data ?? [];
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

const loadMessageKeys = async () => {
  const res = await getMessageKeys();
  messageKeys.value = res.data ?? [];
};

const handleAdd = async () => {
  resetForm();
  form.value.status = 1;
  form.value.varsList = [];
  await loadMessageKeys();
  openDialog('添加消息模板');
};

const handleTest = async (row: MessageTemplateVO) => {
  formTest.value = { vars: {} };
  const res = await getMessageTemplate(row.messageTemplateId!);
  const data = res.data ?? {};
  const values: MessageTemplateVar[] = data.varsJson ? JSON.parse(data.varsJson as string) : [];
  let vars: Record<string, string> = {};

  const mergeVars = (value?: string) => {
    if (!value) {
      return;
    }
    vars = {
      ...vars,
      ...Object.fromEntries(
        getVars(value).map(item => {
          if (item.includes(':')) {
            const parts = item.split(':');
            return [parts[0], parts[1]];
          }
          return [item, ''];
        })
      )
    };
  };

  values.forEach(item => mergeVars(item.value));
  mergeVars(data.title);
  formTest.value = { messageTemplateId: data.messageTemplateId, vars };
  openTestDialog();
};

const handleDetail = async (row: MessageTemplateVO) => {
  detailLoading.value = true;
  openDetailDialog();
  try {
    const res = await getMessageTemplate(row.messageTemplateId!);
    detailForm.value = res.data ?? {};
  } finally {
    detailLoading.value = false;
  }
};

const handleUpdate = async (row?: Partial<MessageTemplateVO>) => {
  resetForm();
  const messageTemplateId = row?.messageTemplateId ?? ids.value[0];
  const res = await getMessageTemplate(messageTemplateId);
  const payload = res.data ?? {};
  const varsList = payload.varsJson ? JSON.parse(payload.varsJson as string) : [];
  form.value = { ...payload, varsList: Array.isArray(varsList) ? varsList : [] };
  if (form.value.messageType) {
    const configRes = await getMessageConfigs(form.value.messageType);
    messageConfigs.value = configRes.data ?? [];
  }
  await loadMessageKeys();
  showDialog('修改消息模板');
};

const submitForm = () => {
  messageTemplateFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    await withButtonLoading(async () => {
      const submitData = {
        ...form.value,
        varsJson: JSON.stringify(form.value.varsList ?? [])
      };
      if (form.value.messageTemplateId) {
        await updateMessageTemplate(submitData);
      } else {
        await addMessageTemplate(submitData);
      }
    });
    modal.msgSuccess('操作成功');
    closeDialog();
    await getList();
  });
};

const submitTestForm = () => {
  testFormRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    await withTestLoading(async () => {
      await sendMessageTest(formTest.value);
    });
    modal.msgSuccess('已提交发送申请');
    closeTestDialog();
  });
};

const handleDelete = async (row?: Partial<MessageTemplateVO>) => {
  const messageTemplateIds = row?.messageTemplateId ?? ids.value;
  await modal.confirm(`是否确认删除消息模板编号为"${messageTemplateIds}"的数据项？`);
  await delMessageTemplate(messageTemplateIds as number | string);
  modal.msgSuccess('删除成功');
  await getList();
};

const handleRefreshCache = async () => {
  await modal.confirm('是否确认刷新消息模板缓存？');
  await refreshMessageTemplateCache();
  modal.msgSuccess('刷新成功');
};

const handleExport = () => {
  requestDownload('system/messageTemplate/export', { ...queryParams.value }, `messageTemplate_${Date.now()}.xlsx`);
};

const initMessageFieldConfigs = async () => {
  const [fieldRes, supplierRes] = await Promise.all([getMessageFieldConfigs(), getMessageSupplierType()]);
  messageFieldConfigs.value = fieldRes.data ?? {};
  supplierTypeList.value = supplierRes.data ?? [];
};

onMounted(() => {
  getList();
  initMessageFieldConfigs();
});
</script>

<style lang="scss" scoped>
@use '@/assets/styles/components/page-shell' as pageShell;

@include pageShell.table-crud-page;

.field-help {
  margin-top: 6px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;

  &.is-danger {
    color: var(--el-color-danger);
  }
}
</style>