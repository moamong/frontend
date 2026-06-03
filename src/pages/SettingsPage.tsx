import { useEffect, useState, type FormEvent } from "react";
import { defaultExpenseCategories, defaultIncomeCategories } from "../constants/categories";
import { useGoalStore } from "../stores/goalStore";
import { formatCurrency, formatNumberWithCommas, parseFormattedNumber } from "../utils/money";

export function SettingsPage() {
  const monthlyGoalAmount = useGoalStore((state) => state.monthlyGoalAmount);
  const setMonthlyGoalAmount = useGoalStore((state) => state.setMonthlyGoalAmount);
  const [goalInput, setGoalInput] = useState(() => formatNumberWithCommas(monthlyGoalAmount));

  useEffect(() => {
    setGoalInput(formatNumberWithCommas(monthlyGoalAmount));
  }, [monthlyGoalAmount]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMonthlyGoalAmount(parseFormattedNumber(goalInput));
  };

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <p className="text-sm font-medium text-stone-600">기본값 관리</p>
        <h1 className="text-3xl font-bold tracking-tight">설정</h1>
      </header>

      <article className="rounded-[28px] bg-white/85 p-5 shadow-card">
        <p className="text-sm text-stone-500">이번 달 저축 목표</p>
        <p className="mt-3 text-2xl font-bold">{formatCurrency(monthlyGoalAmount)}</p>
        <form className="mt-4 space-y-3" onSubmit={handleSubmit}>
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

      <SettingsBlock
        title="지출 카테고리"
        items={defaultExpenseCategories.map((category) => category.name)}
      />
      <SettingsBlock
        title="수입 카테고리"
        items={defaultIncomeCategories.map((category) => category.name)}
      />
    </section>
  );
}

type SettingsBlockProps = {
  title: string;
  items: string[];
};

function SettingsBlock({ title, items }: SettingsBlockProps) {
  return (
    <article className="rounded-[28px] bg-white/85 p-5 shadow-card">
      <h2 className="text-lg font-bold">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {items.map((item) => (
          <span
            key={item}
            className="rounded-full bg-sand px-3 py-2 text-sm font-medium text-stone-700"
          >
            {item}
          </span>
        ))}
      </div>
    </article>
  );
}
