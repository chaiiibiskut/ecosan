import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { BottomNav } from './BottomNav'

const pageTitles = {
  '/live-operations': 'Live Operations',
  '/ai-segregation-hub': 'AI Segregation Hub',
  '/fleet-logistics': 'Fleet Logistics',
  '/sanitization-index': 'Sanitization Index',
  '/analytics': 'Analytics',
}

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = window.location.pathname
  const pageTitle = pageTitles[location] || 'EcoSan Intelligence'

  return (
    <div className="min-h-screen bg-background">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(true)} pageTitle={pageTitle} />
      <main className="lg:ml-64 pb-20 lg:pb-0 min-h-[calc(100vh-4rem)]">
        <div className="p-space-lg lg:p-space-xl pt-4 lg:pt-0">
          <Outlet />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}