<template>
  <div class="p-2 app-container dict-page">
    <el-row :gutter="16" class="dict-grid">
      <!-- 字典类型 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="dict-card table-panel">
          <template #header>
            <div class="table-heading">
              <h3>字典管理</h3>
            </div>
          </template>

          <el-form ref="typeQueryFormRef" :model="typeQueryParams" :inline="true" class="query-form filter-bar">
            <el-form-item label="字典名称" prop="dictName">
              <el-input
                v-model="typeQueryParams.dictName"
                class="filter-control"
                placeholder="请输入字典名称"
                clearable
                @keyup.enter="handleTypeQuery"
              />
            </el-form-item>
            <el-form-item label="字典类型" prop="dictType">
              <el-input
                v-model="typeQueryParams.dictType"
                class="filter-control"
                placeholder="请输入字典类型"
                clearable
                @keyup.enter="handleTypeQuery"
              />
            </el-form-item>
            <el-form-item class="filter-actions">
              <el-button type="primary" icon="Search" @click="handleTypeQuery">搜索</el-button>
              <el-button icon="Refresh" @click="handleTypeResetQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <div class="list-toolbar">
            <div class="list-toolbar__left">
              <el-button v-hasPermi="['system:dict:add']" type="primary" icon="Plus" @click="handleTypeAdd">
                新增
              </el-button>
              <el-button
                v-hasPermi="['system:dict:edit']"
                :disabled="typeSingle"
                icon="Edit"
                @click="handleTypeUpdate()"
              >
                修改
              </el-button>
              <el-button
                v-hasPermi="['system:dict:remove']"
                type="danger"
                plain
                icon="Delete"
                :disabled="typeMultiple"
                @click="handleTypeDelete()"
              >
                删除
              </el-button>
              <el-button
                v-hasPermi="['system:dict:export']"
                type="warning"
                plain
                icon="Download"
                @click="handleTypeExport"
              >
                导出
              </el-button>
              <el-button
                v-hasPermi="['system:dict:remove']"
                type="danger"
                plain
                icon="Refresh"
                @click="handleRefreshCache"
              >
                刷新缓存
              </el-button>
            </div>
            <div class="list-toolbar__right">
              <el-button circle icon="Refresh" title="刷新" @click="getTypeList" />
            </div>
          </div>

          <div class="dict-table-wrap">
            <el-table
              ref="typeTableRef"
              v-loading="typeLoading"
              border
              class="data-table"
              :data="typeList"
              highlight-current-row
              @row-click="handleTypeRowClick"
              @selection-change="handleTypeSelectionChange"
            >
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column v-if="false" label="字典编号" align="center" prop="dictId" />
              <el-table-column label="字典名称" align="center" prop="dictName" width="120" fixed="left" />
              <el-table-column label="字典类型" align="center" prop="dictType" width="160">
                <template #default="scope">
                  <span class="link-type" @click.stop="handleTypeRowClick(scope.row)">
                    {{ scope.row.dictType }}
                  </span>
                </template>
              </el-table-column>
              <el-table-column label="备注" align="center" prop="remark" width="160" />
              <el-table-column label="创建时间" align="center" prop="createTime" width="180">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                fixed="right"
                align="center"
                width="120"
                class-name="small-padding fixed-width"
              >
                <template #default="scope">
                  <div class="op-links">
                    <el-link
                      v-hasPermi="['system:dict:edit']"
                      type="primary"
                      :underline="false"
                      @click="handleTypeUpdate(scope.row)"
                    >
                      修改
                    </el-link>
                    <el-link
                      v-hasPermi="['system:dict:remove']"
                      type="danger"
                      :underline="false"
                      @click="handleTypeDelete(scope.row)"
                    >
                      删除
                    </el-link>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <pagination
            v-show="typeTotal > 0"
            v-model:page="typeQueryParams.pageNum"
            v-model:limit="typeQueryParams.pageSize"
            :total="typeTotal"
            @pagination="getTypeList"
          />
        </el-card>
      </el-col>

      <!-- 字典数据 -->
      <el-col :xs="24" :lg="12">
        <el-card shadow="hover" class="dict-card table-panel">
          <template #header>
            <div class="table-heading">
              <h3>字典数据</h3>
            </div>
          </template>

          <el-form ref="dataQueryFormRef" :model="dataQueryParams" :inline="true" class="query-form filter-bar">
            <el-form-item label="字典标签" prop="dictLabel">
              <el-input
                v-model="dataQueryParams.dictLabel"
                class="filter-control"
                placeholder="请输入字典标签"
                clearable
                :disabled="!hasCurrentDict"
                @keyup.enter="handleDataQuery"
              />
            </el-form-item>
            <el-form-item class="filter-actions">
              <el-button type="primary" icon="Search" :disabled="!hasCurrentDict" @click="handleDataQuery">
                搜索
              </el-button>
              <el-button icon="Refresh" :disabled="!hasCurrentDict" @click="handleDataResetQuery">重置</el-button>
            </el-form-item>
          </el-form>

          <div class="list-toolbar">
            <div class="list-toolbar__left">
              <el-button
                v-hasPermi="['system:dict:add']"
                type="primary"
                icon="Plus"
                :disabled="!hasCurrentDict"
                @click="handleDataAdd"
              >
                新增
              </el-button>
              <el-button
                v-hasPermi="['system:dict:edit']"
                icon="Edit"
                :disabled="dataSingle || !hasCurrentDict"
                @click="handleDataUpdate()"
              >
                修改
              </el-button>
              <el-button
                v-hasPermi="['system:dict:remove']"
                type="danger"
                plain
                icon="Delete"
                :disabled="dataMultiple || !hasCurrentDict"
                @click="handleDataDelete()"
              >
                删除
              </el-button>
              <el-button
                v-hasPermi="['system:dict:export']"
                type="warning"
                plain
                icon="Download"
                :disabled="!hasCurrentDict"
                @click="handleDataExport"
              >
                导出
              </el-button>
            </div>
            <div class="list-toolbar__right">
              <el-button circle icon="Refresh" title="刷新" :disabled="!hasCurrentDict" @click="getDataList" />
            </div>
          </div>

          <div class="dict-table-wrap">
            <el-table
              v-loading="dataLoading"
              border
              class="data-table"
              :data="dataList"
              @selection-change="handleDataSelectionChange"
            >
              <el-table-column type="selection" width="55" align="center" />
              <el-table-column v-if="false" label="字典编码" align="center" prop="dictCode" />
              <el-table-column label="字典标签" align="center" prop="dictLabel" width="100" fixed="left">
                <template #default="scope">
                  <span
                    v-if="
                      (scope.row.listClass === '' || scope.row.listClass === 'default') &&
                      (scope.row.cssClass === '' || scope.row.cssClass == null)
                    "
                  >
                    {{ scope.row.dictLabel }}
                  </span>
                  <el-tag
                    v-else
                    :type="
                      scope.row.listClass === 'primary' || scope.row.listClass === 'default'
                        ? 'primary'
                        : scope.row.listClass
                    "
                    :class="scope.row.cssClass"
                  >
                    {{ scope.row.dictLabel }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="字典键值" align="center" prop="dictValue" width="100" />
              <el-table-column label="字典排序" align="center" prop="dictSort" width="80" />
              <el-table-column label="备注" align="center" prop="remark" width="100" />
              <el-table-column label="创建时间" align="center" prop="createTime" width="180">
                <template #default="scope">
                  <span>{{ parseTime(scope.row.createTime) }}</span>
                </template>
              </el-table-column>
              <el-table-column
                label="操作"
                fixed="right"
                align="center"
                width="120"
                class-name="small-padding fixed-width"
              >
                <template #default="scope">
                  <div class="op-links">
                    <el-link
                      v-hasPermi="['system:dict:edit']"
                      type="primary"
                      :underline="false"
                      @click="handleDataUpdate(scope.row)"
                    >
                      修改
                    </el-link>
                    <el-link
                      v-hasPermi="['system:dict:remove']"
                      type="danger"
                      :underline="false"
                      @click="handleDataDelete(scope.row)"
                    >
                      删除
                    </el-link>
                  </div>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <pagination
            v-show="dataTotal > 0"
            v-model:page="dataQueryParams.pageNum"
            v-model:limit="dataQueryParams.pageSize"
            :total="dataTotal"
            @pagination="getDataList"
          />
        </el-card>
      </el-col>
    </el-row>

    <!-- 字典类型对话框 -->
    <el-dialog v-model="typeDialog.visible" :title="typeDialog.title" width="500px" append-to-body>
      <el-form ref="typeFormRef" :model="typeForm" :rules="typeRules" label-width="100px">
        <el-form-item label="字典名称" prop="dictName">
          <el-input v-model="typeForm.dictName" placeholder="请输入字典名称" />
        </el-form-item>
        <el-form-item prop="dictType">
          <template #label>
            <span>
              <el-tooltip content="数据存储中的Key值，如：sys_user_gender" placement="top">
                <i class="el-icon-question"></i>
              </el-tooltip>
              字典类型
            </span>
          </template>
          <el-input v-model="typeForm.dictType" placeholder="请输入字典类型" maxlength="100" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="typeForm.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitTypeForm">确 定</el-button>
          <el-button @click="cancelType">取 消</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 字典数据对话框 -->
    <el-dialog v-model="dataDialog.visible" :title="dataDialog.title" width="500px" append-to-body>
      <el-form ref="dataFormRef" :model="dataForm" :rules="dataRules" label-width="80px">
        <el-form-item label="字典类型">
          <el-input v-model="dataForm.dictType" :disabled="true" />
        </el-form-item>
        <el-form-item label="数据标签" prop="dictLabel">
          <el-input v-model="dataForm.dictLabel" placeholder="请输入数据标签" />
        </el-form-item>
        <el-form-item label="数据键值" prop="dictValue">
          <el-input v-model="dataForm.dictValue" placeholder="请输入数据键值" />
        </el-form-item>
        <el-form-item label="样式属性" prop="cssClass">
          <el-input v-model="dataForm.cssClass" placeholder="请输入样式属性" />
        </el-form-item>
        <el-form-item label="显示排序" prop="dictSort">
          <el-input-number v-model="dataForm.dictSort" controls-position="right" :min="0" />
        </el-form-item>
        <el-form-item label="回显样式" prop="listClass">
          <el-select v-model="dataForm.listClass">
            <el-option
              v-for="item in listClassOptions"
              :key="item.value"
              :label="item.label + '(' + item.value + ')'"
              :value="item.value"
            ></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="dataForm.remark" type="textarea" placeholder="请输入内容"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitDataForm">确 定</el-button>
          <el-button @click="cancelData">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Dict" lang="ts">
import { listData, getData, delData, addData, updateData } from '@/api/system/dict/data';
import { DictDataForm, DictDataQuery, DictDataVO } from '@/api/system/dict/data/types';
import { listType, getType, delType, addType, updateType, refreshCache } from '@/api/system/dict/type';
import { DictTypeForm, DictTypeQuery, DictTypeVO } from '@/api/system/dict/type/types';
import modal from '@/plugins/modal';
import { useDictStore } from '@/store/modules/dict';
import { download as requestDownload } from '@/utils/request';
import { parseTime } from '@/utils/ruoyi';

const typeList = ref<DictTypeVO[]>([]);
const typeLoading = ref(true);
const typeIds = ref<Array<number | string>>([]);
const typeSingle = ref(true);
const typeMultiple = ref(true);
const typeTotal = ref(0);

const typeFormRef = ref<ElFormInstance>();
const typeQueryFormRef = ref<ElFormInstance>();
const typeTableRef = ref<ElTableInstance>();

const typeDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const typeInitFormData: DictTypeForm = {
  dictId: undefined,
  dictName: '',
  dictType: '',
  remark: ''
};

const typeState = reactive<PageData<DictTypeForm, DictTypeQuery>>({
  form: { ...typeInitFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dictName: '',
    dictType: ''
  },
  rules: {
    dictName: [{ required: true, message: '字典名称不能为空', trigger: 'blur' }],
    dictType: [{ required: true, message: '字典类型不能为空', trigger: 'blur' }]
  }
});

const { queryParams: typeQueryParams, form: typeForm, rules: typeRules } = toRefs(typeState);

const currentDict = ref<DictTypeVO | null>(null);
const hasCurrentDict = computed(() => !!currentDict.value);

const dataList = ref<DictDataVO[]>([]);
const dataLoading = ref(false);
const dataIds = ref<Array<string | number>>([]);
const dataSingle = ref(true);
const dataMultiple = ref(true);
const dataTotal = ref(0);

const dataFormRef = ref<ElFormInstance>();
const dataQueryFormRef = ref<ElFormInstance>();

const dataDialog = reactive<DialogOption>({
  visible: false,
  title: ''
});

const listClassOptions = ref<Array<{ value: string; label: string }>>([
  { value: 'default', label: '默认' },
  { value: 'primary', label: '主要' },
  { value: 'success', label: '成功' },
  { value: 'info', label: '信息' },
  { value: 'warning', label: '警告' },
  { value: 'danger', label: '危险' }
]);

const dataInitFormData: DictDataForm = {
  dictCode: undefined,
  dictLabel: '',
  dictValue: '',
  cssClass: '',
  listClass: 'primary',
  dictSort: 0,
  remark: ''
};

const dataState = reactive<PageData<DictDataForm, DictDataQuery>>({
  form: { ...dataInitFormData },
  queryParams: {
    pageNum: 1,
    pageSize: 10,
    dictName: '',
    dictType: '',
    dictLabel: ''
  },
  rules: {
    dictLabel: [{ required: true, message: '数据标签不能为空', trigger: 'blur' }],
    dictValue: [{ required: true, message: '数据键值不能为空', trigger: 'blur' }],
    dictSort: [{ required: true, message: '数据顺序不能为空', trigger: 'blur' }]
  }
});

const { queryParams: dataQueryParams, form: dataForm, rules: dataRules } = toRefs(dataState);

const getTypeList = () => {
  typeLoading.value = true;
  listType(typeQueryParams.value).then(res => {
    typeList.value = res.data?.rows;
    typeTotal.value = res.data?.total;
    typeLoading.value = false;
    ensureCurrentType();
  });
};

const ensureCurrentType = () => {
  if (!typeList.value.length) {
    currentDict.value = null;
    dataQueryParams.value.dictType = '';
    dataList.value = [];
    dataTotal.value = 0;
    return;
  }

  const current = currentDict.value && typeList.value.find(item => item.dictId === currentDict.value?.dictId);
  const nextRow = current || typeList.value[0];
  setCurrentType(nextRow);
};

const setCurrentType = (row: DictTypeVO) => {
  currentDict.value = row;
  dataQueryParams.value.dictType = row.dictType;
  dataQueryParams.value.pageNum = 1;
  dataQueryParams.value.dictLabel = '';
  getDataList();
  nextTick(() => typeTableRef.value?.setCurrentRow(row));
};

const handleTypeRowClick = (row: Partial<DictTypeVO>) => {
  setCurrentType(row as DictTypeVO);
};

const cancelType = () => {
  resetTypeForm();
  typeDialog.visible = false;
};

const resetTypeForm = () => {
  typeForm.value = { ...typeInitFormData };
  typeFormRef.value?.resetFields();
};

const handleTypeQuery = () => {
  typeQueryParams.value.pageNum = 1;
  getTypeList();
};

const handleTypeResetQuery = () => {
  typeQueryFormRef.value?.resetFields();
  handleTypeQuery();
};

const handleTypeAdd = () => {
  resetTypeForm();
  typeDialog.visible = true;
  typeDialog.title = '添加字典类型';
};

const handleTypeSelectionChange = (selection: DictTypeVO[]) => {
  typeIds.value = selection.map(item => item.dictId);
  typeSingle.value = selection.length != 1;
  typeMultiple.value = !selection.length;
};

const handleTypeUpdate = async (row?: Partial<DictTypeVO>) => {
  resetTypeForm();
  const dictId = row?.dictId || typeIds.value[0];
  const res = await getType(dictId);
  Object.assign(typeForm.value, res.data);
  typeDialog.visible = true;
  typeDialog.title = '修改字典类型';
};

const submitTypeForm = () => {
  typeFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      typeForm.value.dictId ? await updateType(typeForm.value) : await addType(typeForm.value);
      modal.msgSuccess('操作成功');
      typeDialog.visible = false;
      getTypeList();
    }
  });
};

