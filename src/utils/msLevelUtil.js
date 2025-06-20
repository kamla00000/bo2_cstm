// filepath: src/utils/msLevelUtil.js
export function extractLevelFromName(msName) {
  const match = msName && msName.match(/_LV(\d+)/i);
  return match ? Number(match[1]) : 1;
}