import type { PropType } from 'vue';
import { computed, defineComponent, ref, watch, watchEffect } from 'vue';
import type { FieldConfig } from '@/api/fieldConfig/types';
import FormFieldRender from '@/components/field-config/FormFieldRender';
import { getAndSetLastObject } from '@/components/field-config/util';

export const FormFieldRendersProps = {
  form: {
    type: Object,
    required: true
  },
  modelValue: {
    type: [String, Object] as PropType<string | Record<string, any>>
  },
  name: {
    type: String,
    required: true
  },
  configs: {
    type: Object as PropType<Record<string, FieldConfig<any>>>,
    required: true
  },
  type: {
    type: String as PropType<'object' | 'string'>,
    default: 'object'
  }
};

export default defineComponent({
  name: 'FormFieldRenders',
  props: FormFieldRendersProps,
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const effectValue = ref<Record<string, any>>({});

    watchEffect(() => {
      if (typeof props.modelValue === 'string') {
        effectValue.value = props.modelValue ? JSON.parse(props.modelValue) : {};
      } else {
        effectValue.value = props.modelValue ?? {};
      }
    });

    const modelValue = computed({
      get() {
        return effectValue.value;
      },
      set(value: Record<string, any>) {
        if (props.type === 'string') {
          emit('update:modelValue', JSON.stringify(value));
        } else {
          emit('update:modelValue', value);
        }
      }
    });

    watch(
      () => props.configs,
      () => {
        restoreDefaultConfigValue();
      }
    );

    const restoreDefaultConfigValue = () => {
      const data: Record<string, any> = {};
      for (const key in props.configs) {
        const item = props.configs[key];
        const names = item.name?.split('.') ?? [key];
        getAndSetLastObject(data, names)[names.at(-1)!] = item.value;
      }
      modelValue.value = data;
    };

    const renderItem = (key: string, item: FieldConfig<any>) => {
      const names = item.name?.split('.') ?? [key];
      const val = computed({
        get() {
          return getAndSetLastObject(modelValue.value, names)[names.at(-1)!];
        },
        set(value: unknown) {
          getAndSetLastObject(modelValue.value, names)[names.at(-1)!] = value;
        }
      });

      return (
        <FormFieldRender
          modelValue={val.value}
          onUpdate:modelValue={(value: unknown) => {
            val.value = value;
          }}
          config-value={modelValue.value}
          name={`${props.name}.${names.join('.')}`}
          field-config={item}
        />
      );
    };

    return () => {
      return Object.keys(props.configs ?? {}).map(key => renderItem(key, props.configs[key]));
    };
  }
});