'use client';

import { useMemo, useState } from 'react';
import { Input, Label } from '@/components/ui';
import { computeReconstitution, formatCalcNumber } from '@/lib/peptide-calculator';

export function PeptideCalculator() {
  const [peptideMg, setPeptideMg] = useState('5');
  const [waterMl, setWaterMl] = useState('2');
  const [doseMcg, setDoseMcg] = useState('250');

  const result = useMemo(
    () =>
      computeReconstitution({
        peptideMg: Number(peptideMg),
        waterMl: Number(waterMl),
        doseMcg: Number(doseMcg),
      }),
    [peptideMg, waterMl, doseMcg],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
      <form
        className="space-y-5 rounded-2xl bg-neutral-50 p-6 ring-1 ring-neutral-200/80 sm:p-7"
        onSubmit={(e) => e.preventDefault()}
      >
        <div>
          <p className="font-heading text-lg font-semibold text-brand-deep">Inputs</p>
          <p className="mt-1 text-sm text-neutral-500">Values from your vial label and protocol plan</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="calc-peptide">Peptide amount (mg)</Label>
          <Input
            id="calc-peptide"
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            value={peptideMg}
            onChange={(e) => setPeptideMg(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="calc-water">Solvent volume (mL)</Label>
          <Input
            id="calc-water"
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            value={waterMl}
            onChange={(e) => setWaterMl(e.target.value)}
            placeholder="e.g. bacteriostatic water"
          />
          <p className="text-xs text-neutral-500">
            Use only solvents appropriate for your assay and institutional protocols.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="calc-dose">Desired research aliquot (mcg)</Label>
          <Input
            id="calc-dose"
            type="number"
            min={0}
            step="any"
            inputMode="decimal"
            value={doseMcg}
            onChange={(e) => setDoseMcg(e.target.value)}
          />
        </div>
      </form>

      <div className="rounded-2xl bg-gradient-to-br from-brand-deep to-brand-natural p-6 text-white sm:p-7">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-leaf">Results</p>
        {result ? (
          <dl className="mt-5 space-y-6">
            <div>
              <dt className="text-sm text-white/65">Concentration</dt>
              <dd className="mt-1 font-heading text-3xl font-bold tracking-tight">
                {formatCalcNumber(result.concentrationMgPerMl)}{' '}
                <span className="text-xl font-semibold text-white/80">mg/mL</span>
              </dd>
              <dd className="mt-1 text-sm text-white/70">
                ({formatCalcNumber(result.concentrationMcgPerMl, 1)} mcg/mL)
              </dd>
            </div>
            <div className="border-t border-white/15 pt-6">
              <dt className="text-sm text-white/65">Volume for aliquot</dt>
              <dd className="mt-1 font-heading text-3xl font-bold tracking-tight">
                {formatCalcNumber(result.volumeMl)}{' '}
                <span className="text-xl font-semibold text-white/80">mL</span>
              </dd>
              <dd className="mt-1 text-sm text-white/70">
                ≈ {formatCalcNumber(result.insulinUnits, 1)} units on a U-100 syringe scale
              </dd>
            </div>
          </dl>
        ) : (
          <p className="mt-5 text-sm leading-relaxed text-white/80">
            Enter positive values for peptide mass, solvent volume, and desired aliquot to see
            concentration and draw volume.
          </p>
        )}
        <p className="mt-8 border-t border-white/15 pt-5 text-xs leading-relaxed text-white/60">
          Planning aid for laboratory reconstitution only. Verify calculations independently. Not
          medical, dosing, or clinical guidance.
        </p>
      </div>
    </div>
  );
}