const handleTypeDelete = async (row?: Partial<DictTypeVO>) => {
  const dictIds = row?.dictId || typeIds.value;
  await modal.confirm('是否确认删除字典编号为"' + dictIds + '"的数据项？');
  await delType(dictIds);
  getTypeList();
  modal.msgSuccess('删除成功');
};

const handleTypeExport = () => {
  requestDownload(
    'system/dict/type/export',
    {
      ...typeQueryParams.value
    },
    `dict_${new Date().getTime()}.xlsx`
  );
};

const handleRefreshCache = async () => {
  await refreshCache();
  modal.msgSuccess('刷新成功');
  useDictStore().cleanDict();
};

const getDataList = async () => {
  if (!currentDict.value) {
    dataList.value = [];
    dataTotal.value = 0;
    dataLoading.value = false;
    return;
  }
  dataLoading.value = true;
  const res = await listData(dataQueryParams.value);
  dataList.value = res.data?.rows;
  dataTotal.value = res.data?.total;
  dataLoading.value = false;
};

const cancelData = () => {
  dataDialog.visible = false;
  resetDataForm();
};

const resetDataForm = () => {
  dataForm.value = { ...dataInitFormData };
  dataFormRef.value?.resetFields();
};

const handleDataQuery = () => {
  if (!currentDict.value) return;
  dataQueryParams.value.pageNum = 1;
  getDataList();
};

