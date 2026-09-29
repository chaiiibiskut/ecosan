export function SanitizationIndex() {
  return (
    <div className="space-y-space-lg">
      <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm">
        <h2 className="font-display font-bold text-headline-lg text-on-surface mb-space-md">
          Sanitization Index
        </h2>
        <p className="text-body-md text-on-surface-variant">
          This page will display SVI gauges, site list, supply tracker, and trigger actions.
        </p>
        <div className="mt-space-lg grid grid-cols-1 lg:grid-cols-3 gap-space-lg">
          <div className="lg:col-span-2 space-y-space-md">
            <div className="card p-space-lg">
              <div className="flex items-center justify-between mb-space-md">
                <h3 className="font-display font-bold text-headline-sm text-on-surface">Sanitization System</h3>
                <span className="status-badge-info">AUTO-PILOT</span>
              </div>
              <div className="space-y-space-md">
                {[
                  { label: 'Odor & Ammonia Neutralization', icon: 'air', value: 94, color: 'primary', detail: 'Enzymatic mist sprays deployed at 18 hubs' },
                  { label: 'UV-C Microbial Kill Rate', icon: 'wb_iridescent', value: 99.7, color: 'tertiary', detail: 'Public washrooms sanitized every 45 mins' },
                  { label: 'Touchless Chute Decontamination', icon: 'wash', value: 88, color: 'secondary', detail: 'Hydro-peroxide cartridges at 88/88 bins operational' },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-label-sm">
                      <span className="text-on-surface font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]" style={{ color: `var(--color-${item.color})` }}>{item.icon}</span>
                        {item.label}
                      </span>
                      <span className="font-bold" style={{ color: `var(--color-${item.color})` }}>{item.value}%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2 overflow-hidden">
                      <div style={{ backgroundColor: `var(--color-${item.color})`, width: `${item.value}%` }} className="h-full rounded-full"></div>
                    </div>
                    <span className="text-body-sm text-[11px] text-on-surface-variant block">{item.detail}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="card p-space-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[20px] text-primary">water_drop</span>
                  <div>
                    <p className="text-label-sm font-bold text-on-surface">Sanitizer Supply Buffer</p>
                    <p className="text-body-sm text-[11px] text-on-surface-variant">Central reservoir: 4,820 Liters</p>
                  </div>
                </div>
                <button className="btn-secondary text-sm px-3 py-1.5">Order Refill</button>
              </div>
            </div>
          </div>
          <div className="space-y-space-md">
            <div className="card p-space-lg">
              <div className="flex items-center justify-between mb-space-md">
                <h3 className="font-display font-bold text-headline-sm text-on-surface">Sites Overview</h3>
                <span className="text-label-sm font-bold text-primary">18 Active</span>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-surface-container">
                    <div className="flex items-center gap-3">
                      <span className="w-2 h-2 rounded-full bg-success"></span>
                      <div>
                        <p className="text-body-sm text-on-surface">Sanitization Site #{i}</p>
                        <p className="text-body-sm text-[11px] text-on-surface-variant">Last: 15 min ago • UV-C Active</p>
                      </div>
                    </div>
                    <button className="btn-secondary text-sm px-2 py-1">Trigger</button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}