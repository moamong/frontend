import { defaultExpenseCategories, defaultIncomeCategories } from "../constants/categories";

export function SettingsPage() {
  return (
    <section className="space-y-5">
      <header className="space-y-2">
        <p className="text-sm font-medium text-stone-600">기본값 관리</p>
        <h1 className="text-3xl font-bold tracking-tight">설정</h1>
      </header>

      <SettingsBlock
        title="지출 카테고리"
        items={defaultExpenseCategories.map((category) => category.name)}
      />
      <SettingsBlock
        title="수입 카테고리"
        items={defaultIncomeCategories.map((category) => category.name)}
      />

      <article className="rounded-[28px] bg-white/85 p-5 shadow-card">
        <p className="text-sm text-stone-500">이번 달 목표 금액</p>
        <p className="mt-3 text-2xl font-bold">0원</p>
      </article>
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
