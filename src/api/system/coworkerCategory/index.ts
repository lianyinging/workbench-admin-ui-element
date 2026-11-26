import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { OpcCoworkerCategoryForm, OpcCoworkerCategorySidebar, OpcCoworkerCategoryVo } from './types';

export function listCoworkerCategory(): AxiosPromise<OpcCoworkerCategoryVo[]> {
  return request({
    url: '/system/coworkerCategory/list',
    method: 'get'
  });
}

export function getCoworkerCategorySidebar(): AxiosPromise<OpcCoworkerCategorySidebar> {
  return request({
    url: '/system/coworkerCategory/sidebar',
    method: 'get'
  });
}

export function listCoworkerCategoryOptions(): AxiosPromise<OpcCoworkerCategoryVo[]> {
  return request({
    url: '/system/coworkerCategory/options',
    method: 'get'
  });
}

export function getCoworkerCategory(categoryId: number | string): AxiosPromise<OpcCoworkerCategoryVo> {
  return request({
    url: `/system/coworkerCategory/${categoryId}`,
    method: 'get'
  });
}

export function addCoworkerCategory(data: OpcCoworkerCategoryForm) {
  return request({
    url: '/system/coworkerCategory',
    method: 'post',
    data
  });
}

export function updateCoworkerCategory(data: OpcCoworkerCategoryForm) {
  return request({
    url: '/system/coworkerCategory',
    method: 'put',
    data
  });
}

export function delCoworkerCategory(categoryIds: number | number[]) {
  return request({
    url: `/system/coworkerCategory/${categoryIds}`,
    method: 'delete'
  });
}
