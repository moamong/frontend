import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { getMergedCategories, useCategoryStore } from "../stores/categoryStore";
import { useRecordStore } from "../stores/recordStore";
import { formatCurrency } from "../utils/money";
import {
  formatCompactCurrency,
  getCategoryBreakdown,
  getStatisticsSummary,
  getTrendData,
  type StatisticsPeriod,
} from "../utils/statistics";

const periodOptions: Array<{ value: StatisticsPeriod; label: string }> = [
  { value: "daily", label: "일간" },
  { value: "weekly", label: "주간" },
  { value: "monthly", label: "월간" },
  { value: "yearly", label: "연간" },
];

const pieColors = ["#ef8a62", "#f0b27a", "#8dc9b5", "#f39c9c", "#7ea8be", "#c8a97e"];

export function StatisticsPage() {
  const records = useRecordStore((state) => state.records);
  const customCategories = useCategoryStore((state) => state.customCategories);
  const hiddenDefaultCategoryIds = useCategoryStore((state) => state.hiddenDefaultCategoryIds);
  const [period, setPeriod] = useState<StatisticsPeriod>("monthly");

  const categoryById = useMemo(
    () =>
      Object.fromEntries(
        getMergedCategories({ customCategories, hiddenDefaultCategoryIds }).map((category) => [
          category.id,
          category,
        ]),
      ),
    [customCategories, hiddenDefaultCategoryIds],
  );

  const summary = useMemo(() => getStatisticsSummary(records, period), [period, records]);
  const trendData = useMemo(() => getTrendData(records, period), [period, records]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(records, period), [period, records]);

  const categoryChartData = categoryBreakdown.map((item, index) => ({
    name: categoryById[item.categoryId]?.name ?? "기타",
    amount: item.amount,
    ratio: item.ratio,
    color: categoryById[item.categoryId]?.color ?? pieColors[index % pieColors.length],
  }));

  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <h1 className="font-['GeekbleMalrangiche'] text-3xl tracking-tight">통계</h1>
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

      <div className="grid grid-cols-3 gap-3">
        <StatisticCard label="수입" value={formatCurrency(summary.income)} accent="text-mint" />
        <StatisticCard label="지출" value={formatCurrency(summary.expense)} accent="text-coral" />
        <StatisticCard
          label="순저축"
          value={formatCurrency(summary.saving)}
          accent={summary.saving >= 0 ? "text-ink" : "text-coral"}
        />
      </div>

      <article className="rounded-[28px] bg-white/85 p-5 shadow-card">
        <div>
          <p className="text-sm text-stone-500">수입과 지출 추이</p>
          <h2 className="mt-1 text-lg font-bold">기간별 흐름을 비교해보세요</h2>
        </div>

        <div className="mt-4 h-64 rounded-[24px] bg-[linear-gradient(180deg,_#fff7e8,_#f7dfcb)] p-3">
          {trendData.some((item) => item.income > 0 || item.expense > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ead3c2" />
                <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "#7c6a5d" }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7c6a5d", fontSize: 12 }}
                  tickFormatter={formatCompactCurrency}
                />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.25)" }}
                  formatter={(value, name) => {
                    const amount = typeof value === "number" ? value : Number(value ?? 0);
                    return [formatCurrency(amount), name === "income" ? "수입" : "지출"];
                  }}
                />
                <Legend
                  verticalAlign="top"
                  height={24}
                  formatter={(value) => (value === "income" ? "수입" : "지출")}
                />
                <Line
                  type="linear"
                  dataKey="income"
                  name="income"
                  stroke="#8dc9b5"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#8dc9b5" }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  type="linear"
                  dataKey="expense"
                  name="expense"
                  stroke="#ef8a62"
                  strokeWidth={3}
                  dot={{ r: 3, fill: "#ef8a62" }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="아직 통계를 그릴 기록이 없어요. 수입이나 지출을 추가하면 여기서 흐름을 볼 수 있어요." />
          )}
        </div>
      </article>

      <article className="rounded-[28px] bg-white/85 p-5 shadow-card">
        <div>
          <p className="text-sm text-stone-500">카테고리별 지출 분석</p>
          <h2 className="mt-1 text-lg font-bold">어디에 가장 많이 쓰는지 확인해보세요</h2>
        </div>

        {categoryChartData.length > 0 ? (
          <>
            <div className="mt-4 h-64 rounded-[24px] bg-[#fffaf3] p-3">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip
                    formatter={(value) => {
                      const amount = typeof value === "number" ? value : Number(value ?? 0);
                      return [formatCurrency(amount), "지출"];
                    }}
                  />
                  <Pie
                    data={categoryChartData}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={56}
                    outerRadius={84}
                    paddingAngle={2}
                  >
                    {categoryChartData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-4 space-y-3">
              {categoryChartData.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl bg-[#fffaf3] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-sm font-semibold text-stone-800">{item.name}</p>
                      <p className="text-xs text-stone-500">{Math.round(item.ratio * 100)}%</p>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-stone-700">{formatCurrency(item.amount)}</p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="mt-4 rounded-2xl bg-sand/70 px-4 py-5 text-sm text-stone-600">
            이 기간에는 지출 기록이 없어요. 지출을 추가하면 카테고리 비중을 바로 확인할 수 있어요.
          </div>
        )}
      </article>
    </section>
  );
}

type StatisticCardProps = {
  label: string;
  value: string;
  accent: string;
};

function StatisticCard({ label, value, accent }: StatisticCardProps) {
  return (
    <article className="rounded-[24px] bg-white/80 p-4 shadow-card backdrop-blur">
      <p className="text-sm text-stone-500">{label}</p>
      <p
        className={[
          "mt-3 whitespace-nowrap text-sm font-bold leading-none sm:text-base",
          accent,
        ].join(" ")}
      >
        <AmountText value={value} />
      </p>
    </article>
  );
}

type AmountTextProps = {
  value: string;
};

function AmountText({ value }: AmountTextProps) {
  const suffix = value.endsWith("원") ? "원" : "";
  const amount = suffix ? value.slice(0, -1) : value;

  return (
    <>
      {amount}
      {suffix ? <span className="ml-0.5 text-[0.82em] font-semibold">{suffix}</span> : null}
    </>
  );
}

type EmptyStateProps = {
  text: string;
};

function EmptyState({ text }: EmptyStateProps) {
  return (
    <div className="flex h-full items-center justify-center rounded-[18px] bg-white/55 px-5 text-center text-sm text-stone-600">
      {text}
    </div>
  );
}
