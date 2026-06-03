import type { LucideIcon } from "lucide-react";
import { ChartColumn, House, ReceiptText, Settings } from "lucide-react";
import { NavLink } from "react-router-dom";
import { ROUTES } from "../../constants/routes";

const navItems = [
  { to: ROUTES.dashboard, label: "홈", icon: House },
  { to: ROUTES.records, label: "기록", icon: ReceiptText },
  { to: ROUTES.statistics, label: "통계", icon: ChartColumn },
  { to: ROUTES.settings, label: "설정", icon: Settings },
];

export function BottomNavigation() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-20 border-t border-stone-200/80 bg-white/90 backdrop-blur-xl lg:absolute"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto grid max-w-[430px] grid-cols-4 px-5 py-3">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                "flex flex-col items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold transition",
                isActive
                  ? "bg-coral text-white shadow-card"
                  : "text-stone-500 hover:bg-stone-100/80",
              ].join(" ")
            }
          >
            <NavIcon icon={item.icon} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}

type NavIconProps = {
  icon: LucideIcon;
};

function NavIcon({ icon: Icon }: NavIconProps) {
  return <Icon size={18} strokeWidth={2.2} aria-hidden="true" />;
}
