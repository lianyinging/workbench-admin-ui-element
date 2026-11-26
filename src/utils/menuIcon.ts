/**
 * 菜单 icon 多为 TDesign 命名，Element 本地 SVG 用另一套名字。
 * 在此做别名映射，避免侧栏缺图标。
 */
const MENU_ICON_ALIAS: Record<string, string> = {
  app: 'component',
  backup: 'redis',
  book: 'documentation',
  'book-open': 'documentation',
  bulletpoint: 'list',
  'chart-analytics': 'chart',
  'chart-bar': 'chart',
  chat: 'message',
  'chevron-right-double': 'cascader',
  cloud: 'server',
  'component-input': 'input',
  'edit-1': 'edit',
  'folder-open': 'documentation',
  history: 'time',
  internet: 'international',
  laptop: 'monitor',
  layers: 'component',
  mail: 'email',
  relativity: 'nested',
  'root-list': 'list',
  'sd-card-1': 'redis',
  send: 'guide',
  setting: 'system',
  swap: 'switch',
  'system-components': 'component',
  task: 'job',
  'task-checked': 'finish',
  'task-visible': 'eye-open',
  tools: 'tool',
  'tree-round-dot': 'tree',
  'tree-round-dot-vertical': 'tree',
  'tree-square-dot': 'tree',
  'user-arrow-left': 'peoples',
  'user-avatar': 'people',
  'user-safety': 'peoples',
  'user-talk': 'message',
  video: 'example'
};

const DEFAULT_MENU_ICON = 'list';

/** 将后端/TDesign 菜单 icon 归一为 Element 本地 svg 名 */
export function resolveMenuIcon(icon?: string | null): string {
  const raw = (icon || '').trim();
  if (!raw || raw === '#' || raw === 'null' || raw === 'undefined') {
    return DEFAULT_MENU_ICON;
  }
  // iconify 写法透传
  if (raw.includes(':') || raw.startsWith('i-')) {
    return raw;
  }
  return MENU_ICON_ALIAS[raw] || raw;
}
