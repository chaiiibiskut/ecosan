import React from 'react';
import { useLocation } from "react-router-dom";
import { cn } from "../../utils/cn";
import { Bell, ChevronDown, Sun, Moon } from "lucide-react";

const pageTitles = {
  "/": { title: "Live Operations", description: "Monitor bin fill levels, alerts, and real-time status" },
  "/ai-hub": { title: "AI Segregation Hub", description: "Waste classification and conveyor vision system" },
  "/fleet": { title: "Fleet Logistics", description: "Vehicle tracking, route optimization, and dispatch" },
  "/sanitization": { title: "Sanitization Index", description: "Site scores, UV-C cycles, and supply tracking" },
  "/analytics": { title: "Analytics", description: "Trends, KPIs, and performance dashboards" },
};

const alerts = [
  { id: 1, type: "danger", message: "Bin #B-247 overflow: 98% fill level", time: "2 min ago" },
  { id: 2, type: "warning", message: "Vehicle V-03 battery low: 15%", time: "15 min ago" },
  { id: 3, type: "info", message: "Sanitization Site S-12 cycle completed", time: "1 hour ago" },
  { id: 4, type: "success", message: "Route optimization saved 12.3 km", time: "3 hours ago" },
];

const alertColors = {
  danger: { bg: "bg-[var(--color-error-light)]", border: "border-l-4 border-[var(--color-error)]", dot: "bg-[var(--color-error)]" },
  warning: { bg: "bg-[var(--color-warning-light)]", border: "border-l-4 border-[var(--color-warning)]", dot: "bg-[var(--color-warning)]" },
  info: { bg: "bg-[var(--color-info-light)]", border: "border-l-4 border-[var(--color-info)]", dot: "bg-[var(--color-info)]" },
  success: { bg: "bg-[var(--color-success-light)]", border: "border-l-4 border-[var(--color-success)]", dot: "bg-[var(--color-success)]" },
};

export function TopBar({ onMenuClick, sidebarCollapsed, isMobile }) {
  const location = useLocation();
  const pageInfo = pageTitles[location.pathname] || { title: "Dashboard", description: "" };
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [showUserMenu, setShowUserMenu] = React.useState(false);
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const unreadCount = alerts.filter((a) => a.type === "danger" || a.type === "warning").length;

  return (
    <header
      className={cn(
        "fixed top-0 right-0 z-30 h-16 bg-surface-container-lowest border-b border-outline-variant/50 flex items-center px-4 transition-all duration-300",
        isMobile ? "left-0" : sidebarCollapsed ? "left-16" : "left-64"
      )}
      role="banner"
    >
      <div className="flex items-center justify-between w-full max-w-screen-2xl mx-auto gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={onMenuClick}
            className="md:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
            aria-label="Open menu"
            aria-expanded="false"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>

          <div className="hidden md:block min-w-0">
            <h1 className="page-title truncate">{pageInfo.title}</h1>
            <p className="page-subtitle truncate">{pageInfo.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[14px] text-primary animate-ping">sync</span>
            Sync Active · Just now
          </div>

          <button
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
            aria-expanded={showNotifications}
          >
            <span className="material-symbols-outlined text-[24px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-on-error text-xs font-medium rounded-full flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-full max-w-sm sm:right-4 sm:max-w-xs md:max-w-[320px] bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-[var(--shadow-level3)] animate-fade-in z-50">
              <div className="p-3 border-b border-outline-variant/50 flex items-center justify-between">
                <h3 className="font-label-md text-on-surface">Notifications</h3>
                <button className="font-body-sm text-primary hover:underline" onClick={() => setShowNotifications(false)}>Mark all read</button>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {alerts.map((alert) => {
                  const colors = alertColors[alert.type];
                  return (
                    <button
                      key={alert.id}
                      className={cn(
                        "w-full p-3 hover:bg-surface-container-low/50 transition-colors text-left flex items-start gap-3 border-b border-outline-variant/30 last:border-0",
                        colors.bg,
                        colors.border
                      )}
                    >
                      <div className={cn("w-2 h-2 rounded-full mt-2 flex-shrink-0", colors.dot)} aria-hidden="true" />
                      <div className="flex-1 min-w-0">
                        <p className="font-body-sm text-on-surface">{alert.message}</p>
                        <p className="font-body-sm text-on-surface-variant mt-0.5">{alert.time}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="p-3 border-t border-outline-variant/50">
                <button className="w-full font-body-sm text-primary hover:underline">View all notifications</button>
              </div>
            </div>
          )}

          <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant/50">
            <span className="material-symbols-outlined text-[18px] text-success">check_circle</span>
            <span className="font-body-sm text-on-surface-variant">All systems operational</span>
          </div>

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors"
            aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5 text-warning" aria-hidden="true" />
            ) : (
              <Moon className="w-5 h-5 text-tertiary" aria-hidden="true" />
            )}
          </button>

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-container-low transition-colors"
              aria-label="User menu"
              aria-expanded={showUserMenu}
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-primary">person</span>
              </div>
              <span className="hidden md:block font-label-sm text-on-surface">Admin</span>
              <ChevronDown className="w-4 h-4 text-on-surface-variant hidden md:block" aria-hidden="true" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-full max-w-sm sm:w-48 bg-surface-container-lowest rounded-xl border border-outline-variant/50 shadow-[var(--shadow-level3)] animate-fade-in z-50 py-1">
                <div className="px-3 py-2 border-b border-outline-variant/50">
                  <p className="font-label-md text-on-surface">Administrator</p>
                  <p className="font-body-sm text-on-surface-variant">Municipal Corporation</p>
                </div>
                <button className="w-full px-3 py-2 text-left font-body-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">person</span>
                  Profile
                </button>
                <button className="w-full px-3 py-2 text-left font-body-sm text-on-surface hover:bg-surface-container-low flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">
                    {isDarkMode ? "light_mode" : "dark_mode"}
                  </span>
                  {isDarkMode ? "Light mode" : "Dark mode"}
                </button>
                <div className="border-t border-outline-variant/50 my-1" />
                <button className="w-full px-3 py-2 text-left font-body-sm text-error hover:bg-surface-container-low flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px]">logout</span>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}