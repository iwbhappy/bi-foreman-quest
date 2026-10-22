export interface ShiftAnalysis {
  headline: string;
  decisionStyle: string;
  strengths: { title: string; evidence: string }[];
  risks: { title: string; evidence: string }[];
  growthPlan: { action: string; why: string }[];
  managerTips: string[];
  caveat: string;
}
export interface AnalyzeResponse {
  analysis: ShiftAnalysis;
  model: string;
  promptVersion: '1';
  cached: boolean;
}
export interface TeamAnalysis {
  headline: string;
  patterns: string[];
  risks: string[];
  trainingPriorities: { quality: string; action: string }[];
  caveat: string;
}
export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);
const text = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const list = (value: unknown, count: number, check: (item: unknown) => boolean) =>
  Array.isArray(value) && value.length === count && value.every(check);
export function validAnalysis(value: unknown): value is ShiftAnalysis {
  const point = (item: unknown) => isObject(item) && text(item.title) && text(item.evidence);
  return isObject(value) && text(value.headline) && text(value.decisionStyle) && text(value.caveat)
    && list(value.strengths, 2, point) && list(value.risks, 2, point)
    && list(value.growthPlan, 3, (item) => isObject(item) && text(item.action) && text(item.why))
    && list(value.managerTips, 3, text);
}
export function validAnalyzeResponse(value: unknown): value is AnalyzeResponse {
  return isObject(value) && validAnalysis(value.analysis) && text(value.model)
    && value.promptVersion === '1' && typeof value.cached === 'boolean';
}
export function validTeamAnalysis(value: unknown): value is TeamAnalysis {
  return isObject(value) && text(value.headline) && text(value.caveat)
    && list(value.patterns, 3, text) && list(value.risks, 2, text)
    && list(value.trainingPriorities, 3, (item) => isObject(item) && text(item.quality) && text(item.action));
}
