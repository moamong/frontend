import type { MoneyRecord } from "../types/record";

export type StatisticsPeriod = "daily" | "weekly" | "monthly" | "yearly";

export type TrendPoint = {
  key: string;
  label: string;
  income: number;
  expense: number;
  saving: number;
};

export type CategoryBreakdownItem = {
  categoryId: string;
  amount: number;
  ratio: number;
};

export type StatisticsSummary = {
  income: number;
  expense: number;
  saving: number;
};

type PeriodRange = {
  start: Date;
  end: Date;
};

type TrendBucket = PeriodRange & {
  key: string;
  label: string;
};

const dayInMs = 24 * 60 * 60 * 1000;

export function getStatisticsSummary(
  records: MoneyRecord[],
  period: StatisticsPeriod,
  now = new Date(),
): StatisticsSummary {
  const range = getCurrentRange(period, now);
  const filteredRecords = filterRecordsByRange(records, range);
  const income = sumRecordsByType(filteredRecords, "income");
  const expense = sumRecordsByType(filteredRecords, "expense");

  return {
    income,
    expense,
    saving: income - expense,
  };
}

export function getTrendData(
  records: MoneyRecord[],
  period: StatisticsPeriod,
  now = new Date(),
): TrendPoint[] {
  const buckets = createTrendBuckets(period, now);

  return buckets.map((bucket) => {
    const bucketRecords = filterRecordsByRange(records, bucket);
    const income = sumRecordsByType(bucketRecords, "income");
    const expense = sumRecordsByType(bucketRecords, "expense");

    return {
      key: bucket.key,
      label: bucket.label,
      income,
      expense,
      saving: income - expense,
    };
  });
}

export function getCategoryBreakdown(
  records: MoneyRecord[],
  period: StatisticsPeriod,
  now = new Date(),
): CategoryBreakdownItem[] {
  const range = getCurrentRange(period, now);
  const expenses = filterRecordsByRange(records, range).filter(
    (record) => record.type === "expense",
  );
  const totalExpense = expenses.reduce((sum, record) => sum + record.amount, 0);

  if (totalExpense === 0) {
    return [];
  }

  const byCategory = new Map<string, number>();

  for (const record of expenses) {
    byCategory.set(record.categoryId, (byCategory.get(record.categoryId) ?? 0) + record.amount);
  }

  return [...byCategory.entries()]
    .map(([categoryId, amount]) => ({
      categoryId,
      amount,
      ratio: amount / totalExpense,
    }))
    .sort((left, right) => right.amount - left.amount);
}

function createTrendBuckets(period: StatisticsPeriod, now: Date): TrendBucket[] {
  switch (period) {
    case "daily":
      return Array.from({ length: 7 }, (_, index) => {
        const offset = 6 - index;
        const date = startOfDay(addDays(now, -offset));
        const end = endOfDay(date);

        return {
          key: date.toISOString(),
          label: `${date.getMonth() + 1}/${date.getDate()}`,
          start: date,
          end,
        };
      });
    case "weekly":
      return Array.from({ length: 8 }, (_, index) => {
        const offset = 7 - index;
        const start = startOfWeek(addDays(now, -offset * 7));
        const end = endOfWeek(start);

        return {
          key: start.toISOString(),
          label: `${start.getMonth() + 1}/${start.getDate()}`,
          start,
          end,
        };
      });
    case "monthly":
      return Array.from({ length: 6 }, (_, index) => {
        const offset = 5 - index;
        const start = startOfMonth(addMonths(now, -offset));
        const end = endOfMonth(start);

        return {
          key: start.toISOString(),
          label: `${start.getMonth() + 1}월`,
          start,
          end,
        };
      });
    case "yearly":
      return Array.from({ length: 5 }, (_, index) => {
        const offset = 4 - index;
        const start = startOfYear(new Date(now.getFullYear() - offset, 0, 1));
        const end = endOfYear(start);

        return {
          key: start.toISOString(),
          label: `${start.getFullYear()}`,
          start,
          end,
        };
      });
  }
}

function getCurrentRange(period: StatisticsPeriod, now: Date): PeriodRange {
  switch (period) {
    case "daily":
      return {
        start: startOfDay(now),
        end: endOfDay(now),
      };
    case "weekly": {
      const start = startOfWeek(now);
      return {
        start,
        end: endOfWeek(start),
      };
    }
    case "monthly": {
      const start = startOfMonth(now);
      return {
        start,
        end: endOfMonth(start),
      };
    }
    case "yearly": {
      const start = startOfYear(now);
      return {
        start,
        end: endOfYear(start),
      };
    }
  }
}

function filterRecordsByRange(records: MoneyRecord[], range: PeriodRange) {
  const startTime = range.start.getTime();
  const endTime = range.end.getTime();

  return records.filter((record) => {
    const recordTime = new Date(record.date).getTime();
    return recordTime >= startTime && recordTime <= endTime;
  });
}

function sumRecordsByType(records: MoneyRecord[], type: MoneyRecord["type"]) {
  return records
    .filter((record) => record.type === type)
    .reduce((sum, record) => sum + record.amount, 0);
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
}

function endOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
}

function startOfWeek(date: Date) {
  const current = startOfDay(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(current, diff);
}

function endOfWeek(date: Date) {
  return endOfDay(addDays(startOfWeek(date), 6));
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999);
}

function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1, 0, 0, 0, 0);
}

function endOfYear(date: Date) {
  return new Date(date.getFullYear(), 11, 31, 23, 59, 59, 999);
}

export function formatCompactCurrency(amount: number) {
  if (Math.abs(amount) >= 10_000) {
    return `${new Intl.NumberFormat("ko-KR", {
      maximumFractionDigits: 1,
    }).format(amount / 10_000)}만`;
  }

  return new Intl.NumberFormat("ko-KR", {
    maximumFractionDigits: 0,
  }).format(amount);
}
