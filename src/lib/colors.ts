// 预定义的 List 颜色调色板（24色，精心挑选，区分度高）
export const LIST_COLORS = [
  // 红橙色系
  "#ef4444", // red-500
  "#f97316", // orange-500
  "#f59e0b", // amber-500
  // 黄绿色系
  "#eab308", // yellow-500
  "#84cc16", // lime-500
  "#22c55e", // green-500
  // 青色系
  "#10b981", // emerald-500
  "#14b8a6", // teal-500
  "#06b6d4", // cyan-500
  // 蓝色系
  "#0ea5e9", // sky-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  // 紫色系
  "#8b5cf6", // violet-500
  "#a855f7", // purple-500
  "#d946ef", // fuchsia-500
  // 粉红色系
  "#ec4899", // pink-500
  "#f43f5e", // rose-500
  "#e11d48", // rose-600
  // 深色系（更鲜明）
  "#dc2626", // red-600
  "#2563eb", // blue-600
  "#7c3aed", // violet-600
  "#059669", // emerald-600
  "#ca8a04", // yellow-600
  "#0891b2", // cyan-600
];

// 获取下一个可用颜色（基于已使用的颜色）
export function getNextColor(usedColors: string[]): string {
  const usedSet = new Set(usedColors.map(c => c.toLowerCase()));

  // 找到第一个未使用的颜色
  for (const color of LIST_COLORS) {
    if (!usedSet.has(color.toLowerCase())) {
      return color;
    }
  }

  // 如果所有颜色都用过了，随机选择一个
  return LIST_COLORS[Math.floor(Math.random() * LIST_COLORS.length)];
}

// 随机获取一个颜色
export function getRandomColor(): string {
  return LIST_COLORS[Math.floor(Math.random() * LIST_COLORS.length)];
}
