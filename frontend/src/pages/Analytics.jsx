export function Analytics() {
  return (
    <div className="space-y-space-lg">
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
        <h2 className="font-display font-bold text-headline-lg text-on-surface mb-space-md">
          Analytics
        </h2>
        <p className="text-body-md text-on-surface-variant">
          This page will display charts for waste trends, segregation accuracy, and diversion rates.
        </p>
        <div className="mt-space-lg grid grid-cols-1 lg:grid-cols-4 gap-space-md">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card p-space-md">
              <p className="text-label-md uppercase tracking-wider text-on-surface-variant font-semibold">Metric {i}</p>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="font-display font-bold text-headline-xl text-on-surface">—</span>
                <span className="text-label-lg text-on-surface-variant font-medium">units</span>
              </div>
              <div className="mt-2 w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: `${20 * i}%` }}></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-space-lg grid grid-cols-1 lg:grid-cols-2 gap-space-lg">
          <div className="card p-space-lg">
            <h3 className="font-display font-bold text-headline-sm text-on-surface mb-space-md">Waste Trends (7 Days)</h3>
            <div className="h-64 bg-surface-container-highest rounded-xl flex items-center justify-center">
              <span className="text-on-surface-variant">Recharts Line Chart Placeholder</span>
            </div>
          </div>
          <div className="card p-space-lg">
            <h3 className="font-display font-bold text-headline-sm text-on-surface mb-space-md">Segregation Accuracy</h3>
            <div className="h-64 bg-surface-container-highest rounded-xl flex items-center justify-center">
              <span className="text-on-surface-variant">Recharts Bar Chart Placeholder</span>
            </div>
          </div>
          <div className="card p-space-lg">
            <h3 className="font-display font-bold text-headline-sm text-on-surface mb-space-md">Landfill Diversion Rate</h3>
            <div className="h-64 bg-surface-container-highest rounded-xl flex items-center justify-center">
              <span className="text-on-surface-variant">Recharts Area Chart Placeholder</span>
            </div>
          </div>
          <div className="card p-space-lg">
            <h3 className="font-display font-bold text-headline-sm text-on-surface mb-space-md">Fleet Efficiency</h3>
            <div className="h-64 bg-surface-container-highest rounded-xl flex items-center justify-center">
              <span className="text-on-surface-variant">Recharts Pie Chart Placeholder</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}