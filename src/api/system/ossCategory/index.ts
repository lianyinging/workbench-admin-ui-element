import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { OssCategoryForm, OssCategoryQuery, OssCategoryVO } from './types';

export function listOssCategory(query?: OssCategoryQuery): AxiosPromise<OssCategoryVO[]> {
  return request({ url: '/system/ossCategory/list', method: 'get', params: query });
}

export function getOssCategory(query: OssCategoryQuery & { ossCategoryId: number }): AxiosPromise<OssCategoryVO> {
  return request({ url: '/system/ossCategory/query', method: 'get', params: query });
}

export function addOssCategory(data: OssCategoryForm) {
  return request({ url: '/system/ossCategory', method: 'post', data });
}

export function updateOssCategory(data: OssCategoryForm) {
  return request({ url: '/system/ossCategory', method: 'put', data });
}

export function delOssCategory(ossCategoryIds: number | Array<number> | string) {
  return request({ url: `/system/ossCategory/${ossCategoryIds}`, method: 'delete' });
}
