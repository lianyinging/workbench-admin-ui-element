import { evalFieldConfigs } from '@/api/fieldConfig/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type {
  MessageConfigForm,
  MessageConfigQuery,
  MessageConfigVO,
  MessageFieldConfig,
  MessageTypeVo
} from './types';

export function listMessageConfig(query?: MessageConfigQuery): AxiosPromise<PageResult<MessageConfigVO>> {
  return request({
    url: '/system/messageConfig/list',
    method: 'get',
    params: query
  });
}

export function getMessageConfig(messageConfigId: number | string): AxiosPromise<MessageConfigVO> {
  return request({
    url: `/system/messageConfig/${messageConfigId}`,
    method: 'get'
  });
}

export function addMessageConfig(data: MessageConfigForm) {
  return request({
    url: '/system/messageConfig',
    method: 'post',
    data
  });
}

export function updateMessageConfig(data: MessageConfigForm) {
  return request({
    url: '/system/messageConfig',
    method: 'put',
    data
  });
}

export function delMessageConfig(messageConfigIds: number | Array<number | string> | string) {
  return request({
    url: `/system/messageConfig/${messageConfigIds}`,
    method: 'delete'
  });
}

export function refreshMessageConfigCache() {
  return request({
    url: '/system/messageConfig/refreshCache',
    method: 'delete'
  });
}

export function getMessageFieldConfigs(): AxiosPromise<Record<string, MessageFieldConfig>> {
  return request({
    url: '/system/messageConfig/getMessageFieldConfigs',
    method: 'get'
  }).then((res: any) => {
    const data = res.data ?? {};
    Object.values(data).forEach((value: MessageFieldConfig) => {
      evalFieldConfigs(value.supplierConfig);
    });
    return res;
  });
}

export function getMessageSupplierType(): AxiosPromise<MessageTypeVo[]> {
  return request({
    url: '/system/messageConfig/getSupplierType',
    method: 'get'
  });
}