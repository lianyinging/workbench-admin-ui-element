import type { MenuTreeOption } from '@/api/system/menu/types';
import type { PageResult } from '@/api/types';
import type { TenantPackageForm, TenantPackageQuery, TenantPackageVO } from '@/api/system/tenantPackage/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

export interface TenantPackageMenuTree {
  menus: MenuTreeOption[];
  checkedKeys: Array<string | number>;
}

export const listTenantPackage = (query?: TenantPackageQuery): AxiosPromise<PageResult<TenantPackageVO>> => {
  return request({
    url: '/system/tenant/package/list',
    method: 'get',
    params: query
  });
};

export const selectTenantPackage = (): AxiosPromise<TenantPackageVO[]> => {
  return request({
    url: '/system/tenant/package/selectList',
    method: 'get'
  });
};

export const getTenantPackage = (packageId: string | number): AxiosPromise<TenantPackageVO> => {
  return request({
    url: '/system/tenant/package/' + packageId,
    method: 'get'
  });
};

export const addTenantPackage = (data: TenantPackageForm) => {
  return request({
    url: '/system/tenant/package',
    method: 'post',
    data
  });
};

export const updateTenantPackage = (data: TenantPackageForm) => {
  return request({
    url: '/system/tenant/package',
    method: 'put',
    data
  });
};

export const changePackageStatus = (packageId: number, status: string) => {
  return request({
    url: '/system/tenant/package/changeStatus',
    method: 'put',
    data: { packageId, status }
  });
};

export const delTenantPackage = (packageId: string | number | Array<string | number>) => {
  return request({
    url: '/system/tenant/package/' + packageId,
    method: 'delete'
  });
};

export const tenantPackageMenuTreeSelect = (packageId: number): AxiosPromise<TenantPackageMenuTree> => {
  return request({
    url: '/system/menu/tenantPackageMenuTreeSelect/' + packageId,
    method: 'get'
  });
};