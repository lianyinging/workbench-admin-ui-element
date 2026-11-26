export interface OssRuleQuery extends PageQuery {
  ruleName?: string;
  domain?: string;
  mimeType?: string;
  isOverwrite?: string;
  isDefault?: string;
  status?: string;
}

export interface OssRuleForm {
  ossRuleId?: number;
  ruleName?: string;
  domain?: string;
  mimeType?: string;
  rule?: string;
  isOverwrite?: string;
  isDefault?: string;
  status?: string;
  ruleSort?: number;
  remark?: string;
}

export interface OssRuleVO extends BaseEntity {
  ossRuleId?: number;
  ruleName?: string;
  domain?: string;
  mimeType?: string;
  rule?: string;
  isOverwrite?: string;
  isDefault?: string;
  status?: string;
  ruleSort?: number;
  createDept?: number;
  remark?: string;
}
