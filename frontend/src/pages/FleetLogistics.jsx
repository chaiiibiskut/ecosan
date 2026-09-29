export function FleetLogistics() {
  return (
    <div className="space-y-space-lg">
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
        <h2 className="font-display font-bold text-headline-lg text-on-surface mb-space-md">
          Fleet Logistics
        </h2>
        <p className="text-body-md text-on-surface-variant">
          This page will display vehicle cards, route map, and re-route functionality.
        </p>
        <div className="mt-space-lg grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          <div className="space-y-space-md">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="card p-space-md">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display font-bold text-headline-sm text-on-surface">Unit EV-0{i}</p>
                    <p className="text-body-sm text-on-surface-variant">Electric Collector • 6.2T Cap</p>
                  </div>
                  <span className="status-badge-success">EN ROUTE</span>
                </div>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-label-sm">
                    <span className="text-on-surface-variant">Assigned Cluster: <strong>Sector {i}</strong></span>
                    <span className="font-bold text-error">2 Bins Critical</span>
                  </div>
                  <div className="w-full bg-surface-container-highest rounded-full h-2 overflow-hidden">
                    <div className="bg-primary h-full" style={{ width: `${60 + i * 5}%` }}></div>
                  </div>
                  <div className="flex justify-between text-body-sm text-on-surface-variant">
                    <span>{60 + i * 5}% Payload Loaded</span>
                    <span>ETA: <strong>{5 + i * 3} mins</strong></span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <button className="btn-secondary text-sm px-3 py-1.5">Re-Route</button>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-space-lg">
            <p className="text-label-md text-on-surface-variant">Route Map</p>
            <div className="mt-4 h-96 bg-surface-container-highest rounded-xl flex items-center justify-center">
              <span className="text-on-surface-variant">Leaflet Map Placeholder</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}