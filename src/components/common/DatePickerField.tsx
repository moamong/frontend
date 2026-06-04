import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState } from "react";
import { Modal } from "./Modal";

type DatePickerFieldProps = {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  description?: string;
};

const weekdayLabels = ["월", "화", "수", "목", "금", "토", "일"];

export function DatePickerField({
  value,
  onChange,
  title = "날짜 선택",
  description = "달력에서 날짜를 골라주세요.",
}: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => parseInputDate(value));

  const selectedDate = useMemo(() => parseInputDate(value), [value]);
  const calendarDays = useMemo(() => createCalendarDays(viewDate), [viewDate]);
  const monthLabel = useMemo(
    () =>
      new Intl.DateTimeFormat("ko-KR", {
        year: "numeric",
        month: "long",
      }).format(viewDate),
    [viewDate],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setViewDate(parseInputDate(value));
          setIsOpen(true);
        }}
        className="picker-shell w-full text-left"
      >
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-white px-4 py-4 ring-1 ring-stone-200">
          <div>
            <p className="text-xs font-medium text-stone-400">날짜</p>
            <p className="mt-1 text-sm font-semibold text-stone-800">{formatLongDate(value)}</p>
          </div>
          <div className="rounded-full bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
            변경
          </div>
        </div>
      </button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={title}
        description={description}
        align="center"
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-4 ring-1 ring-stone-100">
            <button
              type="button"
              onClick={() => setViewDate(addMonths(viewDate, -1))}
              className="rounded-full p-2 text-stone-500 transition hover:bg-stone-50 hover:text-stone-800"
              aria-label="이전 달"
            >
              <ChevronLeft size={18} aria-hidden="true" />
            </button>
            <p className="text-lg font-semibold text-stone-800">{monthLabel}</p>
            <button
              type="button"
              onClick={() => setViewDate(addMonths(viewDate, 1))}
              className="rounded-full p-2 text-stone-500 transition hover:bg-stone-50 hover:text-stone-800"
              aria-label="다음 달"
            >
              <ChevronRight size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="rounded-[28px] bg-[#fffaf3] p-4 ring-1 ring-stone-100">
            <div className="grid grid-cols-7 gap-2 text-center">
              {weekdayLabels.map((label) => (
                <div key={label} className="py-2 text-xs font-semibold text-stone-400">
                  {label}
                </div>
              ))}

              {calendarDays.map((day) => {
                const isSelected = isSameDate(day.date, selectedDate);
                const isCurrentMonth = day.isCurrentMonth;

                return (
                  <button
                    key={day.key}
                    type="button"
                    onClick={() => {
                      onChange(toInputDate(day.date));
                      setIsOpen(false);
                    }}
                    className={[
                      "aspect-square rounded-2xl text-sm font-semibold transition",
                      isSelected
                        ? "bg-coral text-white"
                        : isCurrentMonth
                          ? "bg-white text-stone-700 ring-1 ring-stone-100 hover:bg-stone-50"
                          : "bg-transparent text-stone-300",
                    ].join(" ")}
                  >
                    {day.date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              const today = new Date();
              onChange(toInputDate(today));
              setViewDate(today);
              setIsOpen(false);
            }}
            className="w-full rounded-2xl bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            오늘 선택
          </button>
        </div>
      </Modal>
    </>
  );
}

type CalendarDay = {
  key: string;
  date: Date;
  isCurrentMonth: boolean;
};

function createCalendarDays(viewDate: Date): CalendarDay[] {
  const start = startOfWeek(startOfMonth(viewDate));
  const days: CalendarDay[] = [];

  for (let index = 0; index < 42; index += 1) {
    const date = addDays(start, index);
    days.push({
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date,
      isCurrentMonth: date.getMonth() === viewDate.getMonth(),
    });
  }

  return days;
}

function parseInputDate(value: string) {
  if (!value) {
    return new Date();
  }

  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, (month || 1) - 1, day || 1);
}

function toInputDate(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatLongDate(value: string) {
  const date = parseInputDate(value);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfWeek(date: Date) {
  const day = date.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  return addDays(date, diff);
}

function addDays(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}
