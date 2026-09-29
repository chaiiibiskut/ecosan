import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  LayoutDashboard,
  Cpu,
  Truck,
  Droplet,
  BarChart3,
} from "lucide-react";

const navigation = [
  { name: "Live Ops", href: "/", icon: LayoutDashboard },
  { name: "AI Hub", href: "/ai-hub", icon: Cpu },
  { name: "Fleet", href: "/fleet", icon: Truck },
  { name: "Sanitize", href: "/sanitization", icon: Droplet },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function BottomBar() {
  const location = useLocation();

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest border-t border-outline-variant/50 shadow-[var(--shadow-level3)]"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="grid grid-cols-5">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-3 px-2 transition-colors duration-150",
                isActive
                  ? "text-primary"
                  : "text-on-surface-variant active:text-on-surface"
              )}
              aria-current={isActive ? "page" : undefined}
              aria-label={item.name}
            >
              <item.icon className={cn("w-6 h-6", isActive && "text-primary")} aria-hidden="true" />
              <span className="font-label-sm text-label-sm">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}