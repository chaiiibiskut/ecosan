import { cn } from "../utils/cn";
import { Droplet } from "lucide-react";

export function SanitizationIndex() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface">Sanitization Index</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            UV-C microbial irradiation, mist dispersion, and biosecurity monitoring
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm">
            <span className="material-symbols-outlined text-[18px]">water_drop</span>
            Trigger Mist
          </button>
          <button className="btn-primary btn-sm">
            <span className="material-symbols-outlined text-[18px]">wb_iridescent</span>
            UV-C Cycle
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Avg Sanitization Index</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">UV-C Kill Rate</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-tertiary">wb_iridescent</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Mist Coverage</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-secondary">air</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Supply Buffer</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-down">↓ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-warning-light flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-warning">water_drop</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="section-title">Sanitization System</h2>
          <span className="font-label-sm text-label-sm text-primary font-bold">AUTO-PILOT</span>
        </div>
        <div className="card-body">
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-outline-variant">sanitizer</span>
            <p className="font-body-md text-on-surface-variant mt-4">Sanitization Control Center</p>
            <p className="font-body-sm text-on-surface-variant mt-2">
              Autonomous germicidal & mist dispersion network monitoring
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="p-4 rounded-lg bg-surface-container-low">
                <span className="material-symbols-outlined text-[24px] text-primary">air</span>
                <p className="font-label-sm text-on-surface mt-2 block">Odor & Ammonia</p>
                <p className="font-headline-sm font-bold text-primary tabular-nums">—</p>
              </div>
              <div className="p-4 rounded-lg bg-surface-container-low">
                <span className="material-symbols-outlined text-[24px] text-tertiary">wb_iridescent</span>
                <p className="font-label-sm text-on-surface mt-2 block">UV-C Kill Rate</p>
                <p className="font-headline-sm font-bold text-tertiary tabular-nums">—</p>
              </div>
              <div className="p-4 rounded-lg bg-surface-container-low">
                <span className="material-symbols-outlined text-[24px] text-secondary">wash</span>
                <p className="font-label-sm text-on-surface mt-2 block">Lid Disinfection</p>
                <p className="font-headline-sm font-bold text-secondary tabular-nums">—</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}