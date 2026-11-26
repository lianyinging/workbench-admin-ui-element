/**
 * 获取并设置最后一级对象
 */
export const getAndSetLastObject = (obj: Record<string, any>, keys: string[]) => {
  if (keys.length > 1) {
    obj[keys[0]] ??= {};
  }
  return keys.reduce((pre, cur, index) => {
    if (index !== keys.length - 1) {
      pre[cur] ??= {};
      return pre[cur];
    }
    return pre;
  }, obj);
};