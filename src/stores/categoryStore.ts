import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { defaultExpenseCategories, defaultIncomeCategories } from "../constants/categories";
import type { Category } from "../types/category";
import type { RecordType } from "../types/record";

type CategoryInput = {
  name: string;
  type: RecordType;
  color: string;
  icon?: string;
};

type CategoryStore = {
  customCategories: Category[];
  hiddenDefaultCategoryIds: string[];
  addCategory: (input: CategoryInput) => void;
  updateCategory: (categoryId: string, updates: Partial<CategoryInput>) => void;
  deleteCategory: (categoryId: string) => void;
  toggleDefaultCategoryVisibility: (categoryId: string) => void;
};

const defaultCategories = [...defaultExpenseCategories, ...defaultIncomeCategories];

export const useCategoryStore = create<CategoryStore>()(
  persist(
    (set) => ({
      customCategories: [],
      hiddenDefaultCategoryIds: [],
      addCategory: (input) =>
        set((state) => ({
          customCategories: [
            {
              id: crypto.randomUUID(),
              name: input.name.trim(),
              type: input.type,
              color: input.color,
              icon: input.icon?.trim() || getDefaultIcon(input.type),
              isDefault: false,
            },
            ...state.customCategories,
          ],
        })),
      updateCategory: (categoryId, updates) =>
        set((state) => ({
          customCategories: state.customCategories.map((category) =>
            category.id === categoryId
              ? {
                  ...category,
                  ...updates,
                  name: updates.name?.trim() ?? category.name,
                  icon:
                    updates.icon !== undefined
                      ? updates.icon.trim() || category.icon
                      : category.icon,
                }
              : category,
          ),
        })),
      deleteCategory: (categoryId) =>
        set((state) => ({
          customCategories: state.customCategories.filter((category) => category.id !== categoryId),
        })),
      toggleDefaultCategoryVisibility: (categoryId) =>
        set((state) => ({
          hiddenDefaultCategoryIds: state.hiddenDefaultCategoryIds.includes(categoryId)
            ? state.hiddenDefaultCategoryIds.filter((id) => id !== categoryId)
            : [...state.hiddenDefaultCategoryIds, categoryId],
        })),
    }),
    {
      name: "moamong-categories",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

export function getMergedCategories(state: Pick<CategoryStore, "customCategories" | "hiddenDefaultCategoryIds">) {
  const visibleDefaultCategories = defaultCategories.map((category) => ({
    ...category,
    isHidden: state.hiddenDefaultCategoryIds.includes(category.id),
  }));

  return [...visibleDefaultCategories, ...state.customCategories];
}

export function getCategoriesByType(
  state: Pick<CategoryStore, "customCategories" | "hiddenDefaultCategoryIds">,
  type: RecordType,
  options?: { includeHidden?: boolean },
) {
  const includeHidden = options?.includeHidden ?? false;

  return getMergedCategories(state).filter(
    (category) =>
      category.type === type &&
      (includeHidden || !category.isHidden),
  );
}

function getDefaultIcon(type: RecordType) {
  return type === "expense" ? "wallet" : "sparkles";
}
