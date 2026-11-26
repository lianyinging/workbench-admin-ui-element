import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { MessageLogQuery, MessageLogVO } from './types';

export function listMessageLog(query?: MessageLogQuery): AxiosPromise<PageResult<MessageLogVO>> {
  return request({
    url: '/system/messageLog/list',
    method: 'get',
    params: query
  });
}

export function getMessageLog(messageLogId: number | string): AxiosPromise<MessageLogVO> {
  return request({
    url: `/system/messageLog/${messageLogId}`,
    method: 'get'
  });
}

export function delMessageLog(messageLogIds: number | Array<number | string> | string) {
  return request({
    url: `/system/messageLog/${messageLogIds}`,
    method: 'delete'
  });
}

export function clearMessageLog() {
  return request({
    url: '/system/messageLog/clear',
    method: 'delete'
  });
}