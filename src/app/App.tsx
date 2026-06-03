import { Outlet } from "react-router-dom";
import { BottomNavigation } from "../components/common/BottomNavigation";
import { FloatingRecordButton } from "../components/common/FloatingRecordButton";

export function App() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5de,_#f8d9c0_50%,_#f4c7a1)] text-ink">
      <div className="mx-auto flex min-h-screen w-full max-w-[430px] flex-col px-5 pb-28 pt-6">
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
      <BottomNavigation />
      <FloatingRecordButton />
    </div>
  );
}
