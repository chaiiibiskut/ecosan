import { NavLink, useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import {
  LayoutDashboard,
  Cpu,
  Truck,
  Droplet,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import logo from "../../assets/logo.svg";

const navigation = [
  { name: "Live Operations", href: "/", icon: LayoutDashboard },
  { name: "AI Segregation Hub", href: "/ai-hub", icon: Cpu },
  { name: "Fleet Logistics", href: "/fleet", icon: Truck },
  { name: "Sanitization Index", href: "/sanitization", icon: Droplet },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function Sidebar({ isCollapsed, onToggle }) {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen bg-surface-container-lowest border-r border-outline-variant/50 transition-all duration-300 ease-in-out flex flex-col",
        isCollapsed ? "w-16" : "w-64"
      )}
      aria-label="Main navigation"
    >
      <div className="flex h-16 items-center justify-between px-4 border-b border-outline-variant/50">
        {!isCollapsed && (
          <NavLink to="/" className="flex items-center gap-3" aria-label="EcoSan Intelligence Home">
            <img src={logo} alt="" className="w-10 h-10" />
            <span className="font-headline-sm text-on-surface font-extrabold">EcoSan</span>
          </NavLink>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors",
            isCollapsed && "ml-auto"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          ) : (
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1" role="navigation" aria-label="Main">
        <ul className="space-y-1" role="list">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 px-3.5 py-2.5 rounded-lg font-label-sm text-label-sm transition-colors duration-150",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                    )
                  }
                  title={isCollapsed ? item.name : undefined}
                  aria-current={isActive ? "page" : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className={cn("p-3 border-t border-outline-variant/50", isCollapsed && "hidden")}>
        <NavLink to="/settings" className="sidebar-link">
          <span className="material-symbols-outlined text-[20px]">settings</span>
          <span>Settings</span>
        </NavLink>
      </div>
    </aside>
  );
}