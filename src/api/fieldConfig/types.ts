import type { FormItemRule } from 'element-plus';

export interface FieldOption {
  checkAll?: boolean;
  disabled?: boolean;
  title?: string;
  label: string;
  value: string | number;
}

export interface FieldOptionGroup {
  divider?: boolean;
  label?: string;
  group: string;
  children?: FieldOption[];
}

/** 字段基本配置对象（服务端下发的动态表单元数据） */
export interface FieldConfig<T extends string | number | boolean | Array<string | number> = string> {
  value?: T;
  label: string;
  name: string;
  component: string;
  help?: string;
  required: boolean;
  placeholder?: string;
  span?: number;
  visible?: string;
  rules?: FormItemRule[];
  inputProps?: Record<string, any>;
  inputNumberProps?: Record<string, any>;
  switchProps?: Record<string, any>;
  textareaProps?: Record<string, any>;
  selectProps?: Record<string, any>;
}

export function evalFieldConfig(config: FieldConfig<any>) {
  config.rules?.forEach(rule => {
    if (typeof rule.pattern === 'string') {
      rule.pattern = new RegExp(rule.pattern);
    }
    if (typeof (rule as any).validator === 'string') {
      // eslint-disable-next-line no-new-func
      (rule as any).validator = new Function((rule as any).validator);
    }
  });
}

export function evalFieldConfigs(configs: Record<string, FieldConfig<any>>) {
  Object.values(configs).forEach(config => {
    evalFieldConfig(config);
  });
}