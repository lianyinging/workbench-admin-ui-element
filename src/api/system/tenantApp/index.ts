import type { PageResult } from '@/api/types';
import type { TenantAppForm, TenantAppQuery, TenantAppVO } from '@/api/system/tenantApp/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';

export const listTenantApp = (query?: TenantAppQuery): AxiosPromise<PageResult<TenantAppVO>> => {
  return request({
    url: '/system/tenantApp/list',
    method: 'get',
    params: query
  });
};

export const getTenantApp = (appid: string | number): AxiosPromise<TenantAppVO> => {
  return request({
    url: '/system/tenantApp/' + appid,
    method: 'get'
  });
};

export const addTenantApp = (data: TenantAppForm) => {
  return request({
    url: '/system/tenantApp',
    method: 'post',
    data
  });
};

export const updateTenantApp = (data: TenantAppForm) => {
  return request({
    url: '/system/tenantApp',
    method: 'put',
    data
  });
};

export const delTenantApp = (appids: string | number | Array<string | number>) => {
  return request({
    url: '/system/tenantApp/' + appids,
    method: 'delete'
  });
};