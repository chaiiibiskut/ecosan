import { useState, useEffect } from "react";
import { cn } from "../utils/cn";
import { Trash2 } from "lucide-react";
import { binsApi, alertsApi, dashboardApi } from "../services/api";

export function LiveOperations() {
  const [dashboardData, setDashboardData] = useState(null);
  const [bins, setBins] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [dashboardRes, binsRes, alertsRes] = await Promise.all([
        dashboardApi.getSummary(),
        binsApi.list({ active_only: true }),
        alertsApi.list({ resolved: false, limit: 10 }),
      ]);
      setDashboardData(dashboardRes.data);
      setBins(binsRes.data);
      setAlerts(alertsRes.data);
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

  if (isLoading && !dashboardData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-on-surface">Live Operations</h1>
            <p className="font-body-md text-on-surface-variant mt-1">
              Real-time smart bin monitoring, fleet tracking, and alert management
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
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Smart Bin Network</h2>
          </div>
          <div className="card-body">
            <div className="text-center py-12 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-surface-container-high mx-auto mb-4" />
              <p className="font-body-md text-on-surface-variant">Loading bin network...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-on-surface">Live Operations</h1>
            <p className="font-body-md text-on-surface-variant mt-1">
              Real-time smart bin monitoring, fleet tracking, and alert management
            </p>
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
            <button className="btn-primary mt-6" onClick={fetchData}>
              <span className="material-symbols-outlined text-[18px]">refresh</span>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    bins: binStats,
    vehicles: vehicleStats,
    sanitization: sanitizationStats,
    alerts: alertStats,
    operations,
  } = dashboardData;

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
              <p className="kpi-label">Total Bins</p>
              <p className="kpi-value tabular-nums">{binStats?.total ?? "—"}</p>
              <span className="kpi-trend-up">↑ {binStats?.active ?? 0} active</span>
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
              <p className="kpi-value tabular-nums">{binStats?.avg_fill_pct ?? "—"}%</p>
              <span className={cn("kpi-trend", binStats?.avg_fill_pct > 70 ? "kpi-trend-up" : "kpi-trend-down")}>
                {binStats?.critical > 0 ? `↑ ${binStats.critical} critical` : "↓ Normal"}
              </span>
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
              <p className="kpi-value tabular-nums">{alertStats?.active ?? "—"}</p>
              <span className="kpi-trend-down">↑ {alertStats?.critical ?? 0} critical</span>
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
              <p className="kpi-value tabular-nums">{operations?.segregation_accuracy ?? "—"}%</p>
              <span className="kpi-trend-up">↑ {operations?.completed_routes_today ?? 0} routes today</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success-light flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-success">check_circle</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 card">
          <div className="card-header flex items-center justify-between">
            <h2 className="section-title">Smart Bin Network</h2>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
                Live
              </span>
            </div>
          </div>
          <div className="card-body p-0">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Bin ID</th>
                    <th>Zone</th>
                    <th>Waste Type</th>
                    <th>Fill Level</th>
                    <th>Status</th>
                    <th>Battery</th>
                    <th>Last Update</th>
                  </tr>
                </thead>
                <tbody>
                  {bins.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-on-surface-variant">
                        No bins found
                      </td>
                    </tr>
                  ) : (
                    bins.map((bin) => (
                      <tr key={bin.id}>
                        <td className="font-mono font-medium">{bin.bin_code}</td>
                        <td>{bin.zone?.name || "—"}</td>
                        <td>
                          <span className="badge badge-neutral">
                            {bin.waste_type}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 max-w-xs h-2 bg-surface-container-high rounded-full overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all duration-300"
                                style={{ width: `${bin.fill_pct}%` }}
                              />
                            </div>
                            <span className="font-mono tabular-nums text-sm">{bin.fill_pct}%</span>
                          </div>
                        </td>
                        <td>
                          <span className={cn(
                            "badge",
                            bin.status === "CRITICAL" && "badge-error",
                            bin.status === "HIGH" && "badge-warning",
                            bin.status === "MEDIUM" && "badge-info",
                            bin.status === "LOW" && "badge-success",
                            bin.status === "EMPTY" && "badge-neutral",
                            bin.status === "OFFLINE" && "badge-neutral"
                          )}>
                            {bin.status}
                          </span>
                        </td>
                        <td>{bin.battery_pct !== null ? `${bin.battery_pct}%` : "—"}</td>
                        <td className="font-body-sm text-on-surface-variant">
                          {bin.updated_at ? new Date(bin.updated_at).toLocaleTimeString() : "—"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Active Alerts</h2>
          </div>
          <div className="card-body p-0">
            {alerts.length === 0 ? (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-[32px] text-success">check_circle</span>
                <p className="font-body-md text-on-surface-variant mt-2">No active alerts</p>
                <p className="font-body-sm text-on-surface-variant mt-1">All systems operational</p>
              </div>
            ) : (
              <div className="divide-y divide-outline-variant/30">
                {alerts.slice(0, 10).map((alert) => (
                  <div key={alert.id} className="p-4 hover:bg-surface-container-low/50 transition-colors">
                    <div className="flex items-start gap-3">
                      <span className={cn(
                        "status-dot mt-1 flex-shrink-0",
                        alert.severity === "CRITICAL" && "bg-error",
                        alert.severity === "WARNING" && "bg-warning",
                        alert.severity === "INFO" && "bg-info"
                      )} />
                      <div className="flex-1 min-w-0">
                        <p className="font-label-sm text-on-surface">{alert.message}</p>
                        <p className="font-body-sm text-on-surface-variant mt-1">
                          {alert.bin?.bin_code ? `Bin: ${alert.bin.bin_code}` : alert.site?.name ? `Site: ${alert.site.name}` : "System"}
                          <span className="mx-2">•</span>
                          {new Date(alert.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                      <span className={cn(
                        "badge badge-neutral",
                        alert.severity === "CRITICAL" && "badge-error",
                        alert.severity === "WARNING" && "badge-warning",
                        alert.severity === "INFO" && "badge-info"
                      )}>
                        {alert.severity}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Vehicles Active</p>
              <p className="kpi-value tabular-nums">{vehicleStats?.active ?? "—"}</p>
              <span className="kpi-trend-up">↑ {vehicleStats?.en_route ?? 0} en route</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-tertiary">local_shipping</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Sanitization Index</p>
              <p className="kpi-value tabular-nums">{sanitizationStats?.sanitization_index ?? "—"}</p>
              <span className={cn("kpi-trend", sanitizationStats?.sanitization_index >= 80 ? "kpi-trend-up" : "kpi-trend-down")}>
                {sanitizationStats?.needing_attention > 0 ? `↑ ${sanitizationStats.needing_attention} need attention` : "↓ Optimal"}
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-secondary">spa</span>
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Waste Collected Today</p>
              <p className="kpi-value tabular-nums">{operations?.total_waste_today_kg ?? "—"} kg</p>
              <span className="kpi-trend-up">↑ {binStats?.total ?? 0} bins monitored</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px] text-primary">recycling</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}