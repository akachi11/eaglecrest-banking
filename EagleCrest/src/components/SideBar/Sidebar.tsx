import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '../index';
import { navItems } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import type { NavItem } from '../../types';

const navItemBase =
  'flex items-center gap-2.5 px-4 py-[9px] w-full text-left text-[13px] text-text-secondary bg-transparent border-none border-l-2 border-l-transparent cursor-pointer transition-colors duration-150 font-body hover:text-text-primary hover:bg-bg-elevated';
const navItemActive = 'text-gold bg-gold/[0.07] border-l-gold';

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open = false, onClose }) => {
  const mainNav = navItems.slice(0, 4);
  const financeNav = navItems.slice(4);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const go = (path: string) => {
    navigate(path);
    onClose?.();
  };

  const handleLogout = () => {
    logout();
    navigate('/', { replace: true });
  };

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : 'EC';

  const displayName = user?.name
    ? user.name.split(' ')[0] + (user.name.split(' ')[1] ? ' ' + user.name.split(' ')[1][0] + '.' : '')
    : 'Account';

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-[200] lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-[201] w-[200px] bg-bg-card border-r border-border flex flex-col h-full shrink-0 transition-transform duration-200 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}
        aria-label="Main navigation"
      >
        <nav className="flex-1 pt-5 pb-2 flex flex-col gap-0.5">
          <div className="px-4 mt-2 mb-1 text-[10px] tracking-[0.16em] uppercase text-text-muted">Main</div>
          {mainNav.map((item) => (
            <NavLink
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
              onClick={() => go(item.path)}
            />
          ))}

          <div className="px-4 mt-2 mb-1 text-[10px] tracking-[0.16em] uppercase text-text-muted" style={{ marginTop: 8 }}>Finance</div>
          {financeNav.map((item) => (
            <NavLink
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
              onClick={() => go(item.path)}
            />
          ))}
        </nav>

        <div className="pt-2 border-t border-border">
          <button className={navItemBase} onClick={() => go('/settings')}>
            <i className="ti ti-settings" style={{ fontSize: 16 }} aria-hidden="true" />
            Settings
          </button>
          <button
            className={`${navItemBase} text-danger hover:text-danger hover:bg-danger/[0.06]`}
            onClick={handleLogout}
          >
            <i className="ti ti-logout" style={{ fontSize: 16 }} aria-hidden="true" />
            Sign Out
          </button>
          <div className="flex items-center gap-2.5 px-4 py-3.5">
            <Avatar initials={initials} size="sm" status="online" />
            <div className="min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{displayName}</p>
              <span className="text-[11px] text-text-muted">Private Account</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

const NavLink: React.FC<{ item: NavItem; isActive: boolean; onClick: () => void }> = ({
  item,
  isActive,
  onClick,
}) => (
  <button
    className={`${navItemBase} ${isActive ? navItemActive : ''}`}
    onClick={onClick}
    aria-current={isActive ? 'page' : undefined}
  >
    <i className={`ti ${item.icon}`} style={{ fontSize: 16 }} aria-hidden="true" />
    {item.label}
  </button>
);
