import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { OssRuleForm, OssRuleQuery, OssRuleVO } from './types';

export function listOssRule(query?: OssRuleQuery): AxiosPromise<PageResult<OssRuleVO>> {
  return request({ url: '/system/ossRule/list', method: 'get', params: query });
}

export function getOssRule(ossRuleId: number | string): AxiosPromise<OssRuleVO> {
  return request({ url: `/system/ossRule/${ossRuleId}`, method: 'get' });
}

export function addOssRule(data: OssRuleForm) {
  return request({ url: '/system/ossRule', method: 'post', data });
}

export function updateOssRule(data: OssRuleForm) {
  return request({ url: '/system/ossRule', method: 'put', data });
}

export function delOssRule(ossRuleIds: number | Array<number> | string) {
  return request({ url: `/system/ossRule/${ossRuleIds}`, method: 'delete' });
}

export function refreshOssRuleCache() {
  return request({ url: '/system/ossRule/refreshCache', method: 'delete' });
}

export function changeOssRuleOverwrite(ossRuleId: number, isOverwrite: string) {
  return request({
    url: '/system/ossRule/changeOverwrite',
    method: 'put',
    params: { ossRuleId, isOverwrite }
  });
}
