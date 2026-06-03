import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { defaultExpenseCategories, defaultIncomeCategories } from "../../constants/categories";
import { useRecordStore } from "../../stores/recordStore";
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

function createInitialForm(today: string): FormState {
  return {
    type: initialType,
    amount: "",
    categoryId: defaultExpenseCategories[0]?.id ?? "",
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
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [form, setForm] = useState<FormState>(() =>
    initialRecord ? mapRecordToForm(initialRecord) : createInitialForm(today),
  );

  const categories =
    form.type === "expense" ? defaultExpenseCategories : defaultIncomeCategories;

  useEffect(() => {
    if (initialRecord) {
      setForm(mapRecordToForm(initialRecord));
      return;
    }

    setForm(createInitialForm(today));
  }, [initialRecord, today]);

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
      setForm(createInitialForm(today));
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
