import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type GoalStore = {
  monthlyGoalAmount: number;
  setMonthlyGoalAmount: (amount: number) => void;
};

const defaultMonthlyGoalAmount = 300000;

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      monthlyGoalAmount: defaultMonthlyGoalAmount,
      setMonthlyGoalAmount: (amount) =>
        set({
          monthlyGoalAmount: Math.max(0, Math.floor(amount)),
        }),
    }),
    {
      name: "moamong-goal",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
