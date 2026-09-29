export function AISegregationHub() {
  return (
    <div className="space-y-space-lg">
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
        <h2 className="font-display font-bold text-headline-lg text-on-surface mb-space-md">
          AI Segregation Hub
        </h2>
        <p className="text-body-md text-on-surface-variant">
          This page will display the conveyor vision, classification feed, and AI presets.
        </p>
        <div className="mt-space-lg grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
          <div className="lg:col-span-2 card p-space-lg">
            <p className="text-label-md text-on-surface-variant">Conveyor Vision Stream</p>
            <div className="mt-4 h-80 bg-inverse-surface rounded-xl flex items-center justify-center">
              <span className="text-on-surface-variant">Camera Feed Placeholder</span>
            </div>
          </div>
          <div className="space-y-space-md">
            <div className="card p-space-md">
              <p className="text-label-md text-on-surface-variant">Live Classifications</p>
              <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2 bg-surface-container rounded-lg">
                    <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <span className="material-symbols-outlined">recycling</span>
                    </span>
                    <div className="flex-1">
                      <p className="text-body-sm text-on-surface">Classification {i}</p>
                      <p className="text-body-sm text-on-surface-variant">98.4% confidence</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-space-md">
              <p className="text-label-md text-on-surface-variant">AI Presets</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {['Municipal Mixed', 'High-Precision Polymer', 'Biomedical Pre-Filter'].map((preset) => (
                  <span key={preset} className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface text-label-sm">
                    {preset}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}