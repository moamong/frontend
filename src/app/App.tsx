import { Outlet } from "react-router-dom";
import { BottomNavigation } from "../components/common/BottomNavigation";
import { FloatingRecordButton } from "../components/common/FloatingRecordButton";

export function App() {
  return (
    <div className="min-h-[100dvh] overflow-hidden bg-[radial-gradient(circle_at_top,_#fff5de,_#f8d9c0_42%,_#f4c7a1)] text-ink">
      <div className="mx-auto flex min-h-[100dvh] max-w-[1200px] items-center justify-center px-0 lg:px-10">
        <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-[#fffaf3] shadow-none lg:h-[min(920px,92vh)] lg:max-w-[430px] lg:rounded-[36px] lg:border lg:border-white/80 lg:shadow-[0_30px_90px_rgba(79,55,36,0.22)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,_rgba(255,255,255,0.75),_transparent)]" />
          <main
            className="app-scroll relative flex-1 overflow-y-auto px-5 pt-6"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 8.5rem)" }}
          >
            <Outlet />
          </main>
          <BottomNavigation />
          <FloatingRecordButton />
        </div>
      </div>
    </div>
  );
}
