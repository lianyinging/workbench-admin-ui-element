import type { PageResult } from '@/api/types';
import type { TenantForm, TenantQuery, TenantVO } from '@/api/system/tenant/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

export const listTenant = (query?: TenantQuery): AxiosPromise<PageResult<TenantVO>> => {
  return request({
    url: '/system/tenant/list',
    method: 'get',
    params: query
  });
};

export const getTenant = (id: string | number): AxiosPromise<TenantVO> => {
  return request({
    url: '/system/tenant/' + id,
    method: 'get'
  });
};

export const addTenant = (data: TenantForm) => {
  return request({
    url: '/system/tenant',
    method: 'post',
    headers: {
      isEncrypt: true,
      repeatSubmit: false
    },
    data
  });
};

export const updateTenant = (data: TenantForm) => {
  return request({
    url: '/system/tenant',
    method: 'put',
    data
  });
};

export const changeTenantStatus = (id: number, tenantId: string, status: string) => {
  return request({
    url: '/system/tenant/changeStatus',
    method: 'put',
    data: { id, tenantId, status }
  });
};

export const delTenant = (id: string | number | Array<string | number>) => {
  return request({
    url: '/system/tenant/' + id,
    method: 'delete'
  });
};

export const dynamicTenant = (tenantId: string | number) => {
  return request({
    url: '/system/tenant/dynamic/' + tenantId,
    method: 'get'
  });
};

export const dynamicClear = () => {
  return request({
    url: '/system/tenant/dynamic/clear',
    method: 'get'
  });
};

export const syncTenantPackage = (tenantId: string, packageId: number) => {
  return request({
    url: '/system/tenant/syncTenantPackage',
    method: 'get',
    params: { tenantId, packageId }
  });
};

export const syncTenantConfig = () => {
  return request({
    url: '/system/tenant/syncTenantConfig',
    method: 'get'
  });
};