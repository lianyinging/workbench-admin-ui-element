# Element Plus 管理端 UI 规范

本仓库列表页以「桌面端用户」为样板。跨项目复用请优先用 Cursor Skill：`element-plus-admin-ui`（个人 Agent Store）。

完整模板、全局 SCSS、迁移清单见 Skill 内 `reference.md`；下文为同内容摘要，便于人读与评审。

## 结构

单卡 `el-card.table-panel`：

1. 标题：仅 `h3`
2. 筛选：`query-form filter-bar` + `filter-control` + `filter-actions`
3. 工具栏：`list-toolbar`（左 CRUD，右圆形刷新）
4. 表格：`data-table` + `op-links` 文字操作
5. 分页

## 硬性规则

- 不要独立筛选卡 / `right-toolbar` / `useSearchToggle`
- 不要标题「共 N 条」说明
- 不要状态列 `el-switch`；用 `dict-tag`
- 不要操作列图标按钮；用 `el-link`
- 搜索/重置贴第一排最右侧；条件可换行

## 参考实现

- 页面：`src/views/system/desktopUser/index.vue`
- 样式：`src/assets/styles/components/_search-panel.scss`

## 在其他项目使用

1. Cursor 中启用 / 提及 Skill：`element-plus-admin-ui`
2. 或把本文件 + Skill `reference.md` 中的 SCSS 拷入目标项目全局样式
3. 按迁移清单改列表页
