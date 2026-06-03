import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { MoneyRecord } from "../types/record";

type RecordStore = {
  records: MoneyRecord[];
  addRecord: (record: Omit<MoneyRecord, "id" | "createdAt">) => void;
  removeRecord: (recordId: string) => void;
  clearRecords: () => void;
};

export const useRecordStore = create<RecordStore>()(
  persist(
    (set) => ({
      records: [],
      addRecord: (record) =>
        set((state) => ({
          records: [
            {
              ...record,
              id: crypto.randomUUID(),
              createdAt: new Date().toISOString(),
            },
            ...state.records,
          ],
        })),
      removeRecord: (recordId) =>
        set((state) => ({
          records: state.records.filter((record) => record.id !== recordId),
        })),
      clearRecords: () => set({ records: [] }),
    }),
    {
      name: "moamong-records",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
