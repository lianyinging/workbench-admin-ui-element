import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type { OpcDesktopDevice, OpcDesktopDeviceQuery } from './types';

export function listDesktopDevices(query?: OpcDesktopDeviceQuery): AxiosPromise<OpcDesktopDevice[]> {
  return request({
    url: '/monitor/desktop/list',
    method: 'get',
    params: query
  });
}

export function updateDesktopDeviceStatus(deviceId: string, status: string) {
  return request({
    url: `/monitor/desktop/${deviceId}/status/${status}`,
    method: 'put'
  });
}