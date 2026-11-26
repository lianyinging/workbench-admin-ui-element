export interface MessageKeyQuery extends PageQuery {
  name?: string;
  messageKey?: string;
}

export interface MessageKeyForm {
  messageKeyId?: number;
  name?: string;
  messageKey?: string;
  remark?: string;
}

export interface MessageKeyVO {
  messageKeyId?: number;
  name?: string;
  messageKey?: string;
  remark?: string;
  updateTime?: string;
  createTime?: string;
}