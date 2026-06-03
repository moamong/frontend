import { useMemo, useState } from "react";
import { Modal } from "../components/common/Modal";
import { RecordForm } from "../components/record/RecordForm";
import { getMergedCategories, useCategoryStore } from "../stores/categoryStore";
import { useRecordStore } from "../stores/recordStore";
import type { MoneyRecord } from "../types/record";
import { formatShortDate } from "../utils/date";
import { formatCurrency } from "../utils/money";
import {
  getRecordsForPeriod,
  getStatisticsSummary,
  type StatisticsPeriod,
} from "../utils/statistics";

const periodOptions: Array<{ value: StatisticsPeriod; label: string }> = [
  { value: "daily", label: "오늘" },
  { value: "weekly", label: "이번 주" },
  { value: "monthly", label: "이번 달" },
  { value: "yearly", label: "올해" },
];

export function RecordsPage() {
  const records = useRecordStore((state) => state.records);
  const removeRecord = useRecordStore((state) => state.removeRecord);
  const customCategories = useCategoryStore((state) => state.customCategories);
  const hiddenDefaultCategoryIds = useCategoryStore((state) => state.hiddenDefaultCategoryIds);
  const [selectedRecord, setSelectedRecord] = useState<MoneyRecord | null>(null);
  const [period, setPeriod] = useState<StatisticsPeriod>("monthly");

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

  const filteredRecords = useMemo(() => getRecordsForPeriod(records, period), [period, records]);
  const summary = useMemo(() => getStatisticsSummary(records, period), [period, records]);
  return (
    <>
      <section className="space-y-5">
        <header className="space-y-2">
          <p className="text-sm font-medium text-stone-600">기간별로 보는 전체 기록</p>
          <h1 className="font-['GeekbleMalrangiche'] text-3xl tracking-tight">기록</h1>
        </header>

        <div className="grid grid-cols-4 gap-2">
          {periodOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setPeriod(option.value)}
              className={[
                "rounded-full px-3 py-2 text-sm font-semibold transition",
                period === option.value ? "bg-ink text-white" : "bg-white/75 text-stone-600",
              ].join(" ")}
            >
              {option.label}
            </button>
          ))}
        </div>

        <article className="rounded-[28px] bg-white/85 p-5 shadow-card backdrop-blur">
          <div>
            <p className="text-sm text-stone-500">기록 목록</p>
            <p className="mt-1 text-lg font-bold">선택한 기간의 내역을 날짜순으로 확인해보세요</p>
          </div>

          <div className="mt-4 space-y-3">
            {filteredRecords.length > 0 ? (
              filteredRecords.map((record) => (
                <RecordListItem
                  key={record.id}
                  record={record}
                  categoryName={categoryNameById[record.categoryId] ?? "기타"}
                  onClick={() => setSelectedRecord(record)}
                />
              ))
            ) : (
              <div className="rounded-2xl bg-sand/70 px-4 py-5 text-sm text-stone-600">
                선택한 기간에는 기록이 없어요. 다른 기간을 보거나 아래 `+` 버튼으로 새 기록을
                추가해보세요.
              </div>
            )}
          </div>
        </article>

        <article className="rounded-[28px] bg-white/85 p-5 shadow-card backdrop-blur">
          <div>
            <p className="text-sm text-stone-500">합계</p>
            <p className="mt-1 text-lg font-bold">선택한 기간의 수입과 지출을 한 번에 볼 수 있어요</p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <TotalCard label="수입" value={formatCurrency(summary.income)} accent="text-mint" />
            <TotalCard label="지출" value={formatCurrency(summary.expense)} accent="text-coral" />
            <TotalCard
              label="순저축"
              value={formatCurrency(summary.saving)}
              accent={summary.saving >= 0 ? "text-ink" : "text-coral"}
            />
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

type TotalCardProps = {
  label: string;
  value: string;
  accent: string;
};

function TotalCard({ label, value, accent }: TotalCardProps) {
  return (
    <article className="rounded-[24px] bg-[#fffaf3] p-4">
      <p className="text-sm font-medium text-stone-600">{label}</p>
      <p className={["mt-3 whitespace-nowrap text-sm font-bold leading-none sm:text-base", accent].join(" ")}>
        {value}
      </p>
    </article>
  );
}

type RecordListItemProps = {
  record: MoneyRecord;
  categoryName: string;
  onClick: () => void;
};

function RecordListItem({ record, categoryName, onClick }: RecordListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between rounded-2xl bg-white px-4 py-4 text-left transition hover:bg-stone-50"
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-stone-800">{categoryName}</p>
        <p className="mt-1 truncate text-sm text-stone-500">
          {record.type === "income" ? "수입" : "지출"} · {formatShortDate(record.date)}
          {record.memo ? ` · ${record.memo}` : ""}
        </p>
      </div>
      <p
        className={[
          "shrink-0 text-base font-bold",
          record.type === "income" ? "text-mint" : "text-coral",
        ].join(" ")}
      >
        {record.type === "income" ? "+" : "-"}
        {formatCurrency(record.amount)}
      </p>
    </button>
  );
}
