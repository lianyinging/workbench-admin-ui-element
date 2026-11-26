export interface OpcMcpGatewayConfigQuery extends PageQuery {
  configName?: string;
  status?: string;
}

export interface OpcMcpGatewayConfigVo {
  configId?: number;
  configName?: string;
  gatewayBaseUrl?: string;
  hasApiKey?: boolean;
  apiKeyHint?: string;
  virtualServerId?: string;
  hasAdminToken?: boolean;
  remark?: string;
  status?: string;
  sortOrder?: number;
  updateTime?: string;
}

export interface OpcMcpGatewayConfigForm {
  configId?: number;
  configName?: string;
  gatewayBaseUrl?: string;
  /** 留空表示不修改已有 Key */
  gatewayApiKey?: string;
  virtualServerId?: string;
  adminToken?: string;
  remark?: string;
  status?: string;
  sortOrder?: number;
}

export interface McpGatewayToolItem {
  toolId?: string;
  toolName?: string;
  description?: string;
  gatewayId?: string;
  /** MCP 服务名（用于 Tab） */
  gatewayName?: string;
}
