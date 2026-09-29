import { cn } from "../utils/cn";
import { BarChart3 } from "lucide-react";

export function Analytics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface">Analytics</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Waste trends, segregation accuracy, landfill diversion, and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm">
            <span className="material-symbols-outlined text-[18px]">date_range</span>
            Last 30 Days
          </button>
          <button className="btn-primary btn-sm">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Total Waste Collected</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Segregation Accuracy</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success-light flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-success">psychology</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Landfill Diversion</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-secondary">recycling</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Avg Response Time</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-tertiary">timer</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="section-title">Waste Collection Trends</h2>
        </div>
        <div className="card-body">
          <div className="aspect-[2/1] rounded-lg bg-surface-container-low flex items-center justify-center">
            <div className="text-center">
              <span className="material-symbols-outlined text-[48px] text-outline-variant">show_chart</span>
              <p className="font-body-md text-on-surface-variant mt-4">Analytics Dashboard</p>
              <p className="font-body-sm text-on-surface-variant mt-2">
                Connect to backend API to display waste trends, segregation accuracy, diversion rates, and performance metrics
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[14px]">analytics</span>
                  Loading Charts...
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}