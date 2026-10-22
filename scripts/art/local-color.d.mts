export const TARGETS: Record<string, number[]>;
export interface Selection { mask: Uint8Array; limit: number }
export function helmetMask(data: Buffer, width: number, height: number, profile?: string): Selection;
export function recolor(data: Buffer, target: string, selection: Selection): Buffer;
export function validateColor(base: Buffer, colored: Buffer, width: number, height: number, selection: Selection): {
  alphaDifferences: number; outsideDifferences: number; maskShare: number; maskBoxShare: number;
  maskBottomShare: number; pass: boolean;
};
