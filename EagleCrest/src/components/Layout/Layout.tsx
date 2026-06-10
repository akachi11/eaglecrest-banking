import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '../SideBar/Sidebar'
import { Topbar } from '../Topbar/Topbar'
import { BankingProvider } from '../../context/BankingContext'
import { NotificationProvider } from '../../context/NotificationContext'
import { LiveChat } from '../LiveChat/LiveChat'

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <BankingProvider>
      <NotificationProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <div className="flex flex-col flex-1 overflow-hidden min-w-0">
            <Topbar onMenuClick={() => setSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-7 pt-5 lg:pt-7 pb-10 bg-bg-base">
              <Outlet />
            </main>
          </div>
        </div>
        <LiveChat />
      </NotificationProvider>
    </BankingProvider>
  )
}
