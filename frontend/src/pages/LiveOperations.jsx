import { cn } from "../utils/cn";
import { Trash2 } from "lucide-react";

export function LiveOperations() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface">Live Operations</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Real-time smart bin monitoring, fleet tracking, and alert management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm">
            <span className="material-symbols-outlined text-[18px]">filter_list</span>
            Filters
          </button>
          <button className="btn-primary btn-sm">
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Total Bins</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Avg Fill Level</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-secondary">percent</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Active Alerts</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-down">↓ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-warning-light flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-warning">warning</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Collection Efficiency</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success-light flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-success">check_circle</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="section-title">Smart Bin Network</h2>
        </div>
        <div className="card-body">
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-outline-variant">sensor_door</span>
            <p className="font-body-md text-on-surface-variant mt-4">Live Operations Dashboard</p>
            <p className="font-body-sm text-on-surface-variant mt-2">
              Connect to backend API to display real-time bin telemetry, fill levels, and fleet status
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                Awaiting API Connection
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}