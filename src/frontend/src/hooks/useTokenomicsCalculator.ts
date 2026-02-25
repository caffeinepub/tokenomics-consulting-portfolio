import { useState, useCallback, useMemo } from 'react';

export type UnlockType = 'immediate' | 'linear_monthly' | 'quarterly';

export interface AllocationCategory {
  id: string;
  name: string;
  percentage: number;
  vestingMonths: number;
  cliffMonths: number;
  unlockType: UnlockType;
  color: string;
}

export interface TimelineDataPoint {
  month: number;
  [key: string]: number;
}

const DEFAULT_CATEGORIES: AllocationCategory[] = [
  { id: 'team', name: 'Team', percentage: 20, vestingMonths: 48, cliffMonths: 12, unlockType: 'linear_monthly', color: '#2dd4bf' },
  { id: 'investors', name: 'Investors', percentage: 15, vestingMonths: 24, cliffMonths: 6, unlockType: 'linear_monthly', color: '#f59e0b' },
  { id: 'community', name: 'Community', percentage: 30, vestingMonths: 36, cliffMonths: 0, unlockType: 'linear_monthly', color: '#818cf8' },
  { id: 'treasury', name: 'Treasury', percentage: 20, vestingMonths: 60, cliffMonths: 12, unlockType: 'quarterly', color: '#34d399' },
  { id: 'advisors', name: 'Advisors', percentage: 5, vestingMonths: 24, cliffMonths: 6, unlockType: 'linear_monthly', color: '#fb923c' },
  { id: 'public_sale', name: 'Public Sale', percentage: 10, vestingMonths: 0, cliffMonths: 0, unlockType: 'immediate', color: '#f472b6' },
];

export function useTokenomicsCalculator() {
  const [totalSupply, setTotalSupply] = useState<number>(1_000_000_000);
  const [categories, setCategories] = useState<AllocationCategory[]>(DEFAULT_CATEGORIES);

  const totalPercentage = useMemo(
    () => categories.reduce((sum, cat) => sum + cat.percentage, 0),
    [categories]
  );

  const isValid = Math.abs(totalPercentage - 100) < 0.001;

  const tokenCounts = useMemo(
    () =>
      categories.reduce<Record<string, number>>((acc, cat) => {
        acc[cat.id] = (totalSupply * cat.percentage) / 100;
        return acc;
      }, {}),
    [totalSupply, categories]
  );

  const updateCategory = useCallback((id: string, updates: Partial<AllocationCategory>) => {
    setCategories((prev) =>
      prev.map((cat) => (cat.id === id ? { ...cat, ...updates } : cat))
    );
  }, []);

  const replaceCategories = useCallback((newCategories: AllocationCategory[]) => {
    setCategories(newCategories);
  }, []);

  const resetToDefaults = useCallback(() => {
    setTotalSupply(1_000_000_000);
    setCategories(DEFAULT_CATEGORIES);
  }, []);

  const timelineData = useMemo((): TimelineDataPoint[] => {
    const maxMonths = Math.max(...categories.map((c) => c.cliffMonths + c.vestingMonths), 12);
    const points: TimelineDataPoint[] = [];

    for (let month = 0; month <= maxMonths; month++) {
      const point: TimelineDataPoint = { month };
      categories.forEach((cat) => {
        const tokens = tokenCounts[cat.id] || 0;
        point[cat.id] = computeUnlockedAtMonth(cat, tokens, month);
      });
      points.push(point);
    }
    return points;
  }, [categories, tokenCounts]);

  const pieData = useMemo(
    () =>
      categories.map((cat) => ({
        name: cat.name,
        value: cat.percentage,
        tokens: tokenCounts[cat.id] || 0,
        color: cat.color,
        id: cat.id,
      })),
    [categories, tokenCounts]
  );

  return {
    totalSupply,
    setTotalSupply,
    categories,
    setCategories: replaceCategories,
    updateCategory,
    totalPercentage,
    isValid,
    tokenCounts,
    timelineData,
    pieData,
    resetToDefaults,
  };
}

function computeUnlockedAtMonth(
  cat: AllocationCategory,
  totalTokens: number,
  month: number
): number {
  if (totalTokens === 0) return 0;

  if (cat.unlockType === 'immediate') {
    return month >= cat.cliffMonths ? totalTokens : 0;
  }

  if (month < cat.cliffMonths) return 0;

  const vestingMonths = cat.vestingMonths;
  if (vestingMonths === 0) return totalTokens;

  const elapsed = month - cat.cliffMonths;

  if (cat.unlockType === 'linear_monthly') {
    const fraction = Math.min(elapsed / vestingMonths, 1);
    return totalTokens * fraction;
  }

  if (cat.unlockType === 'quarterly') {
    const quartersElapsed = Math.floor(elapsed / 3);
    const totalQuarters = Math.ceil(vestingMonths / 3);
    const fraction = Math.min(quartersElapsed / totalQuarters, 1);
    return totalTokens * fraction;
  }

  return 0;
}
