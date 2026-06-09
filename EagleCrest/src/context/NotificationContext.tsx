import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { notificationApi, type ApiNotification } from '../lib/api'
import { useAuth } from './AuthContext'

interface NotificationContextValue {
  notifications: ApiNotification[]
  unreadCount: number
  loading: boolean
  refreshNotifications: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
  remove: (id: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextValue | null>(null)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token } = useAuth()
  const [notifications, setNotifications] = useState<ApiNotification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)

  const refreshNotifications = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const data = await notificationApi.list(token)
      setNotifications(data.notifications)
      setUnreadCount(data.unreadCount)
    } catch {
      // non-critical, silently fail
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    refreshNotifications()
  }, [refreshNotifications])

  const markRead = async (id: string) => {
    if (!token) return
    try {
      await notificationApi.markRead(token, id)
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      )
      setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      // ignore
    }
  }

  const markAllRead = async () => {
    if (!token) return
    try {
      await notificationApi.markAllRead(token)
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch {
      // ignore
    }
  }

  const remove = async (id: string) => {
    if (!token) return
    const target = notifications.find((n) => n._id === id)
    try {
      await notificationApi.delete(token, id)
      setNotifications((prev) => prev.filter((n) => n._id !== id))
      if (target && !target.read) setUnreadCount((c) => Math.max(0, c - 1))
    } catch {
      // ignore
    }
  }

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, loading, refreshNotifications, markRead, markAllRead, remove }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => {
  const ctx = useContext(NotificationContext)
  if (!ctx) throw new Error('useNotifications must be used inside NotificationProvider')
  return ctx
}
