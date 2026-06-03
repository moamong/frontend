import { PiggyBank } from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "../components/common/Modal";
import { RecordForm } from "../components/record/RecordForm";
import { getMergedCategories, useCategoryStore } from "../stores/categoryStore";
import { useGoalStore } from "../stores/goalStore";
import { useRecordStore } from "../stores/recordStore";
import type { MoneyRecord } from "../types/record";
import { formatShortDate } from "../utils/date";
import { getCharacterGrowth } from "../utils/growth";
import { formatCurrency } from "../utils/money";

export function HomePage() {
  const records = useRecordStore((state) => state.records);
  const removeRecord = useRecordStore((state) => state.removeRecord);
  const monthlyGoalAmount = useGoalStore((state) => state.monthlyGoalAmount);
  const customCategories = useCategoryStore((state) => state.customCategories);
  const hiddenDefaultCategoryIds = useCategoryStore((state) => state.hiddenDefaultCategoryIds);
  const [selectedRecord, setSelectedRecord] = useState<MoneyRecord | null>(null);

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyRecords = useMemo(
    () =>
      records.filter((record) => {
        const date = new Date(record.date);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }),
    [currentMonth, currentYear, records],
  );

  const monthlyIncome = monthlyRecords
    .filter((record) => record.type === "income")
    .reduce((total, record) => total + record.amount, 0);
  const monthlyExpense = monthlyRecords
    .filter((record) => record.type === "expense")
    .reduce((total, record) => total + record.amount, 0);
  const monthlyNetAmount = monthlyIncome - monthlyExpense;
  const monthlySaving = Math.max(monthlyNetAmount, 0);
  const remainingGoalAmount = Math.max(monthlyGoalAmount - monthlyNetAmount, 0);
  const recentRecords = records.slice(0, 4);
  const growth = getCharacterGrowth(monthlySaving, monthlyGoalAmount);

  const categoryNameById = useMemo(
    () =>
      Object.fromEntries(
        getMergedCategories({ customCategories, hiddenDefaultCategoryIds }).map((category) => [
          category.id,
          category.name,
        ]),
      ),
    [customCategories, hiddenDefaultCategoryIds],
  );

  return (
    <>
      <section className="space-y-5">
        <header className="space-y-2 text-left">
          <h1 className="font-['GeekbleMalrangiche'] text-3xl tracking-tight">모아몽</h1>
        </header>

        <article className="rounded-[28px] bg-white/85 p-5 shadow-card backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-stone-500">이번 달 캐릭터</p>
              <h2 className="mt-1 font-['GeekbleMalrangiche'] text-2xl tracking-tight">
                {growth.title}
              </h2>
            </div>
            <div className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-coral">
              Lv.{growth.level}
            </div>
          </div>

          <div className="mt-5 rounded-[24px] bg-[linear-gradient(135deg,_#fff6dc,_#f4d2bc)] p-6 text-center">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-white/70 shadow-inner">
              <PiggyBank size={72} className="text-coral" aria-hidden="true" />
            </div>
            <p className="mt-4 text-sm text-stone-600">{growth.description}</p>
          </div>

          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between text-sm font-medium text-stone-600">
              <span>성장 게이지</span>
              <span>{growth.progressPercent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-sand">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,_#ef8a62,_#f3be7f)] transition-[width]"
                style={{ width: `${growth.progressPercent}%` }}
              />
            </div>
          </div>
        </article>

        <div className="grid grid-cols-2 gap-4">
          <InsightCard
            label="이번 달 저축"
            value={formatCurrency(monthlySaving)}
            caption={
              growth.isGoalAchieved
                ? "목표 달성 완료"
                : monthlyGoalAmount > 0
                  ? `${formatCurrency(remainingGoalAmount)} 남았어요`
                  : "목표를 설정해보세요"
            }
          />
          <InsightCard
            label="목표 달성률"
            value={`${growth.progressPercent}%`}
            caption={
              monthlyGoalAmount > 0
                ? `목표 ${formatCurrency(monthlyGoalAmount)}`
                : "설정에서 월 목표를 정할 수 있어요"
            }
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <SummaryCard label="이번 달 수입" value={formatCurrency(monthlyIncome)} />
          <SummaryCard label="이번 달 지출" value={formatCurrency(monthlyExpense)} />
        </div>

        <article className="rounded-[28px] bg-white/85 p-5 shadow-card backdrop-blur">
          <div>
            <p className="text-sm text-stone-500">최근 기록</p>
            <p className="mt-1 text-lg font-bold">가장 최근에 추가한 내역이에요</p>
          </div>

          <div className="mt-4 space-y-3">
            {recentRecords.length > 0 ? (
              recentRecords.map((record) => (
                <RecentRecordItem
                  key={record.id}
                  record={record}
                  categoryName={categoryNameById[record.categoryId] ?? "기타"}
                  onClick={() => setSelectedRecord(record)}
                />
              ))
            ) : (
              <div className="rounded-2xl bg-sand/70 px-4 py-5 text-sm text-stone-600">
                아직 기록이 없어요. 아래 `+` 버튼으로 첫 내역을 추가해보세요.
              </div>
            )}
          </div>
        </article>
      </section>

      <Modal
        isOpen={selectedRecord !== null}
        onClose={() => setSelectedRecord(null)}
        title="기록 수정"
        description="기존 내역을 수정하거나 삭제할 수 있어요."
      >
        {selectedRecord ? (
          <RecordForm
            initialRecord={selectedRecord}
            onSuccess={() => setSelectedRecord(null)}
            onDelete={() => {
              removeRecord(selectedRecord.id);
              setSelectedRecord(null);
            }}
          />
        ) : null}
      </Modal>
    </>
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

type InsightCardProps = {
  label: string;
  value: string;
  caption: string;
};

function InsightCard({ label, value, caption }: InsightCardProps) {
  return (
    <article className="rounded-[24px] bg-[linear-gradient(180deg,_rgba(255,255,255,0.96),_rgba(255,248,238,0.92))] p-4 shadow-card">
      <p className="text-sm text-stone-500">{label}</p>
      <p className="mt-3 text-xl font-bold">{value}</p>
      <p className="mt-2 text-sm text-stone-500">{caption}</p>
    </article>
  );
}

type RecentRecordItemProps = {
  record: MoneyRecord;
  categoryName: string;
  onClick: () => void;
};

function RecentRecordItem({ record, categoryName, onClick }: RecentRecordItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-4 text-left transition hover:bg-stone-50"
    >
      <div>
        <p className="text-sm font-semibold text-stone-800">{categoryName}</p>
        <p className="mt-1 text-sm text-stone-500">
          {record.type === "income" ? "수입" : "지출"} · {formatShortDate(record.date)}
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
    </button>
  );
}
