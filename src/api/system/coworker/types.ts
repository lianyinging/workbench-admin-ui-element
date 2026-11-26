export interface OpcCoworkerToolItem {
  logicalMcp?: string;
  toolId?: string;
  toolName?: string;
}

export interface OpcCoworkerQuery extends PageQuery {
  personaKey?: string;
  name?: string;
  groupKey?: string;
  categoryId?: number;
  /** true：仅未分类 */
  uncategorized?: boolean;
  status?: string;
  visibility?: string;
}

export interface OpcCoworkerForm {
  coworkerId?: number;
  personaKey?: string;
  name?: string;
  tagline?: string;
  description?: string;
  icon?: string;
  groupKey?: string;
  categoryId?: number;
  version?: string;
  /** zip 的 base64（可含 data URL 前缀）；编辑时为空表示不改包 */
  packageZipBase64?: string;
  visibility?: string;
  mcpConfigId?: number;
  sortOrder?: number;
  status?: string;
  remark?: string;
  tools?: OpcCoworkerToolItem[];
}

export interface OpcCoworkerVo extends BaseEntity {
  coworkerId?: number;
  personaKey?: string;
  name?: string;
  tagline?: string;
  description?: string;
  icon?: string;
  groupKey?: string;
  categoryId?: number;
  categoryName?: string;
  version?: string;
  packageSha256?: string;
  packageSize?: number;
  hasPackage?: boolean;
  visibility?: string;
  mcpConfigId?: number;
  mcpConfigName?: string;
  sortOrder?: number;
  status?: string;
  remark?: string;
  tools?: OpcCoworkerToolItem[];
}