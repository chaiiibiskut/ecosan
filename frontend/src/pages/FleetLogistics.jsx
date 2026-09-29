import { useState, useEffect } from "react";
import { cn } from "../utils/cn";
import { Truck, MapPin, Navigation, Fuel, RotateCcw, AlertTriangle, CheckCircle } from "lucide-react";
import { vehiclesApi, routesApi, binsApi } from "../services/api";

const STATUS_COLORS = {
  idle: "badge-neutral",
  en_route: "badge-info",
  collecting: "badge-warning",
  maintenance: "badge-error",
  offline: "badge-neutral",
};

const STATUS_ICONS = {
  idle: "pause_circle",
  en_route: "local_shipping",
  collecting: "delete_sweep",
  maintenance: "build",
  offline: "power_off",
};

export function FleetLogistics() {
  const [vehicles, setVehicles] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [bins, setBins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [optimizing, setOptimizing] = useState(null);
  const [optimizeResult, setOptimizeResult] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [vehiclesRes, routesRes, binsRes] = await Promise.all([
        vehiclesApi.list(),
        routesApi.list(),
        binsApi.list({ active_only: true, status: "critical" }),
      ]);
      setVehicles(vehiclesRes.data);
      setRoutes(routesRes.data);
      setBins(binsRes.data);
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

  const handleOptimizeAll = async () => {
    setOptimizing("all");
    setError(null);
    try {
      const res = await routesApi.optimizeAll({ max_bins_per_vehicle: 10, max_distance_km: 50 });
      setOptimizeResult(res.data);
      fetchData();
    } catch (err) {
      setError(err.message || "Optimization failed");
    } finally {
      setOptimizing(null);
    }
  };

  const handleOptimizeVehicle = async (vehicleId) => {
    setOptimizing(vehicleId);
    setError(null);
    try {
      const criticalBins = bins.filter(b => b.status === "CRITICAL" || b.status === "HIGH");
      const res = await routesApi.optimize({
        vehicle_id: vehicleId,
        max_bins: 10,
        max_distance_km: 50,
      });
      setOptimizeResult(res.data);
      fetchData();
    } catch (err) {
      setError(err.message || "Optimization failed");
    } finally {
      setOptimizing(null);
    }
  };

  if (isLoading && vehicles.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-on-surface">Fleet Logistics</h1>
            <p className="font-body-md text-on-surface-variant mt-1">
              Vehicle tracking, route optimization, and dispatch management
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

  if (error && vehicles.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-on-surface">Fleet Logistics</h1>
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

  const activeVehicles = vehicles.filter(v => v.status !== "maintenance" && v.status !== "offline").length;
  const totalCapacity = vehicles.reduce((sum, v) => sum + v.capacity_kg, 0);
  const currentLoad = vehicles.reduce((sum, v) => sum + v.current_load_kg, 0);
  const completedRoutes = routes.filter(r => r.status === "completed").length;
  const totalFuelSaved = routes.reduce((sum, r) => sum + (r.fuel_saved_kg || 0), 0);
  const enRouteVehicles = vehicles.filter(v => v.status === "en_route").length;

  const criticalBinsCount = bins.length;

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
          <button className="btn-secondary btn-sm" onClick={fetchData} disabled={isLoading}>
            <span className="material-symbols-outlined text-[18px]">refresh</span>
            Refresh
          </button>
          <button
            className="btn-primary btn-sm"
            onClick={handleOptimizeAll}
            disabled={isLoading || optimizing || criticalBinsCount === 0}
          >
            <span className="material-symbols-outlined text-[18px]">auto_fix_high</span>
            Optimize All
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
              <p className="kpi-label">Active Vehicles</p>
              <p className="kpi-value tabular-nums">{activeVehicles}</p>
              <span className={cn("kpi-trend", enRouteVehicles > 0 ? "kpi-trend-up" : "kpi-trend-down")}>
                ↑ {enRouteVehicles} en route
              </span>
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
              <p className="kpi-value tabular-nums">{(totalCapacity / 1000).toFixed(1)}t</p>
              <span className="kpi-trend-up">↑ {(currentLoad / 1000).toFixed(1)}t loaded</span>
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
              <p className="kpi-value tabular-nums">{routes.length}</p>
              <span className="kpi-trend-up">↑ {completedRoutes} completed</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-tertiary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Fuel Saved Today</p>
              <p className="kpi-value tabular-nums">{totalFuelSaved.toFixed(1)} kg</p>
              <span className="kpi-trend-up">↑ {routes.filter(r => r.fuel_saved_kg > 0).length} optimized</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success-light flex items-center justify-center">
              <Fuel className="w-6 h-6 text-success" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      {optimizeResult && (
        <div className="card border-primary animate-slide-up">
          <div className="card-header flex items-center justify-between bg-primary/5">
            <h2 className="section-title text-primary">Route Optimized</h2>
            <button className="btn-ghost btn-sm" onClick={() => setOptimizeResult(null)}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
          <div className="card-body">
            {optimizeResult.routes ? (
              <div className="space-y-2">
                {optimizeResult.routes.map((r, i) => (
                  <div key={i} className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-label-sm text-on-surface">Vehicle {r.vehicle_id}</p>
                        <p className="font-body-sm text-on-surface-variant">
                          {r.bins_count} bins · {r.optimized_distance_km} km · {r.estimated_time_min} min
                        </p>
                      </div>
                    </div>
                    <span className="badge badge-success">
                      Saved {r.distance_saved_km} km
                    </span>
                  </div>
                ))}
                <div className="pt-2 border-t border-outline-variant/30">
                  <p className="font-label-md text-on-surface">
                    Total: {optimizeResult.total_bins_assigned} bins · {optimizeResult.total_optimized_distance_km} km · {optimizeResult.total_distance_saved_km} km saved
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-label-sm text-on-surface">Vehicle {optimizeResult.vehicle_id}</p>
                    <p className="font-body-sm text-on-surface-variant">
                      {optimizeResult.bin_ids?.length || 0} bins · {optimizeResult.distance_km} km · {optimizeResult.estimated_time_min} min
                    </p>
                  </div>
                </div>
                <span className="badge badge-success">
                  Saved {optimizeResult.fuel_saved_kg} kg CO₂
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="section-title">Fleet Overview</h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-secondary-fixed/50 text-secondary font-label-sm text-label-sm font-bold">
              <span className="material-symbols-outlined text-[16px]">electric_bolt</span> ZERO-EMISSION LOGISTICS
            </span>
          </div>
          <div className="card-body p-0">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Vehicle</th>
                    <th>Type</th>
                    <th>Driver</th>
                    <th>Status</th>
                    <th>Load</th>
                    <th>Battery</th>
                    <th>Location</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td className="font-mono font-medium">{vehicle.vehicle_code}</td>
                      <td className="font-body-sm">{vehicle.vehicle_type}</td>
                      <td className="font-body-sm">{vehicle.driver_name}</td>
                      <td>
                        <span className={cn(
                          "badge",
                          STATUS_COLORS[vehicle.status] || "badge-neutral"
                        )}>
                          <span className="material-symbols-outlined text-[14px] mr-1">
                            {STATUS_ICONS[vehicle.status] || "help"}
                          </span>
                          {vehicle.status.replace("_", " ")}
                        </span>
                      </td>
                      <td className="font-mono tabular-nums">
                        {(vehicle.current_load_kg / 1000).toFixed(2)}t / {(vehicle.capacity_kg / 1000).toFixed(1)}t
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-xs h-2 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className={cn("h-full transition-all duration-300", vehicle.battery_pct < 20 ? "bg-error" : "bg-secondary")}
                              style={{ width: `${vehicle.battery_pct}%` }}
                            />
                          </div>
                          <span className="font-mono tabular-nums text-sm">{vehicle.battery_pct}%</span>
                        </div>
                      </td>
                      <td className="font-body-sm text-on-surface-variant font-mono">
                        {vehicle.lat.toFixed(4)}, {vehicle.lng.toFixed(4)}
                      </td>
                      <td>
                        <div className="flex items-center gap-1">
                          {criticalBinsCount > 0 && vehicle.status !== "maintenance" && vehicle.status !== "offline" && (
                            <button
                              className="btn-primary btn-sm px-3 py-1.5 text-xs"
                              onClick={() => handleOptimizeVehicle(vehicle.id)}
                              disabled={optimizing === vehicle.id}
                            >
                              {optimizing === vehicle.id ? (
                                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                              ) : (
                                <>
                                  <span className="material-symbols-outlined text-[16px]">auto_fix_high</span>
                                  Optimize
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header flex items-center justify-between">
            <h2 className="section-title">Recent Routes</h2>
            <span className="font-body-sm text-on-surface-variant">{routes.length} total</span>
          </div>
          <div className="card-body p-0">
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Route ID</th>
                    <th>Vehicle</th>
                    <th>Bins</th>
                    <th>Distance</th>
                    <th>Time</th>
                    <th>Fuel Saved</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.slice(0, 10).map((route) => (
                    <tr key={route.id}>
                      <td className="font-mono font-medium">#{route.id}</td>
                      <td>{route.vehicle?.vehicle_code || "—"}</td>
                      <td className="font-body-sm text-on-surface-variant">
                        {Array.isArray(route.bin_ids) ? route.bin_ids.length : route.bin_ids?.split(",").length || 0}
                      </td>
                      <td className="font-mono tabular-nums">{route.distance_km} km</td>
                      <td className="font-mono tabular-nums">{route.estimated_time_min} min</td>
                      <td className="font-mono tabular-nums text-success">{route.fuel_saved_kg} kg</td>
                      <td>
                        <span className={cn(
                          "badge",
                          route.status === "completed" && "badge-success",
                          route.status === "in_progress" && "badge-info",
                          route.status === "planned" && "badge-neutral"
                        )}>
                          {route.status}
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

      <div className="card">
        <div className="card-header">
          <h2 className="section-title">Bins Needing Collection</h2>
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
                  <th>Priority</th>
                </tr>
              </thead>
              <tbody>
                {bins.slice(0, 15).map((bin) => (
                  <tr key={bin.id}>
                    <td className="font-mono font-medium">{bin.bin_code}</td>
                    <td>{bin.zone?.name || "—"}</td>
                    <td>
                      <span className="badge badge-neutral">{bin.waste_type}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-xs h-2 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className={cn("h-full transition-all duration-300", bin.status === "CRITICAL" ? "bg-error" : bin.status === "HIGH" ? "bg-warning" : "bg-primary")}
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
                        bin.status === "HIGH" && "badge-warning"
                      )}>
                        {bin.status}
                      </span>
                    </td>
                    <td>
                      <span className={cn(
                        "badge",
                        bin.status === "CRITICAL" && "badge-error",
                        bin.status === "HIGH" && "badge-warning"
                      )}>
                        {bin.status === "CRITICAL" ? "URGENT" : "HIGH"}
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
  );
}