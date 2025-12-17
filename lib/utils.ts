/**
 * 工具函数
 */

export function formatDistanceToNow(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return days === 1 ? "1 天前" : `${days} 天前`;
  }
  if (hours > 0) {
    return hours === 1 ? "1 小时前" : `${hours} 小时前`;
  }
  if (minutes > 0) {
    return minutes === 1 ? "1 分钟前" : `${minutes} 分钟前`;
  }
  return "刚刚";
}

/**
 * 生成唯一 ID
 */
export function generateId(prefix: string = ""): string {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
