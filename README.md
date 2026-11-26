# WorkBench_管理端_ui_element

Opc WorkBench 管理端 **Element Plus** 前端（基于 [plus-ui](https://gitee.com/dromara/plus-ui)）。

与 [`WorkBench_管理端_ui_tdesign`](../WorkBench_管理端_ui_tdesign)（TDesign）并存：生产近期仍用 TDesign；本仓用于 Element 迁移联调。

## 本地启动

前置：后端 [`WorkBench_管理端_service`](../WorkBench_管理端_service) 的 `dev` 已在 `http://localhost:9080` 启动。

```bash
pnpm install
pnpm dev
```

- 地址：`http://localhost:9003`
- 代理：`/dev-api` → `http://localhost:9080`
- 加密 RSA / `VITE_APP_CLIENT_ID` 已与 TDesign / 后端对齐（见 `.env.development`）

## OPC 定制页（菜单 component）

| 菜单 component | 页面 |
|----------------|------|
| `system/coworker/index` | 同事目录 |
| `system/mcpGateway/index` | MCP 网关 |
| `system/desktopUser/index` | 客户端用户 |
| `system/industryApp/index` | 行业应用 |
| `monitor/desktop/index` | 桌面设备监控 |

## 已对齐 TDesign 的系统页（菜单 component）

| 菜单 component | 页面 |
|----------------|------|
| `system/tenant/index` | 租户管理 |
| `system/tenantPackage/index` | 租户套餐 |
| `system/tenantApp/index` | 租户应用 |
| `system/messageConfig/index` | 消息配置 |
| `system/messageKey/index` | 消息常量 |
| `system/messageTemplate/index` | 消息模板 |
| `system/messageLog/index` | 消息发送记录 |
| `system/sensitiveWord/index` | 敏感词 |
| `system/storageConfig/index` | 存储配置 |
| `system/file/index` | 文件管理 |
| `system/myFile/index` | 我的文件 |
| `system/ossConfig/index` | OSS 配置 |
| `system/ossCategory/index` | 我的文件（OSS 分类） |
| `system/ossRule/index` | OSS 处理规则 |

## 目录关系

| 目录 | 说明 |
|------|------|
| `WorkBench_工作台/` | 工作区根 |
| `WorkBench_管理端_ui_element` | 本仓 Element |
| `WorkBench_管理端_ui_tdesign` | 现网 TDesign |
| `WorkBench_管理端_service` | 后端（9080） |
| `WorkBench_桌面端` | 桌面端 |
