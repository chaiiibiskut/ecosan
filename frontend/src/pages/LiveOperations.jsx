export function LiveOperations() {
  return (
    <div className="space-y-space-lg">
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
        <h2 className="font-display font-bold text-headline-lg text-on-surface mb-space-md">
          Live Operations
        </h2>
        <p className="text-body-md text-on-surface-variant">
          This page will display the bin grid, map, alerts, and KPIs for real-time waste monitoring.
        </p>
        <div className="mt-space-lg grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-space-md">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-space-md">
              <p className="text-label-md text-on-surface-variant">KPI Card {i}</p>
              <p className="font-display font-bold text-headline-xl text-on-surface mt-2">—</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}