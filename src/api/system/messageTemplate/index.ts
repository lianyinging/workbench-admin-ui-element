import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { MessageConfigVO } from '@/api/system/messageConfig/types';
import type { MessageKeyVO } from '@/api/system/messageKey/types';
import type {
  MessageTemplateForm,
  MessageTemplateQuery,
  MessageTemplateTest,
  MessageTemplateVO
} from './types';

export function listMessageTemplate(query?: MessageTemplateQuery): AxiosPromise<PageResult<MessageTemplateVO>> {
  return request({
    url: '/system/messageTemplate/list',
    method: 'get',
    params: query
  });
}

export function getMessageTemplate(messageTemplateId: number | string): AxiosPromise<MessageTemplateVO> {
  return request({
    url: `/system/messageTemplate/${messageTemplateId}`,
    method: 'get'
  });
}

export function addMessageTemplate(data: MessageTemplateForm) {
  return request({
    url: '/system/messageTemplate',
    method: 'post',
    data
  });
}

export function updateMessageTemplate(data: MessageTemplateForm) {
  return request({
    url: '/system/messageTemplate',
    method: 'put',
    data
  });
}

export function delMessageTemplate(messageTemplateIds: number | Array<number | string> | string) {
  return request({
    url: `/system/messageTemplate/${messageTemplateIds}`,
    method: 'delete'
  });
}

export function getMessageConfigs(messageType: string): AxiosPromise<MessageConfigVO[]> {
  return request({
    url: '/system/messageTemplate/messageConfigs',
    method: 'get',
    params: { messageType }
  });
}

export function getMessageKeys(): AxiosPromise<MessageKeyVO[]> {
  return request({
    url: '/system/messageTemplate/messageKeys',
    method: 'get'
  });
}

export function sendMessageTest(data: MessageTemplateTest) {
  return request({
    url: '/system/messageTemplate/sendTest',
    method: 'post',
    data
  });
}

export function refreshMessageTemplateCache() {
  return request({
    url: '/system/messageTemplate/refreshCache',
    method: 'delete'
  });
}