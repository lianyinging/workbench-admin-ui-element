export interface MessageTemplateQuery extends PageQuery {
  templateName?: string;
  messageKey?: string;
  messageType?: string;
  templateMode?: string;
  status?: number | string;
}

export interface MessageTemplateVar {
  key: string;
  value?: string;
}

export interface MessageTemplateForm {
  messageTemplateId?: number;
  templateName?: string;
  messageConfigId?: number;
  messageKeyId?: number;
  messageType?: string;
  templateMode?: string;
  title?: string;
  signature?: string;
  templateId?: string;
  content?: string;
  varsJson?: string;
  varsList?: MessageTemplateVar[];
  status?: number | string;
  remark?: string;
}

export interface MessageTemplateVO {
  messageTemplateId?: number;
  templateName?: string;
  messageConfigId?: number;
  messageKeyId?: number;
  messageKey?: string;
  messageType?: string;
  templateMode?: string;
  title?: string;
  signature?: string;
  templateId?: string;
  content?: string;
  varsJson?: string;
  status?: number | string;
  remark?: string;
  updateTime?: string;
  createTime?: string;
  supplierType?: string;
}

export interface MessageTemplateTest {
  messageTemplateId?: number;
  account?: string;
  vars?: Record<string, string>;
}