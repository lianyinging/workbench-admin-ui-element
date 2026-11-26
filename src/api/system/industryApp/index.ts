import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { OpcIndustryAppForm, OpcIndustryAppQuery, OpcIndustryAppVo } from './types';

export function listIndustryApp(query?: OpcIndustryAppQuery): AxiosPromise<PageResult<OpcIndustryAppVo>> {
  return request({
    url: '/system/industryApp/list',
    method: 'get',
    params: query
  });
}

export function getIndustryApp(appId: number | string): AxiosPromise<OpcIndustryAppVo> {
  return request({
    url: '/system/industryApp/' + appId,
    method: 'get'
  });
}

export function addIndustryApp(data: OpcIndustryAppForm) {
  return request({
    url: '/system/industryApp',
    method: 'post',
    data
  });
}

export function updateIndustryApp(data: OpcIndustryAppForm) {
  return request({
    url: '/system/industryApp',
    method: 'put',
    data
  });
}

export function delIndustryApp(appIds: number | Array<number | string>) {
  return request({
    url: '/system/industryApp/' + appIds,
    method: 'delete'
  });
}

export function changeIndustryAppStatus(appId: number, status: string) {
  return request({
    url: '/system/industryApp/changeStatus',
    method: 'put',
    data: { appId, status }
  });
}