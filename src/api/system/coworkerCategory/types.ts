export interface OpcCoworkerCategoryVo {
  categoryId?: number;
  categoryName?: string;
  sortOrder?: number;
  status?: string;
  remark?: string;
  coworkerCount?: number;
  updateTime?: string;
}

export interface OpcCoworkerCategorySidebar {
  allCount?: number;
  uncategorizedCount?: number;
  categories?: OpcCoworkerCategoryVo[];
}

export interface OpcCoworkerCategoryForm {
  categoryId?: number;
  categoryName?: string;
  sortOrder?: number;
  status?: string;
  remark?: string;
}
