export interface StorageConfigQuery extends PageQuery {
  name?: string;
  platform?: string;
  status?: number;
  requestMode?: string;
}

export interface StorageConfigForm {
  storageConfigId?: number;
  name?: string;
  platform?: string;
  weight?: number;
  status?: number;
  configJson?: string;
  configObject?: Record<string, any>;
  requestMode?: string;
  remark?: string;
}

export interface StorageConfigVO extends BaseEntity {
  storageConfigId?: number;
  name?: string;
  platform?: string;
  weight?: number;
  status?: number;
  configJson?: string;
  configObject?: Record<string, any>;
  requestMode?: string;
  remark?: string;
}
