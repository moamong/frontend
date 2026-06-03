import type { CharacterGrowth } from "../types/theme";

const levelThresholds = [0, 100_000, 300_000, 600_000, 1_000_000];
const stageLabels = [
  "작은 돼지",
  "살짝 통통한 돼지",
  "포동포동한 돼지",
  "빵빵한 돼지",
  "황금 돼지",
] as const;

export type CharacterGrowthSummary = CharacterGrowth & {
  progressRatio: number;
  progressPercent: number;
  title: string;
  description: string;
  remainingGoalAmount: number;
  isGoalAchieved: boolean;
};

export function getCharacterGrowth(
  savingAmount: number,
  monthlyGoalAmount: number,
): CharacterGrowthSummary {
  const sanitizedSavingAmount = Math.max(0, savingAmount);
  const sanitizedGoalAmount = Math.max(0, monthlyGoalAmount);
  const levelIndex = getLevelIndex(sanitizedSavingAmount);
  const level = levelIndex + 1;
  const title = stageLabels[levelIndex];
  const isGoalAchieved =
    sanitizedGoalAmount > 0 && sanitizedSavingAmount >= sanitizedGoalAmount;
  const goalProgressRatio =
    sanitizedGoalAmount > 0
      ? Math.min(sanitizedSavingAmount / sanitizedGoalAmount, 1)
      : sanitizedSavingAmount > 0
        ? 1
        : 0;
  const levelProgressRatio = getLevelProgressRatio(sanitizedSavingAmount, levelIndex);
  const progressRatio =
    sanitizedGoalAmount > 0 ? goalProgressRatio : Math.max(levelProgressRatio, 0.08);

  return {
    theme: "pig",
    level,
    exp: Math.round(progressRatio * 100),
    savingAmount: sanitizedSavingAmount,
    monthlyGoalAmount: sanitizedGoalAmount,
    progressRatio,
    progressPercent: Math.round(progressRatio * 100),
    title,
    description: getDescription({
      isGoalAchieved,
      monthlyGoalAmount: sanitizedGoalAmount,
      savingAmount: sanitizedSavingAmount,
      title,
    }),
    remainingGoalAmount: Math.max(sanitizedGoalAmount - sanitizedSavingAmount, 0),
    isGoalAchieved,
  };
}

function getLevelIndex(savingAmount: number) {
  for (let index = levelThresholds.length - 1; index >= 0; index -= 1) {
    if (savingAmount >= levelThresholds[index]) {
      return index;
    }
  }

  return 0;
}

function getLevelProgressRatio(savingAmount: number, levelIndex: number) {
  const currentThreshold = levelThresholds[levelIndex] ?? 0;
  const nextThreshold = levelThresholds[levelIndex + 1];

  if (nextThreshold === undefined) {
    return 1;
  }

  const range = nextThreshold - currentThreshold;

  if (range <= 0) {
    return 0;
  }

  return Math.min(Math.max((savingAmount - currentThreshold) / range, 0), 1);
}

function getDescription({
  isGoalAchieved,
  monthlyGoalAmount,
  savingAmount,
  title,
}: {
  isGoalAchieved: boolean;
  monthlyGoalAmount: number;
  savingAmount: number;
  title: string;
}) {
  if (isGoalAchieved) {
    return `${title}가 이번 달 목표를 달성해서 아주 묵직해졌어요.`;
  }

  if (monthlyGoalAmount <= 0) {
    return savingAmount > 0
      ? `${title}가 차곡차곡 저축을 먹고 통통하게 자라고 있어요.`
      : "이번 달 목표를 정하면 돼지의 성장 속도를 더 선명하게 볼 수 있어요.";
  }

  return `${title}가 목표를 향해 차곡차곡 저축을 모으고 있어요.`;
}
