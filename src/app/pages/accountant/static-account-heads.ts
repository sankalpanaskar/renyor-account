export const STATIC_ACCOUNT_HEAD_NAMES = [
  'Equity',
  'Liabilities',
  'Assets',
  'Income',
  'Expenses',
] as const;

export function normalizeAccountHeadName(value: any): string {
  const normalizedName = `${value || ''}`.trim().toLowerCase().replace(/[^a-z]/g, '');
  return normalizedName === 'liablities' ? 'liabilities' : normalizedName;
}
