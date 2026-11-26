export interface OssCategoryQuery extends PageQuery {
  categoryName?: string;
  userType?: string;
  createBy?: number;
  maxSize?: number;
  contentTypes?: string[];
  suffixes?: string[];
  ossCategoryId?: number;
}

export interface OssCategoryForm {
  ossCategoryId?: number;
  categoryName?: string;
  parentId?: number;
  orderNum?: number;
  userType?: string;
  createBy?: number;
}

export interface OssCategoryVO {
  ossCategoryId?: number;
  categoryName?: string;
  parentId?: number;
  parentCategoryName?: string;
  categoryPath?: string;
  level?: number;
  orderNum?: number;
  userType?: string;
  createBy?: number;
  updateTime?: string;
  createTime?: string;
  fileCount?: number;
  children?: OssCategoryVO[];
}
