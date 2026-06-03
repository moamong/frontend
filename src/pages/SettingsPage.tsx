import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Modal } from "../components/common/Modal";
import { getCategoriesByType, useCategoryStore } from "../stores/categoryStore";
import { useGoalStore } from "../stores/goalStore";
import type { Category } from "../types/category";
import type { RecordType } from "../types/record";
import { formatCurrency, formatNumberWithCommas, parseFormattedNumber } from "../utils/money";

type CategoryFormState = {
  name: string;
  color: string;
};

const defaultFormState: CategoryFormState = {
  name: "",
  color: "#ef8a62",
};

export function SettingsPage() {
  const monthlyGoalAmount = useGoalStore((state) => state.monthlyGoalAmount);
  const setMonthlyGoalAmount = useGoalStore((state) => state.setMonthlyGoalAmount);
  const customCategories = useCategoryStore((state) => state.customCategories);
  const hiddenDefaultCategoryIds = useCategoryStore((state) => state.hiddenDefaultCategoryIds);
  const addCategory = useCategoryStore((state) => state.addCategory);
  const updateCategory = useCategoryStore((state) => state.updateCategory);
  const deleteCategory = useCategoryStore((state) => state.deleteCategory);
  const toggleDefaultCategoryVisibility = useCategoryStore(
    (state) => state.toggleDefaultCategoryVisibility,
  );
  const [goalInput, setGoalInput] = useState(() => formatNumberWithCommas(monthlyGoalAmount));

  const expenseCategories = useMemo(
    () =>
      getCategoriesByType(
        { customCategories, hiddenDefaultCategoryIds },
        "expense",
        { includeHidden: true },
      ),
    [customCategories, hiddenDefaultCategoryIds],
  );
  const incomeCategories = useMemo(
    () =>
      getCategoriesByType(
        { customCategories, hiddenDefaultCategoryIds },
        "income",
        { includeHidden: true },
      ),
    [customCategories, hiddenDefaultCategoryIds],
  );

  useEffect(() => {
    setGoalInput(formatNumberWithCommas(monthlyGoalAmount));
  }, [monthlyGoalAmount]);

  const handleGoalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMonthlyGoalAmount(parseFormattedNumber(goalInput));
  };

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <h1 className="font-['GeekbleMalrangiche'] text-3xl tracking-tight">설정</h1>
      </header>

      <article className="rounded-[28px] bg-white/85 p-5 shadow-card">
        <p className="text-sm text-stone-500">이번 달 저축 목표</p>
        <p className="mt-3 text-2xl font-bold">{formatCurrency(monthlyGoalAmount)}</p>
        <form className="mt-4 space-y-3" onSubmit={handleGoalSubmit}>
          <input
            type="text"
            inputMode="numeric"
            value={goalInput}
            onChange={(event) => setGoalInput(formatNumberWithCommas(event.target.value))}
            placeholder="예: 300,000"
            className="w-full rounded-2xl border-0 bg-[#fffaf3] px-4 py-4 text-base outline-none ring-1 ring-stone-200 placeholder:text-stone-400 focus:ring-2 focus:ring-coral"
          />
          <button
            type="submit"
            className="w-full rounded-2xl bg-ink px-4 py-4 text-base font-semibold text-white transition hover:opacity-95"
          >
            목표 저장하기
          </button>
        </form>
      </article>

      <CategorySection
        type="expense"
        title="지출 카테고리"
        categories={expenseCategories}
        onAddCategory={addCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
        onToggleDefaultCategoryVisibility={toggleDefaultCategoryVisibility}
      />
      <CategorySection
        type="income"
        title="수입 카테고리"
        categories={incomeCategories}
        onAddCategory={addCategory}
        onUpdateCategory={updateCategory}
        onDeleteCategory={deleteCategory}
        onToggleDefaultCategoryVisibility={toggleDefaultCategoryVisibility}
      />
    </section>
  );
}

type CategorySectionProps = {
  type: RecordType;
  title: string;
  categories: Category[];
  onAddCategory: (input: { name: string; type: RecordType; color: string }) => void;
  onUpdateCategory: (
    categoryId: string,
    updates: { name?: string; color?: string },
  ) => void;
  onDeleteCategory: (categoryId: string) => void;
  onToggleDefaultCategoryVisibility: (categoryId: string) => void;
};

