export interface FileCategoryQuery extends PageQuery {
  categoryName?: string;
  parentId?: number;
  loginType?: string;
  createBy?: number;
  maxSize?: number;
  contentTypes?: string[];
  suffixes?: string[];
  ossCategoryId?: number;
  fileCategoryId?: number;
}

export interface FileCategoryForm {
  fileCategoryId?: number;
  categoryName?: string;
  parentId?: number;
  orderNum?: number;
  loginType?: string;
  createBy?: number;
}

export interface FileCategoryVO {
  fileCategoryId?: number;
  categoryName?: string;
  parentId?: number;
  parentCategoryName?: string;
  categoryPath?: string;
  level?: number;
  orderNum?: number;
  loginType?: string;
  createBy?: number;
  updateTime?: string;
  createTime?: string;
  fileCount?: number;
  children?: FileCategoryVO[];
}
