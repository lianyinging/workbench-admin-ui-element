<template>
  <el-descriptions v-loading="loading" :column="2" border>
    <slot name="prefix" />
    <template v-for="(fieldConfig, key) in fieldConfigs" :key="key">
      <el-descriptions-item
        v-if="!fieldConfig.visible || effectConfigValue[fieldConfig.visible]"
        :label="fieldConfig.label"
        :span="fieldConfig.span && fieldConfig.span >= 12 ? 2 : 1"
      >
        <template v-if="fieldConfig.component === 'select'">
          <dict-tag :options="getOptions(fieldConfig.selectProps?.options)" :value="getValue(fieldConfig, key)" />
        </template>
        <template v-else>
          {{ getValue(fieldConfig, key) }}
        </template>
      </el-descriptions-item>
    </template>
    <slot name="suffix" />
  </el-descriptions>
</template>

<script setup lang="ts">
import type { FieldConfig, FieldOption, FieldOptionGroup } from '@/api/fieldConfig/types';
import { getAndSetLastObject } from '@/components/field-config/util';

const props = defineProps({
  loading: {
    type: Boolean,
    default: false
  },
  configValue: {
    type: [String, Object] as PropType<string | Record<string, any>>,
    required: true
  },
  fieldConfigs: {
    type: Object as PropType<Record<string, FieldConfig<any>>>,
    required: true
  }
});

const effectConfigValue = computed(() => {
  if (typeof props.configValue === 'string') {
    try {
      return JSON.parse(props.configValue) ?? {};
    } catch {
      return {};
    }
  }
  return props.configValue ?? {};
});

function getValue(fieldConfig: FieldConfig<any>, key: string) {
  const names = fieldConfig.name?.split('.') ?? [key];
  return getAndSetLastObject(effectConfigValue.value, names)[names.at(-1)!];
}

function getOptions(options?: Array<FieldOption | FieldOptionGroup>) {
  if (!options?.length) {
    return [];
  }
  return options.flatMap(option => {
    if ('children' in option && option.children?.length) {
      return option.children;
    }
    return [option as FieldOption];
  });
}
</script>