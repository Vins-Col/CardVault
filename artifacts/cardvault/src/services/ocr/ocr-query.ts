export function constructSearchQuery(
  name: string,
  setCode: string,
  collectorNumber: string,
): string {
  const cleanName = name.trim();
  const cleanSet = setCode.trim();
  const baseNum = collectorNumber.split("/")[0]?.trim() ?? collectorNumber.trim();

  const parts = [cleanName];
  if (cleanSet) {
    parts.push(cleanSet);
  }
  if (baseNum) {
    parts.push(baseNum);
  }
  return parts.filter(Boolean).join(" ");
}
