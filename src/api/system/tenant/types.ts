export interface TenantVO {
  id?: number;
  tenantId?: string;
  contactUserName?: string;
  contactPhone?: string;
  companyName?: string;
  licenseNumber?: string;
  address?: string;
  domain?: string;
  intro?: string;
  remark?: string;
  packageId?: number;
  expireTime?: string;
  accountCount?: number;
  status?: string;
  updateTime?: string;
  createTime?: string;
}

export interface TenantForm extends BaseEntity {
  id?: number;
  tenantId?: string;
  contactUserName?: string;
  contactPhone?: string;
  companyName?: string;
  username?: string;
  password?: string;
  licenseNumber?: string;
  address?: string;
  domain?: string;
  intro?: string;
  remark?: string;
  packageId?: number;
  expireTime?: string;
  accountCount?: number;
  status?: string;
}

export interface TenantQuery extends PageQuery {
  tenantId?: string;
  contactUserName?: string;
  contactPhone?: string;
  companyName?: string;
  licenseNumber?: string;
  address?: string;
  domain?: string;
  packageId?: number;
  status?: string;
  orderByColumn?: string;
  isAsc?: string;
}