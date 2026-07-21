/**
 * Peptide reconstitution math (lab planning only — research use).
 */

export type CalculatorInputs = {
  peptideMg: number;
  waterMl: number;
  doseMcg: number;
};

export type CalculatorResult = {
  concentrationMgPerMl: number;
  concentrationMcgPerMl: number;
  volumeMl: number;
  insulinUnits: number;
};

export function computeReconstitution({
  peptideMg,
  waterMl,
  doseMcg,
}: CalculatorInputs): CalculatorResult | null {
  if (
    !Number.isFinite(peptideMg) ||
    !Number.isFinite(waterMl) ||
    !Number.isFinite(doseMcg) ||
    peptideMg <= 0 ||
    waterMl <= 0 ||
    doseMcg <= 0
  ) {
    return null;
  }

  const concentrationMgPerMl = peptideMg / waterMl;
  const concentrationMcgPerMl = concentrationMgPerMl * 1000;
  const volumeMl = doseMcg / concentrationMcgPerMl;
  const insulinUnits = volumeMl * 100; // U-100 syringe: 100 units = 1 mL

  return {
    concentrationMgPerMl,
    concentrationMcgPerMl,
    volumeMl,
    insulinUnits,
  };
}

export function formatCalcNumber(value: number, digits = 3): string {
  if (!Number.isFinite(value)) return '—';
  if (value >= 100) return value.toFixed(1);
  if (value >= 10) return value.toFixed(2);
  return value.toFixed(digits);
}