const handleDataResetQuery = () => {
  dataQueryFormRef.value?.resetFields();
  dataQueryParams.value.dictLabel = '';
  handleDataQuery();
};

const handleDataAdd = () => {
  if (!currentDict.value) {
    modal.msgWarning('请先选择字典');
    return;
  }
  resetDataForm();
  dataForm.value.dictType = currentDict.value.dictType;
  dataDialog.visible = true;
  dataDialog.title = '添加字典数据';
};

const handleDataSelectionChange = (selection: DictDataVO[]) => {
  dataIds.value = selection.map(item => item.dictCode);
  dataSingle.value = selection.length != 1;
  dataMultiple.value = !selection.length;
};

const handleDataUpdate = async (row?: Partial<DictDataVO>) => {
  if (!currentDict.value) {
    modal.msgWarning('请先选择字典');
    return;
  }
  resetDataForm();
  const dictCode = row?.dictCode || dataIds.value[0];
  const res = await getData(dictCode);
  Object.assign(dataForm.value, res.data);
  dataDialog.visible = true;
  dataDialog.title = '修改字典数据';
};

const submitDataForm = () => {
  dataFormRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      dataForm.value.dictCode ? await updateData(dataForm.value) : await addData(dataForm.value);
      useDictStore().removeDict(dataQueryParams.value.dictType);
      modal.msgSuccess('操作成功');
      dataDialog.visible = false;
      await getDataList();
    }
  });
};

const handleDataDelete = async (row?: Partial<DictDataVO>) => {
  if (!currentDict.value) {
    modal.msgWarning('请先选择字典');
    return;
  }
  const dictCodes = row?.dictCode || dataIds.value;
  await modal.confirm('是否确认删除字典编码为"' + dictCodes + '"的数据项？');
  await delData(dictCodes);
  await getDataList();
  modal.msgSuccess('删除成功');
  useDictStore().removeDict(dataQueryParams.value.dictType);
};

const handleDataExport = () => {
  if (!currentDict.value) {
    modal.msgWarning('请先选择字典');
    return;
  }
  requestDownload(
    'system/dict/data/export',
    {
      ...dataQueryParams.value
    },
    `dict_data_${new Date().getTime()}.xlsx`
  );
};

onMounted(() => {
  getTypeList();
});
</script>

<style lang="scss" scoped>
.dict-grid {
  row-gap: 16px;
}

.dict-card {
  height: 100%;
}

.dict-table-wrap {
  overflow-x: auto;
}
</style>