function CategorySection({
  type,
  title,
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onToggleDefaultCategoryVisibility,
}: CategorySectionProps) {
  const [form, setForm] = useState<CategoryFormState>({
    ...defaultFormState,
    color: type === "expense" ? "#ef8a62" : "#8dc9b5",
  });
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [isComposerOpen, setIsComposerOpen] = useState(false);

  const editingCategory = useMemo(
    () => categories.find((category) => category.id === editingCategoryId) ?? null,
    [categories, editingCategoryId],
  );

  const resetForm = () => {
    setForm({
      ...defaultFormState,
      color: type === "expense" ? "#ef8a62" : "#8dc9b5",
    });
  };

  useEffect(() => {
    if (!editingCategory) {
      return;
    }

    setForm({
      name: editingCategory.name,
      color: editingCategory.color,
    });
  }, [editingCategory]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedName = form.name.trim();

    if (!trimmedName) {
      return;
    }

    if (editingCategory) {
      onUpdateCategory(editingCategory.id, {
        name: trimmedName,
        color: form.color,
      });
      setEditingCategoryId(null);
    } else {
      onAddCategory({
        name: trimmedName,
        type,
        color: form.color,
      });
    }

    resetForm();
    setIsComposerOpen(false);
  };

  const handleCancelEdit = () => {
    setEditingCategoryId(null);
    resetForm();
    setIsComposerOpen(false);
  };

  const handleStartAdd = () => {
    setEditingCategoryId(null);
    resetForm();
    setIsComposerOpen(true);
  };

  const handleStartEdit = (category: Category) => {
    setEditingCategoryId(category.id);
    setForm({
      name: category.name,
      color: category.color,
    });
    setIsComposerOpen(true);
  };

  return (
    <article className="rounded-[28px] bg-white/85 p-5 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <p className="mt-1 text-sm text-stone-500">
            기본 카테고리는 숨길 수 있고, 직접 만든 카테고리는 수정하거나 삭제할 수 있어요.
          </p>
        </div>
        <button
          type="button"
          onClick={handleStartAdd}
          className="shrink-0 rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white transition hover:opacity-95"
        >
          추가하기
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className={[
              "rounded-2xl px-4 py-4 transition",
              category.isHidden ? "bg-stone-100/80" : "bg-[#fffaf3]",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: category.color }}
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-stone-800">{category.name}</p>
                    {category.isDefault ? (
                      <span className="rounded-full bg-sand px-2 py-1 text-[11px] font-semibold text-stone-600">
                        기본
                      </span>
                    ) : null}
                    {category.isHidden ? (
                      <span className="rounded-full bg-stone-200 px-2 py-1 text-[11px] font-semibold text-stone-500">
                        숨김
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {category.isDefault ? (
                  <button
                    type="button"
                    onClick={() => onToggleDefaultCategoryVisibility(category.id)}
                    className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-stone-600 ring-1 ring-stone-200"
                  >
                    {category.isHidden ? "다시 표시" : "숨기기"}
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(category)}
                      className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-stone-600 ring-1 ring-stone-200"
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (editingCategoryId === category.id) {
                          handleCancelEdit();
                        }
                        onDeleteCategory(category.id);
                      }}
                      className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-coral ring-1 ring-coral/20"
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal
        isOpen={isComposerOpen}
        onClose={handleCancelEdit}
        title={editingCategory ? "카테고리 수정" : "카테고리 추가"}
        description={
          editingCategory
            ? "이름과 색상을 바꿔서 카테고리를 다시 정리할 수 있어요."
            : "새로운 카테고리를 추가해서 더 세밀하게 기록해보세요."
        }
        align="center"
      >
        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="flex items-center justify-between rounded-2xl bg-sand/70 px-4 py-3">
            <span className="text-sm font-medium text-stone-600">구분</span>
            <span
              className={[
                "rounded-full px-3 py-1 text-xs font-semibold",
                type === "expense"
                  ? "bg-coral/15 text-coral"
                  : "bg-mint/20 text-[#2f7c67]",
              ].join(" ")}
            >
              {type === "expense" ? "지출" : "수입"}
            </span>
          </div>
          <input
            type="text"
            value={form.name}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                name: event.target.value,
              }))
            }
            placeholder={type === "expense" ? "예: 반려동물" : "예: 중고거래"}
            className="w-full rounded-2xl border-0 bg-white px-4 py-3 text-base outline-none ring-1 ring-stone-200 placeholder:text-stone-400 focus:ring-2 focus:ring-coral"
          />
          <label className="flex items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-200">
            <span className="text-sm font-medium text-stone-600">색상</span>
            <input
              type="color"
              value={form.color}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  color: event.target.value,
                }))
              }
              className="h-9 w-9 cursor-pointer rounded-md border-0 bg-transparent p-0"
            />
          </label>
          <button
            type="submit"
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            {editingCategory ? "카테고리 수정하기" : "카테고리 추가하기"}
          </button>
        </form>
      </Modal>
    </article>
  );
}
