import { lazy, Suspense } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";
import { App } from "./App";
import { HomePage } from "../pages/HomePage";
import { RecordsPage } from "../pages/RecordsPage";
import { SettingsPage } from "../pages/SettingsPage";
import { ROUTES } from "../constants/routes";

const StatisticsPage = lazy(async () => {
  const module = await import("../pages/StatisticsPage");
  return { default: module.StatisticsPage };
});

export const router = createBrowserRouter([
  {
    path: ROUTES.home,
    element: <App />,
    children: [
      {
        index: true,
        element: <Navigate to={ROUTES.dashboard} replace />,
      },
      {
        path: ROUTES.dashboard,
        element: <HomePage />,
      },
      {
        path: ROUTES.records,
        element: <RecordsPage />,
      },
      {
        path: ROUTES.statistics,
        element: (
          <Suspense fallback={<StatisticsLoadingFallback />}>
            <StatisticsPage />
          </Suspense>
        ),
      },
      {
        path: ROUTES.settings,
        element: <SettingsPage />,
      },
    ],
  },
]);

function StatisticsLoadingFallback() {
  return (
    <section className="space-y-5 animate-pulse">
      <header className="space-y-2">
        <div className="h-9 w-24 rounded-full bg-white/70" />
      </header>

      <div className="grid grid-cols-4 gap-2">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-10 rounded-full bg-white/70" />
        ))}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div key={index} className="rounded-[24px] bg-white/75 p-4 shadow-card backdrop-blur">
            <div className="h-4 w-12 rounded-full bg-stone-200/80" />
            <div className="mt-4 h-6 w-20 rounded-full bg-stone-200/80" />
          </div>
        ))}
      </div>

      <article className="rounded-[28px] bg-white/80 p-5 shadow-card backdrop-blur">
        <div className="h-4 w-24 rounded-full bg-stone-200/80" />
        <div className="mt-3 h-6 w-56 rounded-full bg-stone-200/80" />
        <div className="mt-4 flex gap-2">
          <div className="h-8 w-16 rounded-full bg-stone-200/70" />
          <div className="h-8 w-16 rounded-full bg-stone-200/70" />
        </div>
        <div className="mt-4 h-72 rounded-[24px] bg-[#fffaf3] p-4 ring-1 ring-stone-100">
          <div className="relative h-full overflow-hidden rounded-[18px] bg-white/55">
            <div className="absolute inset-x-0 top-[20%] border-t border-dashed border-stone-200/80" />
            <div className="absolute inset-x-0 top-[45%] border-t border-dashed border-stone-200/80" />
            <div className="absolute inset-x-0 top-[70%] border-t border-dashed border-stone-200/80" />

            <svg
              viewBox="0 0 320 180"
              className="absolute inset-0 h-full w-full"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polyline
                points="12,124 68,108 124,118 180,84 236,96 308,58"
                fill="none"
                stroke="rgba(141,201,181,0.5)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <polyline
                points="12,138 68,128 124,94 180,110 236,72 308,98"
                fill="none"
                stroke="rgba(239,138,98,0.45)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {[
                "12,124",
                "68,108",
                "124,118",
                "180,84",
                "236,96",
                "308,58",
              ].map((point) => {
                const [cx, cy] = point.split(",");
                return (
                  <circle
                    key={`income-${point}`}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="rgba(141,201,181,0.75)"
                  />
                );
              })}
              {[
                "12,138",
                "68,128",
                "124,94",
                "180,110",
                "236,72",
                "308,98",
              ].map((point) => {
                const [cx, cy] = point.split(",");
                return (
                  <circle
                    key={`expense-${point}`}
                    cx={cx}
                    cy={cy}
                    r="4"
                    fill="rgba(239,138,98,0.7)"
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </article>

      <article className="rounded-[28px] bg-white/80 p-5 shadow-card backdrop-blur">
        <div className="h-4 w-28 rounded-full bg-stone-200/80" />
        <div className="mt-3 h-6 w-64 rounded-full bg-stone-200/80" />
        <div className="mt-4 rounded-[24px] bg-[#fffaf3] p-4 ring-1 ring-stone-100">
          <div className="mx-auto h-56 w-56 rounded-full border-[18px] border-stone-200/70 border-t-coral/30 border-r-mint/35" />
          <div className="mt-4 space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-stone-100"
              >
                <div className="flex items-center gap-3">
                  <div className="h-3 w-3 rounded-full bg-stone-200/80" />
                  <div>
                    <div className="h-4 w-20 rounded-full bg-stone-200/80" />
                    <div className="mt-2 h-3 w-12 rounded-full bg-stone-200/60" />
                  </div>
                </div>
                <div className="h-4 w-16 rounded-full bg-stone-200/80" />
              </div>
            ))}
          </div>
        </div>
      </article>
    </section>
  );
}
