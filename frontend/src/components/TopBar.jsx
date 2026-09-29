import { useState } from 'react'
import { LeafLogo } from './LeafLogo'

export function TopBar({ onMenuClick, pageTitle }) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-30 bg-surface-container-lowest/80 backdrop-blur-md border-b border-outline-variant lg:ml-64">
      <div className="flex items-center justify-between h-16 px-space-lg lg:px-space-xl gap-space-md">
        <div className="flex items-center gap-space-md lg:hidden">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Open navigation menu"
            aria-expanded="false"
          >
            <span className="material-symbols-outlined text-[24px] text-on-surface" aria-hidden="true">menu</span>
          </button>
          <Link to="/live-operations" className="flex items-center gap-2">
            <LeafLogo size={28} className="text-primary" />
            <span className="font-display font-bold text-headline-sm text-on-surface hidden sm:block">EcoSan</span>
          </Link>
        </div>

        <div className="flex-1 lg:flex-none">
          <h1 className="font-display font-bold text-headline-md text-on-surface truncate">
            {pageTitle}
          </h1>
        </div>

        <div className="flex items-center gap-space-sm">
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
            <span className="material-symbols-outlined text-[16px] text-primary animate-pulse" aria-hidden="true">sync</span>
            <span>Live</span>
          </div>

          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 rounded-lg hover:bg-surface-container transition-colors"
            aria-label="Notifications"
            aria-expanded={notificationsOpen}
          >
            <span className="material-symbols-outlined text-[24px] text-on-surface" aria-hidden="true">notifications</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-error text-on-error text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface-container transition-colors"
              aria-label="User menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-primary" aria-hidden="true">person</span>
              </div>
              <span className="hidden md:block font-label-md text-label-md text-on-surface">Admin</span>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant hidden md:block" aria-hidden="true">expand_more</span>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} aria-hidden="true" />
                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-level-3 py-2 z-50">
                  <div className="px-3 py-2 border-b border-outline-variant">
                    <p className="font-label-md text-label-md text-on-surface">Administrator</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">ecosan@municipal.gov</p>
                  </div>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-on-surface hover:bg-surface-container font-body-md text-body-md">
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">settings</span>
                    Settings
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-on-surface hover:bg-surface-container font-body-md text-body-md">
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">help</span>
                    Help & Docs
                  </button>
                  <hr className="my-2 border-outline-variant" />
                  <button className="w-full flex items-center gap-3 px-3 py-2 text-error hover:bg-error/10 font-body-md text-body-md">
                    <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

import { Link } from 'react-router-dom'