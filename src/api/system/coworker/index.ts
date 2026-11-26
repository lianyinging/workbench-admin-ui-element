import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { OpcCoworkerForm, OpcCoworkerQuery, OpcCoworkerVo } from './types';

export function listCoworker(query?: OpcCoworkerQuery): AxiosPromise<PageResult<OpcCoworkerVo>> {
  return request({
    url: '/system/coworker/list',
    method: 'get',
    params: query
  });
}

export function getCoworker(coworkerId: number | string): AxiosPromise<OpcCoworkerVo> {
  return request({
    url: '/system/coworker/' + coworkerId,
    method: 'get'
  });
}

export function listCoworkerEnabledOptions(): AxiosPromise<OpcCoworkerVo[]> {
  return request({
    url: '/system/coworker/enabledOptions',
    method: 'get'
  });
}

export function addCoworker(data: OpcCoworkerForm) {
  return request({
    url: '/system/coworker',
    method: 'post',
    data
  });
}

export function updateCoworker(data: OpcCoworkerForm) {
  return request({
    url: '/system/coworker',
    method: 'put',
    data
  });
}

export function delCoworker(coworkerIds: number | Array<number | string>) {
  return request({
    url: '/system/coworker/' + coworkerIds,
    method: 'delete'
  });
}

export function changeCoworkerStatus(coworkerId: number, status: string) {
  return request({
    url: '/system/coworker/changeStatus',
    method: 'put',
    data: { coworkerId, status }
  });
}