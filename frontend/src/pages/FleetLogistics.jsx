import { cn } from "../utils/cn";
import { Truck } from "lucide-react";

export function FleetLogistics() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface">Fleet Logistics</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Vehicle tracking, route optimization, and dispatch management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm">
            <span className="material-symbols-outlined text-[18px]">route</span>
            Optimize All
          </button>
          <button className="btn-primary btn-sm">
            <span className="material-symbols-outlined text-[18px]">local_shipping</span>
            Dispatch
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Active Vehicles</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Truck className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Total Capacity</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-secondary">scale</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Routes Optimized</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-tertiary">navigation</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Fuel Saved Today</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success-light flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-success">eco</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="section-title">Fleet Overview</h2>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-secondary-fixed/50 text-secondary font-label-sm text-label-sm font-bold">
            <span className="material-symbols-outlined text-[16px]">electric_bolt</span> ZERO-EMISSION LOGISTICS
          </span>
        </div>
        <div className="card-body">
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-outline-variant">local_shipping</span>
            <p className="font-body-md text-on-surface-variant mt-4">Fleet Management Dashboard</p>
            <p className="font-body-sm text-on-surface-variant mt-2">
              Real-time vehicle tracking, AI route optimization, and dynamic dispatch
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
                <span className="material-symbols-outlined text-[14px]">sync</span>
                Syncing Fleet Data...
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}