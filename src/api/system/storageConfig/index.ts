import { evalFieldConfigs } from '@/api/fieldConfig/types';
import type { FieldConfig, FieldOption } from '@/api/fieldConfig/types';
import type { PageResult } from '@/api/types';
import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { StorageConfigForm, StorageConfigQuery, StorageConfigVO } from './types';

export function listStorageConfig(query?: StorageConfigQuery): AxiosPromise<PageResult<StorageConfigVO>> {
  return request({ url: '/system/storageConfig/list', method: 'get', params: query });
}

export function getStorageConfig(storageConfigId: number | string): AxiosPromise<StorageConfigVO> {
  return request({ url: `/system/storageConfig/${storageConfigId}`, method: 'get' }).then((res: any) => {
    if (res.data?.configJson) {
      res.data.configObject = JSON.parse(res.data.configJson);
    }
    return res;
  });
}

export function addStorageConfig(data: StorageConfigForm) {
  return request({ url: '/system/storageConfig', method: 'post', data });
}

export function updateStorageConfig(data: StorageConfigForm) {
  return request({ url: '/system/storageConfig', method: 'put', data });
}

export function delStorageConfig(storageConfigIds: number | Array<number> | string) {
  return request({ url: `/system/storageConfig/${storageConfigIds}`, method: 'delete' });
}

export function updateStorageStatus(storageConfigId: number, status: number) {
  return request({
    url: '/system/storageConfig/changeStatus',
    method: 'put',
    data: { storageConfigId, status }
  });
}

export function getAllStoragePlatform(): AxiosPromise<FieldOption[]> {
  return request({ url: '/system/storageConfig/getAllStoragePlatform', method: 'get' });
}

export function getSupportPlatform(): AxiosPromise<FieldOption[]> {
  return request({ url: '/system/storageConfig/getSupportPlatform', method: 'get' });
}

export function getStoragePlatformConfigs(): AxiosPromise<Record<string, Record<string, FieldConfig<any>>>> {
  return request({ url: '/system/storageConfig/getStoragePlatformConfigs', method: 'get' }).then((res: any) => {
    const data = res.data ?? {};
    Object.values(data).forEach((value: Record<string, FieldConfig<any>>) => evalFieldConfigs(value));
    return res;
  });
}
