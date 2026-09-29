import { cn } from "../utils/cn";
import { Cpu } from "lucide-react";

export function AISegregationHub() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface">AI Segregation Hub</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Computer vision waste classification, conveyor monitoring, and AI model management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="btn-secondary btn-sm">
            <span className="material-symbols-outlined text-[18px]">tune</span>
            Calibrate
          </button>
          <button className="btn-primary btn-sm">
            <span className="material-symbols-outlined text-[18px]">videocam</span>
            Start Stream
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Today's Classifications</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Overall Accuracy</p>
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
              <p className="kpi-label">Avg Confidence</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-up">↑ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-tertiary">analytics</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Hazardous Detected</p>
              <p className="kpi-value tabular-nums">—</p>
              <span className="kpi-trend-down">↓ Loading...</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-error-light flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-error">warning</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="section-title">Conveyor Vision</h2>
        </div>
        <div className="card-body">
          <div className="aspect-video rounded-xl bg-inverse-surface flex items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#6bd8cb_1px,transparent_1px)] [background-size:16px_16px]"></div>
            <div className="relative z-10 text-center">
              <span className="material-symbols-outlined text-[48px] text-inverse-on-surface/30">videocam</span>
              <p className="font-body-md text-inverse-on-surface/60 mt-4">Conveyor Camera Feed</p>
              <p className="font-body-sm text-inverse-on-surface/40 mt-2">CAM-04 Industrial RGB+NIR · 2560×1440 @ 120 FPS</p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
                  <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                  Belt Speed: 1.8 m/s
                </span>
                <span className="inline-flex items-center px-2 py-1 rounded bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-semibold">
                  Pneumatic Jets: ARMED
                </span>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 right-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              <div className="bg-inverse-surface/80 p-2 rounded backdrop-blur-md">
                <span className="text-inverse-on-surface/60 font-label-sm text-label-sm block">Wet Organics</span>
                <span className="font-headline-sm font-bold text-primary-fixed tabular-nums">—</span>
              </div>
              <div className="bg-inverse-surface/80 p-2 rounded backdrop-blur-md">
                <span className="text-inverse-on-surface/60 font-label-sm text-label-sm block">PET Recovered</span>
                <span className="font-headline-sm font-bold text-tertiary-fixed tabular-nums">—</span>
              </div>
              <div className="bg-inverse-surface/80 p-2 rounded backdrop-blur-md">
                <span className="text-inverse-on-surface/60 font-label-sm text-label-sm block">Contaminants</span>
                <span className="font-headline-sm font-bold text-error-container tabular-nums">—</span>
              </div>
              <div className="bg-inverse-surface/80 p-2 rounded backdrop-blur-md">
                <span className="text-inverse-on-surface/60 font-label-sm text-label-sm block">Efficiency</span>
                <span className="font-headline-sm font-bold text-secondary-fixed tabular-nums">—</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}