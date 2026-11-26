import type { AxiosPromise } from '@/utils/api-types';
import request from '@/utils/request';
import type {
  McpGatewayToolItem,
  OpcMcpGatewayConfigForm,
  OpcMcpGatewayConfigQuery,
  OpcMcpGatewayConfigVo
} from './types';

export function listMcpGatewayConfig(query: OpcMcpGatewayConfigQuery): AxiosPromise<OpcMcpGatewayConfigVo[]> {
  return request({
    url: '/system/mcpGateway/list',
    method: 'get',
    params: query
  });
}

export function listMcpGatewayOptions(): AxiosPromise<OpcMcpGatewayConfigVo[]> {
  return request({
    url: '/system/mcpGateway/options',
    method: 'get'
  });
}

export function getMcpGatewayConfig(configId: number | string): AxiosPromise<OpcMcpGatewayConfigVo> {
  return request({
    url: `/system/mcpGateway/${configId}`,
    method: 'get'
  });
}

export function addMcpGatewayConfig(data: OpcMcpGatewayConfigForm) {
  return request({
    url: '/system/mcpGateway',
    method: 'post',
    data
  });
}

export function updateMcpGatewayConfig(data: OpcMcpGatewayConfigForm) {
  return request({
    url: '/system/mcpGateway',
    method: 'put',
    data
  });
}

export function changeMcpGatewayStatus(configId: number, status: string) {
  return request({
    url: '/system/mcpGateway/changeStatus',
    method: 'put',
    data: { configId, status }
  });
}

export function delMcpGatewayConfig(configIds: number | number[]) {
  return request({
    url: `/system/mcpGateway/${configIds}`,
    method: 'delete'
  });
}

export function listMcpGatewayTools(configId?: number): AxiosPromise<McpGatewayToolItem[]> {
  return request({
    url: '/system/mcpGateway/tools',
    method: 'get',
    params: configId != null ? { configId } : undefined
  });
}
