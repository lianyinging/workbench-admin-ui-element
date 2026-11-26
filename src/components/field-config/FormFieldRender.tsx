import type { PropType } from 'vue';
import { computed, defineComponent, onMounted } from 'vue';
import type { FieldConfig } from '@/api/fieldConfig/types';
import type { FormItemRule } from 'element-plus';
import { ElCol, ElFormItem, ElInput, ElInputNumber, ElOption, ElSelect, ElSwitch } from 'element-plus';

export const FormFieldRenderProps = {
  modelValue: {
    type: [String, Number, Boolean, Array, Object] as PropType<unknown>
  },
  name: {
    type: String,
    required: true
  },
  configValue: {
    type: Object as PropType<Record<string, any>>,
    required: true
  },
  fieldConfig: {
    type: Object as PropType<FieldConfig<any>>,
    required: true
  },
  initValue: {
    type: Boolean,
    default: false
  }
};

export default defineComponent({
  name: 'FormFieldRender',
  props: FormFieldRenderProps,
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const modelValue = computed({
      get() {
        if (props.fieldConfig.component === 'input') {
          return String(props.modelValue ?? '').trim();
        }
        return props.modelValue;
      },
      set(value) {
        emit('update:modelValue', value);
      }
    });

    onMounted(() => {
      if (props.initValue) {
        modelValue.value = props.fieldConfig.value;
      }
    });

    const buildRules = (fieldConfig: FieldConfig<any>): FormItemRule[] => {
      return [
        { required: fieldConfig.required, message: `${fieldConfig.label}不能为空`, trigger: 'blur' },
        ...(fieldConfig.rules ?? [])
      ];
    };

    return () => {
      const fieldConfig = props.fieldConfig;
      const visible = !fieldConfig.visible || props.configValue[fieldConfig.visible];
      if (!visible) {
        return null;
      }

      const renderComponent = () => {
        if (fieldConfig.component === 'input') {
          return (
            <ElInput
              modelValue={modelValue.value as string}
              onUpdate:modelValue={(value: string) => {
                modelValue.value = value;
              }}
              placeholder={fieldConfig.placeholder ?? `请输入${fieldConfig.label}`}
              {...(fieldConfig.inputProps ?? {})}
            />
          );
        }
        if (fieldConfig.component === 'input-number') {
          return (
            <ElInputNumber
              modelValue={modelValue.value as number}
              onUpdate:modelValue={(value: number | undefined) => {
                modelValue.value = value;
              }}
              {...(fieldConfig.inputNumberProps ?? {})}
            />
          );
        }
        if (fieldConfig.component === 'switch') {
          return (
            <ElSwitch
              modelValue={modelValue.value as boolean}
              onUpdate:modelValue={(value: string | number | boolean) => {
                modelValue.value = value;
              }}
              {...(fieldConfig.switchProps ?? {})}
            />
          );
        }
        if (fieldConfig.component === 'select') {
          const options = fieldConfig.selectProps?.options ?? [];
          const flatOptions = (options as any[]).flatMap(option => option.children ?? [option]);
          return (
            <ElSelect
              modelValue={modelValue.value}
              onUpdate:modelValue={(value: unknown) => {
                modelValue.value = value;
              }}
              clearable
              filterable
              {...(fieldConfig.selectProps ?? {})}
              options={undefined}
            >
              {flatOptions.map(option => (
                <ElOption key={String(option.value)} label={option.label} value={option.value} disabled={option.disabled} />
              ))}
            </ElSelect>
          );
        }
        return null;
      };

      return (
        <ElCol span={fieldConfig.span ?? 12}>
          <ElFormItem label={fieldConfig.label} prop={props.name} rules={buildRules(fieldConfig)}>
            {renderComponent()}
            {fieldConfig.help ? (
              <div
                class="field-config-help"
                style="margin-top:4px;font-size:12px;color:var(--el-text-color-secondary)"
                innerHTML={fieldConfig.help}
              />
            ) : null}
          </ElFormItem>
        </ElCol>
      );
    };
  }
});