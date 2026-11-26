import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type {
  SensitiveWordForm,
  SensitiveWordQuery,
  SensitiveWordTest,
  SensitiveWordTestVO,
  SensitiveWordVO
} from './types';

export function listSensitiveWord(query?: SensitiveWordQuery): AxiosPromise<PageResult<SensitiveWordVO>> {
  return request({ url: '/system/sensitiveWord/list', method: 'get', params: query });
}

export function getSensitiveWord(wordId: number | string): AxiosPromise<SensitiveWordVO> {
  return request({ url: `/system/sensitiveWord/${wordId}`, method: 'get' });
}

export function addSensitiveWord(data: SensitiveWordForm) {
  return request({ url: '/system/sensitiveWord', method: 'post', data });
}

export function updateSensitiveWord(data: SensitiveWordForm) {
  return request({ url: '/system/sensitiveWord', method: 'put', data });
}

export function delSensitiveWord(wordIds: number | Array<number> | string) {
  return request({ url: `/system/sensitiveWord/${wordIds}`, method: 'delete' });
}

export function refreshSensitiveWordCache() {
  return request({ url: '/system/sensitiveWord/refreshCache', method: 'delete' });
}

export function sensitiveWordTest(params: SensitiveWordTest): AxiosPromise<SensitiveWordTestVO> {
  return request({ url: '/system/sensitiveWord/test', method: 'get', params });
}
