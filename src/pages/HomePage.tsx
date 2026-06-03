import { defaultExpenseCategories, defaultIncomeCategories } from "../constants/categories";
import { useRecordStore } from "../stores/recordStore";

export function HomePage() {
  const records = useRecordStore((state) => state.records);

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <p className="text-sm font-medium text-stone-600">6월 저축 루틴</p>
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

      <div className="grid grid-cols-2 gap-4">
        <SummaryCard label="기본 지출 카테고리" value={`${defaultExpenseCategories.length}개`} />
        <SummaryCard label="기본 수입 카테고리" value={`${defaultIncomeCategories.length}개`} />
        <SummaryCard label="저장된 기록" value={`${records.length}건`} />
        <SummaryCard label="목표 달성률" value="0%" />
      </div>
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
