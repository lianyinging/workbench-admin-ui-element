import type { FieldConfig } from '@/api/fieldConfig/types';

export interface MessageConfigQuery extends PageQuery {
  title?: string;
  messageType?: string;
  supplierType?: string;
  status?: number | string;
}

export interface MessageConfigForm {
  messageConfigId?: number;
  title?: string;
  messageType?: string;
  supplierType?: string;
  configJson?: string | object;
  configObject?: Record<string, any>;
  status?: number | string;
  remark?: string;
}

export interface MessageConfigVO {
  messageConfigId?: number;
  title?: string;
  messageType?: string;
  supplierType?: string;
  configObject?: Record<string, any>;
  configJson?: string;
  status?: number | string;
  remark?: string;
  updateTime?: string;
  createTime?: string;
}

export interface TemplateMode {
  supportTemplateId: boolean;
  supportTemplateContent: boolean;
}

export type SupplierFieldConfig = Record<string, FieldConfig<any>>;

export interface MessageFieldConfig {
  supplierConfig: SupplierFieldConfig;
  messageType: 'MAIL' | 'SMS';
  templateMode: TemplateMode;
}

export interface MessageTypeVo {
  messageType: string;
  description: string;
  supplierTypeMap: Record<string, string>;
}