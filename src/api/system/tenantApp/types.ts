export interface TenantAppVO {
  appid?: number;
  appType?: string;
  appKey?: string;
  appName?: string;
  createTime?: string;
  updateTime?: string;
  remark?: string;
}

export interface TenantAppForm extends BaseEntity {
  appid?: number;
  appType?: string;
  appKey?: string;
  appName?: string;
  remark?: string;
}

export interface TenantAppQuery extends PageQuery {
  appType?: string;
  appKey?: string;
  appName?: string;
}