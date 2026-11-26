import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { FileCategoryForm, FileCategoryQuery, FileCategoryVO } from './types';

export function listFileCategory(query?: FileCategoryQuery): AxiosPromise<FileCategoryVO[]> {
  return request({ url: '/system/fileCategory/list', method: 'get', params: query });
}

export function getFileCategory(query: FileCategoryQuery & { fileCategoryId: number }): AxiosPromise<FileCategoryVO> {
  return request({ url: '/system/fileCategory/query', method: 'get', params: query });
}

export function addFileCategory(data: FileCategoryForm) {
  return request({ url: '/system/fileCategory', method: 'post', data });
}

export function updateFileCategory(data: FileCategoryForm) {
  return request({ url: '/system/fileCategory', method: 'put', data });
}

export function delFileCategory(fileCategoryIds: number | Array<number> | string) {
  return request({ url: `/system/fileCategory/${fileCategoryIds}`, method: 'delete' });
}
