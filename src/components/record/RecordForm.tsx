import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import {
  getCategoryById,
  getCategoriesByType,
  useCategoryStore,
} from "../../stores/categoryStore";
import { useRecordStore } from "../../stores/recordStore";
import type { Category } from "../../types/category";
import type { MoneyRecord, RecordType } from "../../types/record";
import { formatNumberWithCommas, parseFormattedNumber } from "../../utils/money";

type RecordFormProps = {
  initialRecord?: MoneyRecord;
  onSuccess: () => void;
  onDelete?: () => void;
};

type FormState = {
  type: RecordType;
  amount: string;
  categoryId: string;
  memo: string;
  date: string;
};

const initialType: RecordType = "expense";

function createInitialForm(today: string, defaultCategoryId: string): FormState {
  return {
    type: initialType,
    amount: "",
    categoryId: defaultCategoryId,
    memo: "",
    date: today,
  };
}

function mapRecordToForm(record: MoneyRecord): FormState {
  return {
    type: record.type,
    amount: formatNumberWithCommas(record.amount),
    categoryId: record.categoryId,
    memo: record.memo ?? "",
    date: record.date.slice(0, 10),
  };
}

export function RecordForm({ initialRecord, onSuccess, onDelete }: RecordFormProps) {
  const addRecord = useRecordStore((state) => state.addRecord);
  const updateRecord = useRecordStore((state) => state.updateRecord);
  const customCategories = useCategoryStore((state) => state.customCategories);
  const hiddenDefaultCategoryIds = useCategoryStore((state) => state.hiddenDefaultCategoryIds);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const expenseCategories = useMemo(
    () => getCategoriesByType({ customCategories, hiddenDefaultCategoryIds }, "expense"),
    [customCategories, hiddenDefaultCategoryIds],
  );
  const incomeCategories = useMemo(
    () => getCategoriesByType({ customCategories, hiddenDefaultCategoryIds }, "income"),
    [customCategories, hiddenDefaultCategoryIds],
  );
  const defaultExpenseCategoryId = expenseCategories[0]?.id ?? "";
  const [form, setForm] = useState<FormState>(() =>
    initialRecord ? mapRecordToForm(initialRecord) : createInitialForm(today, defaultExpenseCategoryId),
  );
  const selectedCategory = useMemo(
    () =>
      form.categoryId
        ? getCategoryById({ customCategories, hiddenDefaultCategoryIds }, form.categoryId)
        : undefined,
    [customCategories, form.categoryId, hiddenDefaultCategoryIds],
  );

  const categories = useMemo(() => {
    const baseCategories = form.type === "expense" ? expenseCategories : incomeCategories;

    if (!form.categoryId || baseCategories.some((category) => category.id === form.categoryId)) {
      return baseCategories;
    }

    if (selectedCategory && selectedCategory.type === form.type) {
      return [selectedCategory, ...baseCategories];
    }

    if (initialRecord && initialRecord.categoryId === form.categoryId) {
      const fallbackCategory: Category = {
        id: form.categoryId,
        name: "삭제된 카테고리",
        type: form.type,
        color: "#b0a79f",
        icon: "dots",
        isDefault: false,
      };

      return [fallbackCategory, ...baseCategories];
    }

    return baseCategories;
  }, [
    expenseCategories,
    form.categoryId,
    form.type,
    incomeCategories,
    initialRecord,
    selectedCategory,
  ]);

  useEffect(() => {
    if (initialRecord) {
      setForm(mapRecordToForm(initialRecord));
      return;
    }

    setForm(createInitialForm(today, defaultExpenseCategoryId));
  }, [defaultExpenseCategoryId, initialRecord, today]);

  useEffect(() => {
    if (categories.some((category) => category.id === form.categoryId)) {
      return;
    }

    setForm((current) => ({
      ...current,
      categoryId: categories[0]?.id ?? "",
    }));
  }, [categories, form.categoryId]);

  const numericAmount = parseFormattedNumber(form.amount);
  const isValid = numericAmount > 0 && Boolean(form.categoryId) && Boolean(form.date);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid) {
      return;
    }

    const nextRecord = {
      type: form.type,
      amount: numericAmount,
      categoryId: form.categoryId,
      memo: form.memo.trim() || undefined,
      date: new Date(form.date).toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (initialRecord) {
      updateRecord(initialRecord.id, nextRecord);
    } else {
      addRecord(nextRecord);
      setForm(createInitialForm(today, defaultExpenseCategoryId));
    }

    onSuccess();
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      <div className="grid grid-cols-2 gap-3">
        {([
          { value: "expense", label: "지출" },
          { value: "income", label: "수입" },
        ] as const).map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              setForm((current) => ({
                ...current,
                type: option.value,
              }))
            }
            className={[
              "rounded-2xl px-4 py-3 text-sm font-semibold transition",
              form.type === option.value ? "bg-ink text-white" : "bg-white text-stone-600",
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>

      <Field label="금액">
        <input
          type="text"
          inputMode="numeric"
          value={form.amount}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              amount: formatNumberWithCommas(event.target.value),
            }))
          }
          placeholder="얼마를 기록할까요?"
          className="w-full rounded-2xl border-0 bg-white px-4 py-4 text-base outline-none ring-1 ring-stone-200 placeholder:text-stone-400 focus:ring-2 focus:ring-coral"
        />
      </Field>

      <Field label="카테고리">
        {categories.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {categories.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setForm((current) => ({
                    ...current,
                    categoryId: category.id,
                  }))
                }
                className={[
                  "rounded-2xl px-4 py-3 text-left text-sm font-medium transition",
                  form.categoryId === category.id
                    ? "bg-coral text-white"
                    : "bg-white text-stone-700 ring-1 ring-stone-200",
                ].join(" ")}
              >
                {category.isHidden ? `${category.name} (숨김됨)` : category.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl bg-sand/70 px-4 py-4 text-sm text-stone-600">
            사용할 수 있는 카테고리가 없어요. 설정에서 먼저 카테고리를 추가해보세요.
          </div>
        )}
      </Field>

      <Field label="메모">
        <textarea
          value={form.memo}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              memo: event.target.value,
            }))
          }
          rows={3}
          placeholder="선택 사항이에요"
          className="w-full resize-none rounded-2xl border-0 bg-white px-4 py-4 text-base outline-none ring-1 ring-stone-200 placeholder:text-stone-400 focus:ring-2 focus:ring-coral"
        />
      </Field>

      <Field label="날짜">
        <input
          type="date"
          value={form.date}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              date: event.target.value,
            }))
          }
          className="w-full rounded-2xl border-0 bg-white px-4 py-4 text-base outline-none ring-1 ring-stone-200 focus:ring-2 focus:ring-coral"
        />
      </Field>

      <button
        type="submit"
        disabled={!isValid}
        className="w-full rounded-2xl bg-ink px-4 py-4 text-base font-semibold text-white transition disabled:cursor-not-allowed disabled:bg-stone-300"
      >
        {initialRecord ? "기록 수정하기" : "기록 저장하기"}
      </button>

      {initialRecord ? (
        <button
          type="button"
          onClick={onDelete}
          className="w-full rounded-2xl bg-white px-4 py-4 text-base font-semibold text-coral ring-1 ring-coral/20 transition hover:bg-coral/5"
        >
          기록 삭제하기
        </button>
      ) : null}
    </form>
  );
}

type FieldProps = {
  label: string;
  children: ReactNode;
};

function Field({ label, children }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-stone-700">{label}</span>
      {children}
    </label>
  );
}
