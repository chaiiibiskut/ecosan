import { NavLink, useLocation } from 'react-router-dom'

const navItems = [
  { path: '/live-operations', label: 'Live Ops', icon: 'dashboard' },
  { path: '/ai-segregation-hub', label: 'AI Hub', icon: 'psychology' },
  { path: '/fleet-logistics', label: 'Fleet', icon: 'local_shipping' },
  { path: '/sanitization-index', label: 'Sanitize', icon: 'sanitizer' },
  { path: '/analytics', label: 'Analytics', icon: 'analytics' },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-container-lowest border-t border-outline-variant lg:hidden" role="navigation" aria-label="Bottom navigation">
      <div className="grid grid-cols-5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            role="menuitem"
            className={({ isActive }) =>
              `bottom-nav-item ${isActive ? 'bottom-nav-item-active' : ''}`
            }
            aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
            aria-label={item.label}
          >
            <span className="material-symbols-outlined text-[24px]" aria-hidden="true">
              {item.icon}
            </span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}