import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { BottomBar } from "./BottomBar";
import { cn } from "../../utils/cn";

export function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  const effectiveCollapsed = isMobile ? !mobileMenuOpen : sidebarCollapsed;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={effectiveCollapsed}
        onToggle={toggleSidebar}
        isMobile={isMobile}
        isMobileOpen={mobileMenuOpen}
      />

      <TopBar
        onMenuClick={toggleSidebar}
        sidebarCollapsed={effectiveCollapsed}
        isMobile={isMobile}
      />

      <BottomBar />

      <main
        className={cn(
          "pt-16 pb-16 md:pb-0 min-h-screen transition-all duration-300",
          effectiveCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
        role="main"
        id="main-content"
      >
        <div className="p-4 lg:p-6 xl:p-8 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>

      {isMobile && mobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-on-background/40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </div>
  );
}