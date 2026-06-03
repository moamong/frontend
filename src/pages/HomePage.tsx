import { defaultExpenseCategories, defaultIncomeCategories } from "../constants/categories";
import { useRecordStore } from "../stores/recordStore";
import type { MoneyRecord } from "../types/record";
import { formatShortDate } from "../utils/date";
import { formatCurrency } from "../utils/money";

export function HomePage() {
  const records = useRecordStore((state) => state.records);
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthlyRecords = records.filter((record) => {
    const date = new Date(record.date);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  });
  const monthlyIncome = monthlyRecords
    .filter((record) => record.type === "income")
    .reduce((total, record) => total + record.amount, 0);
  const monthlyExpense = monthlyRecords
    .filter((record) => record.type === "expense")
    .reduce((total, record) => total + record.amount, 0);
  const monthlySaving = Math.max(monthlyIncome - monthlyExpense, 0);
  const recentRecords = records.slice(0, 4);

  return (
    <section className="space-y-5">
      <header className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">모아몽</h1>
      </header>

      <div className="rounded-[28px] bg-white/85 p-5 shadow-card backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-stone-500">이번 달 캐릭터</p>
            <p className="mt-1 text-2xl font-bold">복실 돼지</p>
          </div>
          <div className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-coral">
            Lv.1
          </div>
        </div>
        <div className="mt-5 rounded-[24px] bg-[linear-gradient(135deg,_#fff6dc,_#f4d2bc)] p-6 text-center">
          <div className="mx-auto h-36 w-36 rounded-full bg-white/60 shadow-inner" />
          <p className="mt-4 text-sm text-stone-600">절약할수록 통통하게 자라나는 돼지를 준비했어요.</p>
        </div>
      </div>

      <article className="rounded-[28px] bg-[linear-gradient(135deg,_#fff1d8,_#f6cfaf)] p-5 text-ink shadow-card">
        <p className="text-sm text-stone-600">이번 달 저축</p>
        <p className="mt-3 text-3xl font-bold">{formatCurrency(monthlySaving)}</p>
        <p className="mt-2 text-sm text-stone-600">수입에서 지출을 제외하고 현재 남은 금액이에요.</p>
      </article>

      <div className="grid grid-cols-2 gap-4">
        <SummaryCard label="이번 달 수입" value={formatCurrency(monthlyIncome)} />
        <SummaryCard label="이번 달 지출" value={formatCurrency(monthlyExpense)} />
      </div>

      <article className="rounded-[28px] bg-white/85 p-5 shadow-card backdrop-blur">
        <div>
          <div>
            <p className="text-sm text-stone-500">최근 기록</p>
            <p className="mt-1 text-lg font-bold">가장 최근에 저장한 내역이에요</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {recentRecords.length > 0 ? (
            recentRecords.map((record) => (
              <RecentRecordItem key={record.id} record={record} />
            ))
          ) : (
            <div className="rounded-2xl bg-sand/70 px-4 py-5 text-sm text-stone-600">
              아직 기록이 없어요. 오른쪽 아래 `+` 버튼으로 첫 내역을 추가해보세요.
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
};

function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <article className="rounded-[24px] bg-white/80 p-4 shadow-card backdrop-blur">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-3 text-xl font-bold">{value}</p>
    </article>
  );
}

type RecentRecordItemProps = {
  record: MoneyRecord;
};

function RecentRecordItem({ record }: RecentRecordItemProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-4">
      <div>
        <p className="text-sm font-semibold text-stone-800">
          {record.type === "income" ? "수입" : "지출"}
        </p>
        <p className="mt-1 text-sm text-stone-500">
          {formatShortDate(record.date)}
          {record.memo ? ` · ${record.memo}` : ""}
        </p>
      </div>
      <p
        className={[
          "text-base font-bold",
          record.type === "income" ? "text-mint" : "text-coral",
        ].join(" ")}
      >
        {record.type === "income" ? "+" : "-"}
        {formatCurrency(record.amount)}
      </p>
    </div>
  );
}
