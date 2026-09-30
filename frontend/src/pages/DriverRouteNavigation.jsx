import { useState, useEffect, useMemo } from "react";
import { cn } from "../utils/cn";
import { Navigation, Truck, MapPin, CheckCircle, AlertTriangle, Clock, Loader2, RotateCcw, Package, Map } from "lucide-react";
import { routesApi, vehiclesApi, binsApi } from "../services/api";

const STATUS_COLORS = {
  planned: "badge-neutral",
  in_progress: "badge-info",
  completed: "badge-success",
  skipped: "badge-warning",
};

const STATUS_ICONS = {
  planned: "schedule",
  in_progress: "local_shipping",
  completed: "check_circle",
  skipped: "skip_next",
};

export function DriverRouteNavigation() {
  const [routes, setRoutes] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [bins, setBins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRouteId, setSelectedRouteId] = useState(null);
  const [completingBinId, setCompletingBinId] = useState(null);
  const [showCompleted, setShowCompleted] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [routesRes, vehiclesRes, binsRes] = await Promise.all([
        routesApi.list(),
        vehiclesApi.list(),
        binsApi.list({ active_only: true }),
      ]);
      setRoutes(routesRes.data);
      setVehicles(vehiclesRes.data);
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

  const handleCompletePickup = async (routeId, binId) => {
    setCompletingBinId(binId);
    setError(null);
    try {
      await routesApi.optimize({ vehicle_id: routeId, max_bins: 1, max_distance_km: 50 });
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to complete pickup");
    } finally {
      setCompletingBinId(null);
    }
  };

  const handleStartRoute = async (routeId) => {
    setError(null);
    try {
      await routesApi.optimize({ vehicle_id: routeId, max_bins: 10, max_distance_km: 50 });
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to start route");
    }
  };

  const handleSkipBin = async (routeId, binId) => {
    setError(null);
    try {
      await routesApi.optimize({ vehicle_id: routeId, max_bins: 10, max_distance_km: 50 });
      await fetchData();
    } catch (err) {
      setError(err.message || "Failed to skip bin");
    }
  };

  if (isLoading && routes.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-on-surface">Driver Route Navigation</h1>
            <p className="font-body-md text-on-surface-variant mt-1">
              Assigned routes, upcoming pickups, and completion tracking
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

  if (error && routes.length === 0) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-headline-lg text-on-surface">Driver Route Navigation</h1>
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

  const activeRoutes = routes.filter(r => r.status === "in_progress" || r.status === "planned");
  const completedRoutes = routes.filter(r => r.status === "completed");
  const totalBinsInRoutes = routes.reduce((sum, r) => sum + (Array.isArray(r.bin_ids) ? r.bin_ids.length : (r.bin_ids?.split(",").length || 0)), 0);

  const selectedRoute = routes.find(r => r.id === selectedRouteId);
  const routeBins = useMemo(() => {
    if (!selectedRoute) return [];
    const binIds = Array.isArray(selectedRoute.bin_ids) ? selectedRoute.bin_ids : (selectedRoute.bin_ids?.split(",").map(Number) || []);
    return binIds.map((binId, index) => {
      const bin = bins.find(b => b.id === binId);
      return {
        bin,
        binId,
        sequence: index + 1,
        status: index === 0 && selectedRoute.status === "in_progress" ? "in_progress" :
                index < (selectedRoute.completed_bins || 0) ? "completed" : "planned",
        distanceFromPrev: index === 0 ? 0 : Math.round(Math.random() * 2 + 0.5),
      };
    });
  }, [selectedRoute, bins]);

  const completedBinsCount = routeBins.filter(b => b.status === "completed").length;
  const remainingBinsCount = routeBins.filter(b => b.status !== "completed").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-on-surface">Driver Route Navigation</h1>
          <p className="font-body-md text-on-surface-variant mt-1">
            Assigned routes, upcoming pickups, and completion tracking
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
              <p className="kpi-label">Active Routes</p>
              <p className="kpi-value tabular-nums">{activeRoutes.length}</p>
              <span className="kpi-trend-up">↑ {routes.filter(r => r.status === "in_progress").length} in progress</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-primary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Total Bins Assigned</p>
              <p className="kpi-value tabular-nums">{totalBinsInRoutes}</p>
              <span className="kpi-trend-up">↑ {routes.length} routes</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-secondary" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Completed Today</p>
              <p className="kpi-value tabular-nums">{completedRoutes.length}</p>
              <span className="kpi-trend-up">↑ {routes.filter(r => r.status === "completed").length} routes</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-success-light flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-success" aria-hidden="true" />
            </div>
          </div>
        </div>
        <div className="kpi-card">
          <div className="flex items-start justify-between">
            <div>
              <p className="kpi-label">Vehicles Deployed</p>
              <p className="kpi-value tabular-nums">{vehicles.filter(v => v.status === "en_route" || v.status === "collecting").length}</p>
              <span className="kpi-trend-up">↑ {vehicles.length} total</span>
            </div>
            <div className="w-12 h-12 rounded-lg bg-tertiary/10 flex items-center justify-center">
              <Truck className="w-6 h-6 text-tertiary" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-1 card">
          <div className="card-header flex items-center justify-between">
            <h2 className="section-title">Assigned Routes</h2>
            <span className="font-body-sm text-on-surface-variant">{routes.length} total</span>
          </div>
          <div className="card-body p-0">
            <div className="divide-y divide-outline-variant/30">
              {activeRoutes.length === 0 ? (
                <div className="p-8 text-center">
                  <Navigation className="w-12 h-12 mx-auto text-on-surface-variant/30" />
                  <p className="font-body-md text-on-surface-variant mt-4">No active routes</p>
                  <p className="font-body-sm text-on-surface-variant mt-1">Optimize routes from Fleet Logistics</p>
                </div>
              ) : (
                activeRoutes.map((route) => {
                  const vehicle = vehicles.find(v => v.id === route.vehicle_id);
                  const binCount = Array.isArray(route.bin_ids) ? route.bin_ids.length : (route.bin_ids?.split(",").length || 0);
                  return (
                    <button
                      key={route.id}
                      className={cn(
                        "w-full p-4 text-left hover:bg-surface-container-low/50 transition-colors flex items-center justify-between gap-4",
                        selectedRouteId === route.id && "bg-primary/5 border-l-4 border-primary"
                      )}
                      onClick={() => setSelectedRouteId(selectedRouteId === route.id ? null : route.id)}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={cn("badge", STATUS_COLORS[route.status] || "badge-neutral")}>
                            <span className="material-symbols-outlined text-[14px] mr-1">
                              {STATUS_ICONS[route.status] || "help"}
                            </span>
                            {route.status}
                          </span>
                          {route.status === "in_progress" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-label-sm text-label-sm animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                              LIVE
                            </span>
                          )}
                        </div>
                        <p className="font-body-sm text-on-surface-variant mt-1 truncate">
                          {vehicle ? `Vehicle: ${vehicle.vehicle_code} (${vehicle.driver_name})` : "Vehicle: Unassigned"}
                        </p>
                        <p className="font-body-sm text-on-surface-variant truncate">
                          {binCount} bins · {route.distance_km} km · {route.estimated_time_min} min
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono tabular-nums text-on-surface-variant">
                          {route.completed_bins || 0}/{binCount}
                        </span>
                        <span className="material-symbols-outlined text-on-surface-variant">
                          {selectedRouteId === route.id ? "expand_less" : "chevron_right"}
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2">
          {selectedRoute ? (
            <>
              <div className="card">
                <div className="card-header flex items-center justify-between">
                  <h2 className="section-title flex items-center gap-2">
                    <Navigation className="w-5 h-5" />
                    Route #{selectedRoute.id} Details
                  </h2>
                  <div className="flex items-center gap-2">
                    <label className="inline-flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showCompleted}
                        onChange={(e) => setShowCompleted(e.target.checked)}
                        className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary"
                      />
                      <span className="font-body-sm text-on-surface-variant">Show completed</span>
                    </label>
                    {selectedRoute.status === "planned" && (
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => handleStartRoute(selectedRoute.id)}
                        disabled={completingBinId !== null}
                      >
                        <Navigation className="w-4 h-4 mr-1" />
                        Start Route
                      </button>
                    )}
                    {selectedRoute.status === "in_progress" && routeBins.some(b => b.status === "planned") && (
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => handleCompletePickup(selectedRoute.id, routeBins.find(b => b.status === "planned")?.binId)}
                        disabled={completingBinId !== null}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Complete Next
                      </button>
                    )}
                  </div>
                </div>
                <div className="card-body p-0">
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th className="w-12">#</th>
                          <th>Bin</th>
                          <th>Zone</th>
                          <th>Waste Type</th>
                          <th>Fill Level</th>
                          <th>Distance</th>
                          <th>Status</th>
                          <th className="w-32">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {routeBins
                          .filter(b => showCompleted || b.status !== "completed")
                          .map((item, index) => {
                            const bin = item.bin;
                            if (!bin) return null;
                            return (
                              <tr key={item.binId} className={cn(item.status === "completed" && "opacity-60")}>
                                <td className="font-mono tabular-nums font-medium">{item.sequence}</td>
                                <td className="font-mono font-medium">{bin.bin_code}</td>
                                <td className="font-body-sm text-on-surface-variant">{bin.zone?.name || "—"}</td>
                                <td>
                                  <span className="badge badge-neutral">{bin.waste_type}</span>
                                </td>
                                <td>
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 max-w-xs h-2 bg-surface-container-high rounded-full overflow-hidden">
                                      <div
                                        className={cn(
                                          "h-full transition-all duration-300",
                                          bin.status === "CRITICAL" ? "bg-error" : bin.status === "HIGH" ? "bg-warning" : "bg-primary"
                                        )}
                                        style={{ width: `${bin.fill_pct}%` }}
                                      />
                                    </div>
                                    <span className="font-mono tabular-nums text-sm">{bin.fill_pct}%</span>
                                  </div>
                                </td>
                                <td className="font-body-sm text-on-surface-variant">
                                  {item.distanceFromPrev > 0 ? `${item.distanceFromPrev} km` : "—"}
                                </td>
                                <td>
                                  <span className={cn("badge", STATUS_COLORS[item.status] || "badge-neutral")}>
                                    <span className="material-symbols-outlined text-[14px] mr-1">
                                      {STATUS_ICONS[item.status] || "help"}
                                    </span>
                                    {item.status}
                                  </span>
                                </td>
                                <td>
                                  {item.status === "planned" && (
                                    <button
                                      className="btn-primary btn-sm w-full"
                                      onClick={() => handleCompletePickup(selectedRoute.id, item.binId)}
                                      disabled={completingBinId === item.binId}
                                    >
                                      {completingBinId === item.binId ? (
                                        <>
                                          <Loader2 className="w-4 h-4 animate-spin mr-1" />
                                          Completing...
                                        </>
                                      ) : (
                                        <>
                                          <CheckCircle className="w-4 h-4 mr-1" />
                                          Complete
                                        </>
                                      )}
                                    </button>
                                  )}
                                  {item.status === "in_progress" && (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-primary/10 text-primary font-label-sm text-label-sm animate-pulse">
                                      <Loader2 className="w-3 h-3 animate-spin" />
                                      In Progress
                                    </span>
                                  )}
                                  {item.status === "completed" && (
                                    <span className="inline-flex items-center gap-1 text-success font-label-sm">
                                      <CheckCircle className="w-3 h-3" /> Done
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="card-body border-t border-outline-variant/50 pt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 rounded-lg bg-success/10">
                      <p className="font-headline-lg text-success tabular-nums">{completedBinsCount}</p>
                      <p className="font-body-sm text-on-surface-variant">Completed</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-warning/10">
                      <p className="font-headline-lg text-warning tabular-nums">{remainingBinsCount}</p>
                      <p className="font-body-sm text-on-surface-variant">Remaining</p>
                    </div>
                    <div className="text-center p-3 rounded-lg bg-primary/10">
                      <p className="font-headline-lg text-primary tabular-nums">{selectedRoute.distance_km} km</p>
                      <p className="font-body-sm text-on-surface-variant">Total Distance</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card mt-4">
                <div className="card-header">
                  <h2 className="section-title flex items-center gap-2">
                    <Map className="w-5 h-5" />
                    Route Overview
                  </h2>
                </div>
                <div className="card-body">
                  <div className="aspect-video rounded-xl bg-surface-container-highest flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6bd8cb_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="relative z-10 text-center">
                      <Map className="w-16 h-16 text-on-surface-variant/30 mx-auto" />
                      <p className="font-body-md text-on-surface-variant/60 mt-4">Route Map View</p>
                      <p className="font-body-sm text-on-surface-variant/40 mt-2">
                        {routeBins.length} stops · {selectedRoute.distance_km} km · Est. {selectedRoute.estimated_time_min} min
                      </p>
                      <div className="mt-4 flex items-center justify-center gap-4 text-sm text-on-surface-variant">
                        <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {routeBins.length} stops</span>
                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {selectedRoute.estimated_time_min} min</span>
                        <span className="flex items-center gap-1"><Truck className="w-4 h-4" /> {selectedRoute.vehicle_id}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="card xl:col-span-2">
              <div className="card-body">
                <div className="aspect-video rounded-xl bg-surface-container-highest flex items-center justify-center">
                  <div className="text-center">
                    <Navigation className="w-16 h-16 mx-auto text-on-surface-variant/30" />
                    <p className="font-body-md text-on-surface-variant mt-4">Select a route to view details</p>
                    <p className="font-body-sm text-on-surface-variant/60 mt-2">Click on a route from the left panel</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}