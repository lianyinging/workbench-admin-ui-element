export interface MessageLogQuery extends PageQuery {
  messageTemplateId?: number;
  messageKey?: string;
  messageTemplateName?: string;
  messageType?: string;
  templateMode?: string;
  account?: string;
  templateId?: string;
  supplierType?: string;
  isSuccess?: number | string;
}

export interface MessageLogVO {
  messageLogId?: number;
  messageTemplateId?: number;
  messageKey?: string;
  messageTemplateName?: string;
  messageType?: string;
  templateMode?: string;
  account?: string;
  title?: string;
  templateId?: string;
  content?: string;
  messageConfigTitle?: string;
  supplierType?: string;
  isSuccess?: number | string;
  responseBody?: string;
  logTime?: string;
  costTime?: number;
}