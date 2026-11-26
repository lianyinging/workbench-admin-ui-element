export interface TenantPackageVO {
  packageId?: number;
  packageName?: string;
  remark?: string;
  menuCheckStrictly?: boolean;
  status?: string;
  createTime?: string;
  updateTime?: string;
}

export interface TenantPackageForm extends BaseEntity {
  packageId?: number;
  packageName?: string;
  menuIds?: Array<string | number>;
  remark?: string;
  menuCheckStrictly?: boolean;
  status?: string;
}

export interface TenantPackageQuery extends PageQuery {
  packageName?: string;
  status?: string;
  orderByColumn?: string;
  isAsc?: string;
}