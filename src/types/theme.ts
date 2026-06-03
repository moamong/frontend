export type Theme = "pig" | "hamster" | "squirrel" | "otter";

export type CharacterGrowth = {
  theme: Theme;
  level: number;
  exp: number;
  savingAmount: number;
  monthlyGoalAmount: number;
};
