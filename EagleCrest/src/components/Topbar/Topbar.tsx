import React, { useEffect, useRef, useState } from 'react'
import { Avatar } from '../index'
import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'

interface TopbarProps {
  onMenuClick?: () => void
}

const iconBtn =
  'w-9 h-9 rounded-md border border-border bg-bg-elevated flex items-center justify-center cursor-pointer text-text-secondary transition-colors duration-150 relative shrink-0 hover:border-border-strong hover:text-gold'

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const { user } = useAuth()
  const { notifications, unreadCount, markRead, markAllRead, remove } = useNotifications()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'EC'

  // close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <header className="flex items-center justify-between gap-3 px-4 sm:px-6 h-[54px] bg-bg-card border-b border-border shrink-0 sticky top-0 z-[100]">
      <div className="flex items-center gap-3 min-w-0">
        <button className={`${iconBtn} lg:hidden`} aria-label="Open navigation" onClick={onMenuClick}>
          <i className="ti ti-menu-2" style={{ fontSize: 18 }} aria-hidden="true" />
        </button>
        <div
          className="font-display text-lg font-semibold text-gold tracking-[0.06em] select-none truncate"
          aria-label="EagleCrest Banking"
        >
          EAGLECREST
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Notification bell */}
        <div className="relative" ref={panelRef}>
          <button
            className={`${iconBtn}${unreadCount > 0 ? ' after:content-[""] after:absolute after:top-[7px] after:right-[7px] after:w-1.5 after:h-1.5 after:rounded-full after:bg-gold after:border-[1.5px] after:border-bg-card' : ''}`}
            aria-label="Notifications"
            onClick={() => setOpen((v) => !v)}
          >
            <i className="ti ti-bell" style={{ fontSize: 16 }} aria-hidden="true" />
          </button>

          {open && (
            <div className="absolute right-0 top-[calc(100%+8px)] w-[340px] max-h-[480px] bg-bg-card border border-border rounded-xl shadow-2xl flex flex-col overflow-hidden z-[200]">
              {/* panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-text-primary">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[11px] font-mono bg-gold/20 text-gold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllRead()}
                    className="text-xs text-text-muted hover:text-gold transition-colors duration-150"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              {/* notification list */}
              <div className="overflow-y-auto flex-1">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-12 text-text-muted">
                    <i className="ti ti-bell-off" style={{ fontSize: 28 }} aria-hidden="true" />
                    <p className="text-sm">No notifications</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`flex items-start gap-3 px-4 py-3.5 border-b border-border last:border-b-0 transition-colors duration-150 ${
                        !n.read ? 'bg-gold/[0.03]' : ''
                      }`}
                    >
                      {/* icon */}
                      <span
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                        style={{ background: `${n.iconColor}18`, color: n.iconColor }}
                      >
                        <i className={`ti ${n.icon}`} style={{ fontSize: 15 }} aria-hidden="true" />
                      </span>

                      {/* text */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className={`text-sm leading-snug ${!n.read ? 'text-text-primary font-medium' : 'text-text-secondary'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] text-text-muted shrink-0 mt-0.5">{timeAgo(n.createdAt)}</span>
                        </div>
                        {n.body && (
                          <p className="text-xs text-text-muted mt-0.5 leading-relaxed line-clamp-2">{n.body}</p>
                        )}
                      </div>

                      {/* actions */}
                      <div className="flex flex-col gap-1 shrink-0">
                        {!n.read && (
                          <button
                            onClick={() => markRead(n._id)}
                            className="text-text-muted hover:text-gold transition-colors duration-150"
                            title="Mark read"
                          >
                            <i className="ti ti-check" style={{ fontSize: 13 }} aria-hidden="true" />
                          </button>
                        )}
                        <button
                          onClick={() => remove(n._id)}
                          className="text-text-muted hover:text-danger transition-colors duration-150"
                          title="Dismiss"
                        >
                          <i className="ti ti-x" style={{ fontSize: 13 }} aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button className={`${iconBtn} hidden sm:flex`} aria-label="Search">
          <i className="ti ti-search" style={{ fontSize: 16 }} aria-hidden="true" />
        </button>
        <Avatar initials={initials} size="sm" />
      </div>
    </header>
  )
}
