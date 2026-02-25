import { useState, useMemo } from 'react';
import { format, addMonths } from 'date-fns';
import { Variant_graded_cliffLinear } from '../backend';

export type VestingType = Variant_graded_cliffLinear;

export interface VestingCalculatorState {
  vestingType: VestingType;
  totalTokens: number;
  tokenPrice: number;
  cliffPeriod: number;
  vestingDuration: number;
  startDate: Date;
}

export interface VestingChartDataPoint {
  month: number;
  label: string;
  cumulative: number;
  monthly: number;
}

export interface VestingTableRow {
  month: number;
  date: string;
  monthlyUnlock: number;
  cumulativeTokens: number;
  cumulativeUSD: number;
  percentUnlocked: number;
}

const DEFAULT_STATE: VestingCalculatorState = {
  vestingType: Variant_graded_cliffLinear.cliffLinear,
  totalTokens: 10_000_000,
  tokenPrice: 0.1,
  cliffPeriod: 6,
  vestingDuration: 24,
  startDate: new Date(),
};

function computeMonthlyUnlock(
  vestingType: VestingType,
  totalTokens: number,
  cliffPeriod: number,
  vestingDuration: number,
  month: number // 1-indexed
): number {
  if (totalTokens <= 0 || vestingDuration <= 0) return 0;

  if (vestingType === Variant_graded_cliffLinear.cliffLinear) {
    // Cliff + Linear: nothing during cliff, then linear monthly
    if (month <= cliffPeriod) return 0;
    const monthlyAmount = totalTokens / vestingDuration;
    const vestingMonth = month - cliffPeriod;
    if (vestingMonth > vestingDuration) return 0;
    return monthlyAmount;
  }

  if (vestingType === Variant_graded_cliffLinear.graded) {
    // Graded/Stepped: divide vesting into 4 equal tranches
    const numSteps = 4;
    const stepSize = Math.ceil(vestingDuration / numSteps);
    const tokensPerStep = totalTokens / numSteps;

    if (month <= cliffPeriod) return 0;
    const vestingMonth = month - cliffPeriod;
    if (vestingMonth > vestingDuration) return 0;

    // Unlock at the end of each step period
    if (vestingMonth % stepSize === 0 || vestingMonth === vestingDuration) {
      const stepIndex = Math.ceil(vestingMonth / stepSize);
      if (stepIndex <= numSteps) return tokensPerStep;
    }
    return 0;
  }

  return 0;
}

export function useVestingCalculator(externalState?: Partial<VestingCalculatorState>) {
  const [vestingType, setVestingType] = useState<VestingType>(
    externalState?.vestingType ?? DEFAULT_STATE.vestingType
  );
  const [totalTokens, setTotalTokens] = useState<number>(
    externalState?.totalTokens ?? DEFAULT_STATE.totalTokens
  );
  const [tokenPrice, setTokenPrice] = useState<number>(
    externalState?.tokenPrice ?? DEFAULT_STATE.tokenPrice
  );
  const [cliffPeriod, setCliffPeriod] = useState<number>(
    externalState?.cliffPeriod ?? DEFAULT_STATE.cliffPeriod
  );
  const [vestingDuration, setVestingDuration] = useState<number>(
    externalState?.vestingDuration ?? DEFAULT_STATE.vestingDuration
  );
  const [startDate, setStartDate] = useState<Date>(
    externalState?.startDate ?? DEFAULT_STATE.startDate
  );

  const totalMonths = cliffPeriod + vestingDuration;

  const chartData = useMemo((): VestingChartDataPoint[] => {
    if (totalTokens <= 0 || vestingDuration <= 0) return [];
    const points: VestingChartDataPoint[] = [];
    let cumulative = 0;

    for (let month = 0; month <= totalMonths; month++) {
      const monthly = month === 0 ? 0 : computeMonthlyUnlock(vestingType, totalTokens, cliffPeriod, vestingDuration, month);
      cumulative += monthly;
      points.push({
        month,
        label: format(addMonths(startDate, month), 'MMM yyyy'),
        cumulative: Math.min(cumulative, totalTokens),
        monthly,
      });
    }
    return points;
  }, [vestingType, totalTokens, cliffPeriod, vestingDuration, startDate, totalMonths]);

  const tableData = useMemo((): VestingTableRow[] => {
    if (totalTokens <= 0 || vestingDuration <= 0) return [];
    const rows: VestingTableRow[] = [];
    let cumulative = 0;

    for (let month = 1; month <= totalMonths; month++) {
      const monthly = computeMonthlyUnlock(vestingType, totalTokens, cliffPeriod, vestingDuration, month);
      cumulative += monthly;
      const cumulativeCapped = Math.min(cumulative, totalTokens);
      rows.push({
        month,
        date: format(addMonths(startDate, month), 'MMM yyyy'),
        monthlyUnlock: monthly,
        cumulativeTokens: cumulativeCapped,
        cumulativeUSD: cumulativeCapped * tokenPrice,
        percentUnlocked: totalTokens > 0 ? (cumulativeCapped / totalTokens) * 100 : 0,
      });
    }
    return rows;
  }, [vestingType, totalTokens, tokenPrice, cliffPeriod, vestingDuration, startDate, totalMonths]);

  const loadSchedule = (state: Partial<VestingCalculatorState>) => {
    if (state.vestingType !== undefined) setVestingType(state.vestingType);
    if (state.totalTokens !== undefined) setTotalTokens(state.totalTokens);
    if (state.tokenPrice !== undefined) setTokenPrice(state.tokenPrice);
    if (state.cliffPeriod !== undefined) setCliffPeriod(state.cliffPeriod);
    if (state.vestingDuration !== undefined) setVestingDuration(state.vestingDuration);
    if (state.startDate !== undefined) setStartDate(state.startDate);
  };

  return {
    vestingType, setVestingType,
    totalTokens, setTotalTokens,
    tokenPrice, setTokenPrice,
    cliffPeriod, setCliffPeriod,
    vestingDuration, setVestingDuration,
    startDate, setStartDate,
    chartData,
    tableData,
    totalMonths,
    loadSchedule,
  };
}
