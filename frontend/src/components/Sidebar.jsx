import { NavLink, useLocation } from 'react-router-dom'
import { LeafLogo } from './LeafLogo'
import { Link } from 'react-router-dom'

const navItems = [
  { path: '/live-operations', label: 'Live Operations', icon: 'dashboard' },
  { path: '/ai-segregation-hub', label: 'AI Segregation Hub', icon: 'psychology' },
  { path: '/fleet-logistics', label: 'Fleet Logistics', icon: 'local_shipping' },
  { path: '/sanitization-index', label: 'Sanitization Index', icon: 'sanitizer' },
  { path: '/analytics', label: 'Analytics', icon: 'analytics' },
]

export function Sidebar({ isOpen, onClose }) {
  const location = useLocation()

  return (
    <>
      <div
        className={`fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-40 lg:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-surface-container-lowest border-r border-outline-variant transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          <div className="p-space-lg border-b border-outline-variant">
            <Link to="/live-operations" className="flex items-center gap-3" onClick={onClose}>
              <LeafLogo size={40} className="text-primary" />
              <span className="font-display font-bold text-headline-sm text-on-surface">EcoSan</span>
            </Link>
            <p className="mt-1 font-body-sm text-body-sm text-on-surface-variant">Intelligence Platform</p>
          </div>

          <nav className="flex-1 p-space-md space-y-1 overflow-y-auto" role="menubar">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                role="menuitem"
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`
                }
                aria-current={({ isActive }) => (isActive ? 'page' : undefined)}
              >
                <span className="material-symbols-outlined text-[22px] flex-shrink-0" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div className="p-space-md border-t border-outline-variant">
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-container">
              <span className="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">
                sync
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-label-sm text-label-sm text-on-surface">System Status</p>
                <p className="font-body-sm text-body-sm text-primary flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" aria-hidden="true"></span>
                  Synced • Just now
                </p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}