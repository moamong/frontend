import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getCategoryDisplayName,
  getMergedCategories,
  useCategoryStore,
} from "../stores/categoryStore";
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

  const categoryState = useMemo(
    () => ({ customCategories, hiddenDefaultCategoryIds }),
    [customCategories, hiddenDefaultCategoryIds],
  );
  const categoryById = useMemo(
    () =>
      Object.fromEntries(
        getMergedCategories(categoryState).map((category) => [category.id, category]),
      ),
    [categoryState],
  );

  const summary = useMemo(() => getStatisticsSummary(records, period), [period, records]);
  const trendData = useMemo(() => getTrendData(records, period), [period, records]);
  const categoryBreakdown = useMemo(() => getCategoryBreakdown(records, period), [period, records]);

  const categoryChartData = categoryBreakdown.map((item, index) => ({
    name: getCategoryDisplayName(categoryState, item.categoryId),
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

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <StatisticCard label="수입" value={formatCurrency(summary.income)} accent="text-mint" />
        <StatisticCard label="지출" value={formatCurrency(summary.expense)} accent="text-coral" />
        <StatisticCard
          label="순저축"
          value={formatCurrency(summary.saving)}
          accent={summary.saving >= 0 ? "text-ink" : "text-coral"}
        />
      </div>

      <article className="rounded-[28px] bg-white/85 p-5 shadow-card backdrop-blur">
        <div>
          <p className="text-sm text-stone-500">수입과 지출 추이</p>
          <h2 className="mt-1 text-lg font-bold">기간별 흐름을 더 깔끔하게 비교해보세요</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            <LegendChip
              label="수입"
              color="#8dc9b5"
              tone="bg-[rgba(141,201,181,0.22)] text-[#2f7c67]"
            />
            <LegendChip
              label="지출"
              color="#ef8a62"
              tone="bg-[rgba(239,138,98,0.22)] text-coral"
            />
          </div>
        </div>

        <div className="mt-4 h-72 rounded-[24px] bg-[#fffaf3] p-4 ring-1 ring-stone-100">
          {trendData.some((item) => item.income > 0 || item.expense > 0) ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 12, right: 8, left: -18, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eadfd3" />
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7c6a5d", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#7c6a5d", fontSize: 12 }}
                  tickFormatter={formatCompactCurrency}
                />
                <Tooltip
                  cursor={{ stroke: "#dccbbb", strokeWidth: 1 }}
                  content={<TrendTooltip />}
                />
                <Line
                  type="linear"
                  dataKey="income"
                  name="수입"
                  stroke="#8dc9b5"
                  strokeWidth={3}
                  dot={{ r: 0 }}
                  activeDot={{ r: 5, fill: "#8dc9b5", stroke: "#fffaf3", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
                <Line
                  type="linear"
                  dataKey="expense"
                  name="지출"
                  stroke="#ef8a62"
                  strokeWidth={3}
                  dot={{ r: 0 }}
                  activeDot={{ r: 5, fill: "#ef8a62", stroke: "#fffaf3", strokeWidth: 2 }}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState text="아직 통계를 그릴 기록이 없어요. 수입이나 지출을 추가하면 여기에서 흐름을 볼 수 있어요." />
          )}
        </div>
      </article>

      <article className="rounded-[28px] bg-white/85 p-5 shadow-card backdrop-blur">
        <div>
          <p className="text-sm text-stone-500">카테고리별 지출 분석</p>
          <h2 className="mt-1 text-lg font-bold">어디에 가장 많이 쓰는지 한 번에 확인해보세요</h2>
        </div>

        {categoryChartData.length > 0 ? (
          <div className="mt-4 rounded-[24px] bg-[#fffaf3] p-4 ring-1 ring-stone-100">
            <div className="relative mx-auto h-56 w-full max-w-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Tooltip content={<CategoryTooltip />} />
                  <Pie
                    data={categoryChartData}
                    dataKey="amount"
                    nameKey="name"
                    innerRadius={56}
                    outerRadius={84}
                    paddingAngle={3}
                    cornerRadius={6}
                    isAnimationActive={false}
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
                  className="flex w-full items-center justify-between gap-3 rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-100"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ backgroundColor: item.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-800">{item.name}</p>
                      <p className="text-xs text-stone-500">
                        전체의 {Math.round(item.ratio * 100)}%
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-stone-700">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl bg-sand/70 px-4 py-5 text-sm text-stone-600">
            이 기간에는 지출 기록이 없어요. 지출을 추가하면 카테고리 비중을 바로 확인할 수
            있어요.
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
      <p className="whitespace-nowrap text-xs text-stone-500 sm:text-sm">{label}</p>
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

type LegendChipProps = {
  label: string;
  color: string;
  tone: string;
};

function LegendChip({ label, color, tone }: LegendChipProps) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold whitespace-nowrap",
        tone,
      ].join(" ")}
    >
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      <span className="whitespace-nowrap">{label}</span>
    </div>
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

type TooltipEntry = {
  name?: string;
  value?: number | string;
  color?: string;
  payload?: {
    name?: string;
    amount?: number;
  };
};

type RechartsTooltipProps = {
  active?: boolean;
  label?: string;
  payload?: TooltipEntry[];
};

function TrendTooltip({ active, label, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white/95 px-4 py-3 shadow-[0_10px_30px_rgba(46,39,34,0.14)] ring-1 ring-stone-100">
      <p className="text-xs font-semibold text-stone-500">{label}</p>
      <div className="mt-2 space-y-2">
        {payload.map((entry) => {
          const amount = typeof entry.value === "number" ? entry.value : Number(entry.value ?? 0);
          return (
            <div key={entry.name} className="flex items-center justify-between gap-5">
              <div className="flex items-center gap-2 text-sm text-stone-700">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: entry.color }}
                  aria-hidden="true"
                />
                <span>{entry.name}</span>
              </div>
              <span className="text-sm font-semibold text-stone-900">
                {formatCurrency(amount)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryTooltip({ active, payload }: RechartsTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const entry = payload[0];
  const amount =
    typeof entry.value === "number" ? entry.value : Number(entry.value ?? entry.payload?.amount ?? 0);

  return (
    <div className="rounded-2xl bg-white/95 px-4 py-3 shadow-[0_10px_30px_rgba(46,39,34,0.14)] ring-1 ring-stone-100">
      <p className="text-sm font-semibold text-stone-800">{entry.name}</p>
      <p className="mt-1 text-sm text-stone-600">{formatCurrency(amount)}</p>
    </div>
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
