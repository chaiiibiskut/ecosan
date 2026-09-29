import { useState, useEffect, useMemo } from "react";
import { cn } from "../utils/cn";
import { BarChart3, Download, TrendingUp, TrendingDown, Target, Timer, Recycle, AlertTriangle, CheckCircle } from "lucide-react";
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, RadialBarChart,
  RadialBar,
} from "recharts";
import { analyticsApi, dashboardApi } from "../services/api";

const COLORS = {
  primary: "#006948",
  secondary: "#006a61",
  tertiary: "#0051d5",
  error: "#ba1a1a",
  warning: "#d97706",
  success: "#059669",
  info: "#2563eb",
};

const WASTE_TYPE_COLORS = {
  organic: COLORS.success,
  recyclable: COLORS.info,
  hazardous: COLORS.error,
  sanitary: COLORS.warning,
  mixed: COLORS.secondary,
};

export function Analytics() {
  const [wasteTrends, setWasteTrends] = useState([]);
  const [segregationTrends, setSegregationTrends] = useState([]);
  const [vehicleEfficiency, setVehicleEfficiency] = useState([]);
  const [binFillDistribution, setBinFillDistribution] = useState([]);
  const [wasteTypeBreakdown, setWasteTypeBreakdown] = useState([]);
  const [sanitizationCoverage, setSanitizationCoverage] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState(7);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [
        wasteTrendsRes,
        segregationTrendsRes,
        vehicleEfficiencyRes,
        binFillDistributionRes,
        wasteTypeBreakdownRes,
        sanitizationCoverageRes,
        dashboardRes,
      ] = await Promise.all([
        analyticsApi.getWasteTrends({ days: timeRange }),
        analyticsApi.getSegregationTrends({ days: timeRange }),
        analyticsApi.getVehicleEfficiency(),
        analyticsApi.getBinFillDistribution(),
        analyticsApi.getWasteTypeBreakdown(),
        analyticsApi.getSanitizationCoverage(),
        dashboardApi.getSummary(),
      ]);
      setWasteTrends(wasteTrendsRes.data);
      setSegregationTrends(segregationTrendsRes.data);
      setVehicleEfficiency(vehicleEfficiencyRes.data);
      setBinFillDistribution(binFillDistributionRes.data);
      setWasteTypeBreakdown(wasteTypeBreakdownRes.data);
      setSanitizationCoverage(sanitizationCoverageRes.data);
      setDashboardData(dashboardRes.data);
    } catch (err) {
      setError(err.message || "Failed to load data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const totalWaste = useMemo(() =>
    wasteTrends.reduce((sum, d) => sum + (d.total_kg || 0), 0), [wasteTrends]);

  const avgFill = useMemo(() => {
    if (!dashboardData?.bins?.avg_fill_pct) return "—";
    return dashboardData.bins.avg_fill_pct;
  }, [dashboardData]);

  const segregationAccuracy = useMemo(() => {
    if (!dashboardData?.operations?.segregation_accuracy) return "—";
    return dashboardData.operations.segregation_accuracy;
  }, [dashboardData]);

  const landfillDiversion = useMemo(() => {
    if (!wasteTypeBreakdown.length) return "—";
    const diverted = wasteTypeBreakdown
      .filter(w => w.waste_type !== "mixed" && w.waste_type !== "hazardous")
      .reduce((sum, w) => sum + w.total_kg, 0);
    const total = wasteTypeBreakdown.reduce((sum, w) => sum + w.total_kg, 0);
    return total > 0 ? ((diverted / total) * 100).toFixed(1) : "—";
  }, [wasteTypeBreakdown]);

  const avgResponseTime = useMemo(() => {
    if (!vehicleEfficiency.length) return "—";
    const completed = vehicleEfficiency.filter(v => v.completed_routes > 0);
    if (!completed.length) return "—";
    return "—"; // Need route completion timestamps
  }, [vehicleEfficiency]);

  const criticalBins = useMemo(() =>
    dashboardData?.bins?.critical ?? 0, [dashboardData]);

  if (isLoading && !dashboardData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-on-surface">Analytics</h1>
            <p className="font-body-md text-on-surface-variant mt-1">
              Waste trends, segregation accuracy, landfill diversion, and performance metrics
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

  if (error && !dashboardData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-on-surface">Analytics</h1>
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface-container-highest p-3 rounded-lg shadow-level3 border border-outline-variant/50">
          <p className="font-label-md text-on-surface">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="font-body-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };

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
          <div className="flex items-center gap-1 border border-outline-variant rounded-lg overflow-hidden">
            {[7, 30].map((days) => (
              <button
                key={days}
                className={cn(
                  "px-3 py-1.5 text-sm font-medium transition-colors",
                  timeRange === days
                    ? "bg-primary text-on-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                )}
                onClick={() => setTimeRange(days)}
              >
                {days}D
              </button>
            ))}
          </div>
          <button className="btn-secondary btn-sm" onClick={fetchData} disabled={isLoading}>
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
          <button className="btn-primary btn-sm">
            <Download className="w-4 h-4 mr-1" /> Export
          </button>
          {isLoading && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm">
              <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span>
              Loading
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Total Waste Collected</p>
              <p className="kpi-value tabular-nums">{totalWaste.toLocaleString(undefined, {maximumFractionDigits: 1})}</p>
              <span className="kpi-trend-up">↑ {wasteTrends.length} days</span>
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
              <p className="kpi-value tabular-nums">{segregationAccuracy !== "—" ? segregationAccuracy + "%" : "—"}</p>
              <span className={cn("kpi-trend", segregationAccuracy !== "—" && segregationAccuracy >= 90 ? "kpi-trend-up" : "kpi-trend-down")}>
                {segregationAccuracy !== "—" ? "↑ Verified" : "↓ No verified data"}
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success-light flex items-center justify-center">
              <Target className="w-6 h-6 text-success" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Landfill Diversion</p>
              <p className="kpi-value tabular-nums">{landfillDiversion !== "—" ? landfillDiversion + "%" : "—"}</p>
              <span className={cn("kpi-trend", landfillDiversion !== "—" && landfillDiversion >= 50 ? "kpi-trend-up" : "kpi-trend-down")}>
                {landfillDiversion !== "—" ? "↑ Recycled" : "↓ Mixed waste"}
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Recycle className="w-6 h-6 text-secondary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Avg Fill Level</p>
              <p className="kpi-value tabular-nums">{avgFill !== "—" ? avgFill + "%" : "—"}</p>
              <span className={cn("kpi-trend", criticalBins > 0 ? "kpi-trend-up" : "kpi-trend-down")}>
                {criticalBins > 0 ? `↑ ${criticalBins} critical` : "↓ Normal"}
              </span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center">
              <Timer className="w-6 h-6 text-tertiary" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Waste Collection Trends ({timeRange} Days)</h2>
          </div>
          <div className="card-body">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={wasteTrends}>
                  <defs>
                    <linearGradient id="colorWaste" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-outline-variant/30" />
                  <XAxis dataKey="date" tickFormatter={formatDate} className="text-on-surface-variant" />
                  <YAxis className="text-on-surface-variant" tickFormatter={v => v.toLocaleString()} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="total_kg"
                    stroke={COLORS.primary}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorWaste)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-between mt-4 text-sm text-on-surface-variant">
              <span>Total: {totalWaste.toLocaleString()} kg</span>
              <span>Avg/Day: {(totalWaste / (wasteTrends.length || 1)).toLocaleString(undefined, {maximumFractionDigits: 1})} kg</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Segregation Accuracy by Type ({timeRange} Days)</h2>
          </div>
          <div className="card-body">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={segregationTrends}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-outline-variant/30" />
                  <XAxis dataKey="date" tickFormatter={formatDate} className="text-on-surface-variant" />
                  <YAxis className="text-on-surface-variant" domain={[0, 1]} tickFormatter={v => (v * 100).toFixed(0) + "%"} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {Object.entries(WASTE_TYPE_COLORS).map(([type, color]) => (
                    <Line
                      key={type}
                      type="monotone"
                      dataKey={`${type}.avg_confidence`}
                      stroke={color}
                      strokeWidth={2}
                      dot={false}
                      name={type.charAt(0).toUpperCase() + type.slice(1)}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Bin Fill Distribution</h2>
          </div>
          <div className="card-body">
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="80%" height="80%">
                <PieChart>
                  <Pie
                    data={binFillDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="status"
                    label={({ status, count, percent }) => `${status}: ${count} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {binFillDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.status] || COLORS.primary} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {binFillDistribution.map((entry) => (
                <span key={entry.status} className={cn("badge", `badge-${entry.status}`)}>
                  {entry.status}: {entry.count}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Waste Type Breakdown (Today)</h2>
          </div>
          <div className="card-body">
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="80%" height="80%">
                <PieChart>
                  <Pie
                    data={wasteTypeBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="total_kg"
                    nameKey="waste_type"
                    label={({ waste_type, percentage }) => `${waste_type}: ${percentage}%`}
                    labelLine={false}
                  >
                    {wasteTypeBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={WASTE_TYPE_COLORS[entry.waste_type] || COLORS.primary} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {wasteTypeBreakdown.map((entry) => (
                <span key={entry.waste_type} className="badge badge-neutral" style={{ backgroundColor: WASTE_TYPE_COLORS[entry.waste_type] + "20", borderColor: WASTE_TYPE_COLORS[entry.waste_type], color: WASTE_TYPE_COLORS[entry.waste_type] }}>
                  {entry.waste_type}: {entry.total_kg} kg ({entry.percentage}%)
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Vehicle Efficiency</h2>
          </div>
          <div className="card-body p-0">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Routes</th>
                    <th>Completed</th>
                    <th>Distance (km)</th>
                    <th>Fuel Saved (kg)</th>
                    <th>Battery</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicleEfficiency.map((v) => (
                    <tr key={v.vehicle_id}>
                      <td className="font-mono font-medium">{v.vehicle_code}</td>
                      <td>{v.vehicle_type}</td>
                      <td className="font-mono tabular-nums">{v.total_routes}</td>
                      <td className="font-mono tabular-nums text-success">{v.completed_routes}</td>
                      <td className="font-mono tabular-nums">{v.total_distance_km}</td>
                      <td className="font-mono tabular-nums text-success">{v.total_fuel_saved_kg}</td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className={cn("h-full transition-all duration-300", v.current_battery_pct < 20 ? "bg-error" : "bg-secondary")}
                              style={{ width: `${v.current_battery_pct}%` }}
                            />
                          </div>
                          <span className="font-mono tabular-nums text-sm">{v.current_battery_pct}%</span>
                        </div>
                      </td>
                      <td>
                        <span className={cn("badge", v.current_status === "en_route" && "badge-info", v.current_status === "collecting" && "badge-warning", v.current_status === "maintenance" && "badge-error")}>
                          {v.current_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="section-title">Sanitization Coverage</h2>
          </div>
          <div className="card-body p-0">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Site</th>
                    <th>Type</th>
                    <th>Last Cleaned</th>
                    <th>UV-C</th>
                    <th>Mist</th>
                    <th>Supply (L)</th>
                    <th>Needs Attention</th>
                  </tr>
                </thead>
                <tbody>
                  {sanitizationCoverage.map((site) => (
                    <tr key={site.site_id}>
                      <td className="font-medium">{site.name}</td>
                      <td className="font-body-sm text-on-surface-variant">{site.site_type}</td>
                      <td className="font-body-sm text-on-surface-variant">
                        {site.last_sanitized_hours_ago ? `${site.last_sanitized_hours_ago.toFixed(1)}h ago` : "Never"}
                      </td>
                      <td>
                        <span className={cn("inline-flex items-center gap-1", site.uv_c_status ? "text-success" : "text-error")}>
                          <span className="material-symbols-outlined text-[18px]">{site.uv_c_status ? "wb_iridescent" : "wb_iridescent_off"}</span>
                        </span>
                      </td>
                      <td>
                        <span className={cn("inline-flex items-center gap-1", site.mist_status ? "text-primary" : "text-error")}>
                          <span className="material-symbols-outlined text-[18px]">{site.mist_status ? "air" : "air_off"}</span>
                        </span>
                      </td>
                      <td className="font-mono tabular-nums">{site.supply_liters?.toFixed(1) ?? "—"}</td>
                      <td>
                        <span className={cn("badge", site.needs_attention ? "badge-error" : "badge-success")}>
                          {site.needs_attention ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                          {site.needs_attention ? "Yes" : "No"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}