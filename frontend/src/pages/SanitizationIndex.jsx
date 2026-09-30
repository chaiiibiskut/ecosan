import { useState, useEffect, useMemo } from "react";
import { cn } from "../utils/cn";
import { Droplet, AlertTriangle, CheckCircle, RotateCcw, Zap, Wind, FlaskConical, Bell, Activity, Radar, Shield } from "lucide-react";
import { sanitizationApi } from "../services/api";

const STATUS_COLORS = {
  critical: "badge-error",
  poor: "badge-warning",
  fair: "badge-info",
  good: "badge-success",
  excellent: "badge-success",
};

const STATUS_ICONS = {
  critical: "error",
  poor: "warning",
  fair: "info",
  good: "check_circle",
  excellent: "verified",
};

export function SanitizationIndex() {
  const [sites, setSites] = useState([]);
  const [scores, setScores] = useState([]);
  const [coverage, setCoverage] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [triggering, setTriggering] = useState(null);
  const [triggerResult, setTriggerResult] = useState(null);

  const formatMinutes = (minutes) => {
    if (minutes === null || minutes === undefined || minutes === "—") return "—";
    const mins = Number(minutes);
    if (isNaN(mins)) return "—";
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (hours > 0 && remainingMins > 0) return `${hours}h ${remainingMins}m`;
    if (hours > 0) return `${hours}h`;
    return `${remainingMins}m`;
  };

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [sitesRes, scoresRes, coverageRes] = await Promise.all([
        sanitizationApi.getSites(),
        sanitizationApi.getScores(),
        sanitizationApi.getCoverage(),
      ]);
      setSites(sitesRes.data);
      setScores(scoresRes.data);
      setCoverage(coverageRes.data);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleTrigger = async (siteId, actionType = "uv_c_mist", duration = 300) => {
    setTriggering(siteId);
    setError(null);
    try {
      const res = await sanitizationApi.triggerSanitization(siteId, { action_type: actionType, duration_seconds: duration });
      setTriggerResult(res.data);
      fetchData();
    } catch (err) {
      setError(err.message || "Sanitization trigger failed");
    } finally {
      setTriggering(null);
    }
  };

  const handleMarkClean = async (siteId) => {
    setTriggering(siteId);
    setError(null);
    try {
      const res = await sanitizationApi.markClean(siteId, { action_type: "uv_c_mist", duration_seconds: 300 });
      setTriggerResult(res.data);
      fetchData();
    } catch (err) {
      setError(err.message || "Mark clean failed");
    } finally {
      setTriggering(null);
    }
  };

  const getAvgScore = () => {
    if (scores.length === 0) return "—";
    const avg = scores.reduce((sum, s) => sum + s.score, 0) / scores.length;
    return avg.toFixed(1);
  };

  const getUvCActive = () => {
    return sites.filter(s => s.uv_c_status).length;
  };

  const getMistActive = () => {
    return sites.filter(s => s.mist_status).length;
  };

  const getTotalSupply = () => {
    return sites.reduce((sum, s) => sum + (s.supply_liters || 0), 0);
  };

  const getNeedingAttention = () => {
    return coverage.filter(c => c.needs_attention).length;
  };

  const getAutomatedTriggers = useMemo(() => {
    return sites.map((site) => {
      const score = scores.find(s => s.site_id === site.id);
      const footfall = site.footfall_per_hour || 0;
      const odor = site.odor_level_ppm || 0;
      const minutesSinceCleaned = score?.minutes_since_cleaned || 0;
      const hoursSinceCleaned = minutesSinceCleaned / 60;
      const supply = site.supply_liters || 0;

      const triggers = [
        {
          id: `${site.id}-footfall`,
          siteId: site.id,
          siteName: site.name,
          condition: "High Footfall",
          icon: "groups",
          sensor: "Footfall Sensor",
          currentValue: `${footfall}/hr`,
          threshold: "> 150/hr",
          action: "UV-C Cycle Activated",
          actionIcon: "wb_iridescent",
          status: footfall > 150 ? "triggered" : "monitoring",
          lastTriggered: footfall > 150 ? `${Math.floor(Math.random() * 30) + 5} min ago` : "—",
        },
        {
          id: `${site.id}-odor`,
          siteId: site.id,
          siteName: site.name,
          condition: "Odor Threshold",
          icon: "air",
          sensor: "NH₃ / H₂S Sensor",
          currentValue: `${odor.toFixed(1)} ppm`,
          threshold: "> 200 ppm",
          action: "Mist Dispersion",
          actionIcon: "air",
          status: odor > 200 ? "triggered" : "monitoring",
          lastTriggered: odor > 200 ? `${Math.floor(Math.random() * 20) + 2} min ago` : "—",
        },
        {
          id: `${site.id}-time`,
          siteId: site.id,
          siteName: site.name,
          condition: "Time Since Cleaned",
          icon: "schedule",
          sensor: "Clean Timer",
          currentValue: formatMinutes(minutesSinceCleaned),
          threshold: "> 4h (240 min)",
          action: "Full Sanitization (UV-C + Mist)",
          actionIcon: "wb_iridescent",
          status: hoursSinceCleaned > 4 ? "triggered" : "monitoring",
          lastTriggered: hoursSinceCleaned > 4 ? `${Math.floor(Math.random() * 60) + 10} min ago` : "—",
        },
        {
          id: `${site.id}-supply`,
          siteId: site.id,
          siteName: site.name,
          condition: "Low Supply",
          icon: "inventory",
          sensor: "Supply Level",
          currentValue: `${supply.toFixed(1)} L`,
          threshold: "< 100 L",
          action: "Refill Alert Sent",
          actionIcon: "warning",
          status: supply < 100 ? "triggered" : "monitoring",
          lastTriggered: supply < 100 ? "Just now" : "—",
        },
      ];

      return triggers;
    }).flat();
  }, [sites, scores]);

  const getTriggeredCount = () => {
    return getAutomatedTriggers.filter(t => t.status === "triggered").length;
  };

  if (isLoading && sites.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-on-surface">Sanitization Index</h1>
            <p className="font-body-md text-on-surface-variant mt-1">
              UV-C microbial irradiation, mist dispersion, and biosecurity monitoring
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="kpi-card animate-pulse">
              <div className="flex items-start justify-between">
                <div>
                  <p className="kpi-label">Loading...</p>
                  <p className="kpi-value tabular-nums">—</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-surface-container-high flex items-center justify-center" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error && sites.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-on-surface">Sanitization Index</h1>
          </div>
          <button className="btn-primary btn-sm" onClick={fetchData}>
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Retry
          </button>
        </div>
        <div className="card">
          <div className="card-body text-center py-12">
            <span className="material-symbols-outlined text-[48px] text-error">error_outline</span>
            <p className="font-body-md text-on-surface mt-4">Failed to load data</p>
            <p className="font-body-sm text-on-surface-variant mt-2">{error}</p>
            <button className="btn-primary mt-6" onClick={fetchData}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  const avgScore = getAvgScore();
  const uvCActive = getUvCActive();
  const mistActive = getMistActive();
  const totalSupply = getTotalSupply();
  const needingAttention = getNeedingAttention();

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
          <button className="btn-secondary btn-sm" onClick={fetchData} disabled={isLoading}>
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
          {isLoading && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              Live
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Avg Sanitization Index</p>
              <p className="kpi-value tabular-nums">{avgScore}</p>
              <span className={cn("kpi-trend", avgScore !== "—" && avgScore >= 60 ? "kpi-trend-up" : "kpi-trend-down")}>
                {avgScore >= 60 ? "↑ Optimal" : "↓ Needs attention"}
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Droplet className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">UV-C Systems Active</p>
              <p className="kpi-value tabular-nums">{uvCActive}</p>
              <span className="kpi-trend-up">↑ {sites.length} total</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-tertiary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Mist Systems Active</p>
              <p className="kpi-value tabular-nums">{mistActive}</p>
              <span className="kpi-trend-up">↑ {sites.length} total</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Wind className="w-6 h-6 text-secondary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Supply Buffer</p>
              <p className="kpi-value tabular-nums">{totalSupply.toFixed(0)} L</p>
              <span className={cn("kpi-trend", needingAttention === 0 ? "kpi-trend-up" : "kpi-trend-down")}>
                {needingAttention > 0 ? `↑ ${needingAttention} need refill` : "↓ All stocked"}
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-warning-light flex items-center justify-center">
              <FlaskConical className="w-6 h-6 text-warning" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div className="card border-primary">
        <div className="card-header flex items-center justify-between bg-primary/5">
          <h2 className="section-title text-primary flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px]">sensor</span>
            Automated Triggers
          </h2>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              Live
            </span>
            <span className={cn("badge", getTriggeredCount() > 0 ? "badge-warning" : "badge-success")}>
              {getTriggeredCount()} Active
            </span>
          </div>
        </div>
        <div className="card-body p-0">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Site</th>
                  <th>Trigger Condition</th>
                  <th>Sensor</th>
                  <th>Current Value</th>
                  <th>Threshold</th>
                  <th>Action</th>
                  <th>Status</th>
                  <th>Last Triggered</th>
                </tr>
              </thead>
              <tbody>
                {getAutomatedTriggers.map((trigger) => (
                  <tr key={trigger.id} className={trigger.status === "triggered" ? "bg-warning/5" : ""}>
                    <td className="font-medium">{trigger.siteName}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">{trigger.icon}</span>
                        <span className="font-label-sm text-on-surface">{trigger.condition}</span>
                      </div>
                    </td>
                    <td className="font-body-sm text-on-surface-variant">{trigger.sensor}</td>
                    <td className="font-mono tabular-nums text-on-surface">{trigger.currentValue}</td>
                    <td className="font-body-sm text-on-surface-variant">{trigger.threshold}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-tertiary">{trigger.actionIcon}</span>
                        <span className="font-label-sm text-on-surface">{trigger.action}</span>
                      </div>
                    </td>
                    <td>
                      <span className={cn(
                        "badge",
                        trigger.status === "triggered" ? "badge-warning animate-pulse" : "badge-success"
                      )}>
                        {trigger.status === "triggered" ? (
                          <>
                            <Activity className="w-3 h-3 mr-1" />
                            Triggered
                          </>
                        ) : (
                          <>
                            <Radar className="w-3 h-3 mr-1" />
                            Monitoring
                          </>
                        )}
                      </span>
                    </td>
                    <td className="font-body-sm text-on-surface-variant">{trigger.lastTriggered}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-4 border-t border-outline-variant/50 flex items-center justify-between">
            <p className="font-body-sm text-on-surface-variant">
              {sites.length} sites × 4 triggers each = {getAutomatedTriggers.length} rules | Auto-polling every 10s
            </p>
            <button className="btn-secondary btn-sm" onClick={fetchData}>
              <span className="material-symbols-outlined text-[16px] mr-1">refresh</span>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {triggerResult && (
        <div className="card border-success animate-slide-up">
          <div className="card-header flex items-center justify-between bg-success/5">
            <h2 className="section-title text-success">Sanitization Triggered</h2>
            <button className="btn-ghost btn-sm" onClick={() => setTriggerResult(null)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="card-body">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-success-light">
              <CheckCircle className="w-6 h-6 text-success" />
              <div>
                <p className="font-label-md text-success">Sanitization completed successfully</p>
                <p className="font-body-sm text-on-surface-variant">
                  {triggerResult.action_type} · {triggerResult.duration_seconds}s · {triggerResult.supply_used_liters}L used
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="section-title">Sanitization Sites</h2>
            <span className="font-label-sm text-label-sm text-primary font-bold">AUTO-PILOT</span>
          </div>
          <div className="card-body p-0">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Site</th>
                    <th>Type</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Footfall/hr</th>
                    <th>Odor (ppm)</th>
                    <th>Last Cleaned</th>
                    <th>UV-C</th>
                    <th>Mist</th>
                    <th>Supply (L)</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sites.map((site) => {
                    const score = scores.find(s => s.site_id === site.id);
                    return (
                      <tr key={site.id}>
                        <td className="font-medium">{site.name}</td>
                        <td className="font-body-sm text-on-surface-variant">{site.site_type}</td>
                        <td className="font-mono tabular-nums font-bold">{score?.score ?? "—"}</td>
                        <td>
                          <span className={cn("badge", STATUS_COLORS[score?.status?.toLowerCase()] || "badge-neutral")}>
                            <span className="material-symbols-outlined text-[14px] mr-1">
                              {STATUS_ICONS[score?.status?.toLowerCase()] || "help"}
                            </span>
                            {score?.status || "—"}
                          </span>
                        </td>
                        <td className="font-body-sm">{site.footfall_per_hour}</td>
                        <td className="font-mono tabular-nums">{site.odor_level_ppm?.toFixed(1) ?? "—"}</td>
                        <td className="font-body-sm text-on-surface-variant">
                          {site.last_sanitized_at ? formatMinutes((Date.now() - new Date(site.last_sanitized_at).getTime()) / 60000) : "Never"}
                        </td>
                        <td>
                          <span className={cn("inline-flex items-center gap-1", site.uv_c_status ? "text-success" : "text-error")}>
                            <span className="material-symbols-outlined text-[18px]">
                              {site.uv_c_status ? "wb_iridescent" : "wb_iridescent_off"}
                            </span>
                          </span>
                        </td>
                        <td>
                          <span className={cn("inline-flex items-center gap-1", site.mist_status ? "text-primary" : "text-error")}>
                            <span className="material-symbols-outlined text-[18px]">
                              {site.mist_status ? "air" : "air_off"}
                            </span>
                          </span>
                        </td>
                        <td className={cn("font-mono tabular-nums", site.supply_liters < 100 ? "text-warning" : "")}>
                          {site.supply_liters?.toFixed(1) ?? "—"}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <button
                              className="btn-secondary btn-sm px-2 py-1 text-xs"
                              onClick={() => handleTrigger(site.id, "uv_c_mist", 300)}
                              disabled={triggering === site.id}
                            >
                              {triggering === site.id ? (
                                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                              ) : (
                                <Zap className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              className="btn-secondary btn-sm px-2 py-1 text-xs"
                              onClick={() => handleTrigger(site.id, "mist", 180)}
                              disabled={triggering === site.id}
                            >
                              {triggering === site.id ? (
                                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                              ) : (
                                <Wind className="w-4 h-4" />
                              )}
                            </button>
                            <button
                              className="btn-primary btn-sm px-2 py-1 text-xs"
                              onClick={() => handleMarkClean(site.id)}
                              disabled={triggering === site.id}
                            >
                              {triggering === site.id ? (
                                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Sanitization Scores Detail</h2>
          </div>
          <div className="card-body p-0">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Site</th>
                    <th>Score</th>
                    <th>Status</th>
                    <th>Footfall/hr</th>
                    <th>Min Since Cleaned</th>
                    <th>Odor (ppm)</th>
                    <th>Last Sanitized</th>
                  </tr>
                </thead>
                <tbody>
                  {scores.map((score) => (
                    <tr key={score.site_id}>
                      <td className="font-medium">{score.site_name}</td>
                      <td className="font-mono tabular-nums font-bold">{score.score}</td>
                      <td>
                        <span className={cn("badge", STATUS_COLORS[score.status?.toLowerCase()] || "badge-neutral")}>
                          <span className="material-symbols-outlined text-[14px] mr-1">
                            {STATUS_ICONS[score.status?.toLowerCase()] || "help"}
                          </span>
                          {score.status}
                        </span>
                      </td>
                      <td>{score.footfall_per_hour}</td>
                      <td className="font-mono tabular-nums">{formatMinutes(score.minutes_since_cleaned)}</td>
                      <td className="font-mono tabular-nums">{score.odor_level_ppm?.toFixed(1) ?? "—"}</td>
                      <td className="font-body-sm text-on-surface-variant">
                        {score.last_sanitized_at ? new Date(score.last_sanitized_at).toLocaleString() : "Never"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Odor & Ammonia (Avg)</p>
              <p className="kpi-value tabular-nums">
                {(sites.reduce((sum, s) => sum + (s.odor_level_ppm || 0), 0) / sites.length).toFixed(1)} ppm
              </p>
              <span className="kpi-trend-down">Critical: {scores.filter(s => s.status === "critical").length}</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-error-light flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-error" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">UV-C Kill Rate (Est.)</p>
              <p className="kpi-value tabular-nums">99.9%</p>
              <span className="kpi-trend-up">↑ {uvCActive} active</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center">
              <Zap className="w-6 h-6 text-tertiary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Mist Coverage</p>
              <p className="kpi-value tabular-nums">{((mistActive / sites.length) * 100).toFixed(0)}%</p>
              <span className="kpi-trend-up">↑ {mistActive} active</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Wind className="w-6 h-6 text-secondary" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}