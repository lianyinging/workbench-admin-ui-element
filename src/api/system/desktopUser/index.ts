import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { OpcDesktopUserForm, OpcDesktopUserQuery, OpcDesktopUserVo } from './types';

export function listDesktopUser(query?: OpcDesktopUserQuery): AxiosPromise<PageResult<OpcDesktopUserVo>> {
  return request({
    url: '/system/desktopUser/list',
    method: 'get',
    params: query
  });
}

export function getDesktopUser(userId: number | string): AxiosPromise<OpcDesktopUserVo> {
  return request({
    url: '/system/desktopUser/' + userId,
    method: 'get'
  });
}

export function addDesktopUser(data: OpcDesktopUserForm) {
  return request({
    url: '/system/desktopUser',
    method: 'post',
    data
  });
}

export function updateDesktopUser(data: OpcDesktopUserForm) {
  return request({
    url: '/system/desktopUser',
    method: 'put',
    data
  });
}

export function delDesktopUser(userIds: number | Array<number | string>) {
  return request({
    url: '/system/desktopUser/' + userIds,
    method: 'delete'
  });
}

export function changeDesktopUserStatus(userId: number, status: string) {
  return request({
    url: '/system/desktopUser/changeStatus',
    method: 'put',
    data: { userId, status }
  });
}

export function resetDesktopUserPwd(userId: number, password: string) {
  return request({
    url: '/system/desktopUser/resetPwd',
    method: 'put',
    data: { userId, password }
  });
}