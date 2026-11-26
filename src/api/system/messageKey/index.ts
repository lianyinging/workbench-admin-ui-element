import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { MessageKeyForm, MessageKeyQuery, MessageKeyVO } from './types';

export function listMessageKey(query?: MessageKeyQuery): AxiosPromise<PageResult<MessageKeyVO>> {
  return request({
    url: '/system/messageKey/list',
    method: 'get',
    params: query
  });
}

export function getMessageKey(messageKeyId: number | string): AxiosPromise<MessageKeyVO> {
  return request({
    url: `/system/messageKey/${messageKeyId}`,
    method: 'get'
  });
}

export function addMessageKey(data: MessageKeyForm) {
  return request({
    url: '/system/messageKey',
    method: 'post',
    data
  });
}

export function updateMessageKey(data: MessageKeyForm) {
  return request({
    url: '/system/messageKey',
    method: 'put',
    data
  });
}

export function delMessageKey(messageKeyIds: number | Array<number | string> | string) {
  return request({
    url: `/system/messageKey/${messageKeyIds}`,
    method: 'delete'
  });
}