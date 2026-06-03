import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { defaultExpenseCategories, defaultIncomeCategories } from "../../constants/categories";
import { useRecordStore } from "../../stores/recordStore";
import type { RecordType } from "../../types/record";
import { formatNumberWithCommas, parseFormattedNumber } from "../../utils/money";

type RecordFormProps = {
  onSuccess: () => void;
};

type FormState = {
  type: RecordType;
  amount: string;
  categoryId: string;
  memo: string;
  date: string;
};

const initialType: RecordType = "expense";

export function RecordForm({ onSuccess }: RecordFormProps) {
  const addRecord = useRecordStore((state) => state.addRecord);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [form, setForm] = useState<FormState>({
    type: initialType,
    amount: "",
    categoryId: defaultExpenseCategories[0]?.id ?? "",
    memo: "",
    date: today,
  });

  const categories =
    form.type === "expense" ? defaultExpenseCategories : defaultIncomeCategories;

  useEffect(() => {
    setForm((current) => ({
      ...current,
      categoryId: categories[0]?.id ?? "",
    }));
  }, [form.type]);

  const numericAmount = parseFormattedNumber(form.amount);
  const isValid = numericAmount > 0 && Boolean(form.categoryId) && Boolean(form.date);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isValid) {
      return;
    }

    addRecord({
      type: form.type,
      amount: numericAmount,
      categoryId: form.categoryId,
      memo: form.memo.trim() || undefined,
      date: new Date(form.date).toISOString(),
      updatedAt: new Date().toISOString(),
    });

    onSuccess();
    setForm({
      type: initialType,
      amount: "",
      categoryId: defaultExpenseCategories[0]?.id ?? "",
      memo: "",
      date: today,
    });
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
              form.type === option.value
                ? "bg-ink text-white"
                : "bg-white text-stone-600",
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
              {category.name}
            </button>
          ))}
        </div>
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
        기록 저장하기
      </button>
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
