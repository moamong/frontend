export function StatisticsPage() {
  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <p className="text-sm font-medium text-stone-600">흐름 한눈에 보기</p>
        <h1 className="text-3xl font-bold tracking-tight">통계</h1>
      </header>

      <div className="grid grid-cols-4 gap-2">
        {["일간", "주간", "월간", "연간"].map((period, index) => (
          <button
            key={period}
            type="button"
            className={[
              "rounded-full px-3 py-2 text-sm font-semibold",
              index === 2 ? "bg-ink text-white" : "bg-white/75 text-stone-600",
            ].join(" ")}
          >
            {period}
          </button>
        ))}
      </div>

      <article className="rounded-[28px] bg-white/85 p-5 shadow-card">
        <p className="text-sm text-stone-500">차트 영역</p>
        <div className="mt-4 flex h-56 items-end gap-3 rounded-[24px] bg-[linear-gradient(180deg,_#fff7e8,_#f7dfcb)] p-4">
          {[40, 58, 36, 82, 65, 74, 52].map((height) => (
            <div key={height} className="flex flex-1 items-end">
              <div
                className="w-full rounded-t-2xl bg-coral/80"
                style={{ height: `${height}%` }}
              />
            </div>
          ))}
        </div>
      </article>

      <article className="rounded-[28px] bg-white/85 p-5 shadow-card">
        <p className="text-sm text-stone-500">카테고리 분석</p>
        <p className="mt-3 text-base text-stone-700">다음 단계에서 Recharts 기반 시각화를 연결할 준비가 되어 있어요.</p>
      </article>
    </section>
  );
}
