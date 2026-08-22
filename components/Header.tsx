'use client'

import { Ticket, UserRound, Menu } from 'lucide-react'

interface HeaderProps {
  stage: string
  category: string
  currentUser: any
  onNavigate: (stage: 'browse' | 'bookings' | 'admin', category?: string) => void
  onOpenUserModal: () => void
  onToggleMobileMenu: () => void
}

export function Header({
  stage,
  category,
  currentUser,
  onNavigate,
  onOpenUserModal,
  onToggleMobileMenu,
}: HeaderProps) {
  return (
    <header>
      <div className="logo" onClick={() => onNavigate('browse', 'All events')}>
        <span className="logo-mark"><Ticket size={19} /></span>
        ticket<span>hub</span>
      </div>

      <nav>
        <button
          className={stage === 'browse' && category === 'All events' ? 'active' : ''}
          onClick={() => onNavigate('browse', 'All events')}
        >
          Discover
        </button>
        <button
          className={stage === 'browse' && category === 'Movies' ? 'active' : ''}
          onClick={() => onNavigate('browse', 'Movies')}
        >
          Movies
        </button>
        <button
          className={stage === 'browse' && category === 'Upcoming' ? 'active' : ''}
          onClick={() => onNavigate('browse', 'Upcoming')}
        >
          Upcoming
        </button>
        <button
          className={stage === 'browse' && category === 'Concerts' ? 'active' : ''}
          onClick={() => onNavigate('browse', 'Concerts')}
        >
          Concerts
        </button>
        <button
          className={stage === 'bookings' ? 'active' : ''}
          onClick={() => onNavigate('bookings')}
        >
          My Bookings
        </button>
        {currentUser.role === 'ADMIN' && (
          <button
            className={stage === 'admin' ? 'active' : ''}
            onClick={() => onNavigate('admin')}
          >
            Admin Dashboard
          </button>
        )}
      </nav>

      <div className="header-actions">
        <button className="user-badge-btn" onClick={onOpenUserModal} title="Switch User / View Profile">
          <UserRound size={15} />
          <span>{currentUser.name.split(' ')[0]}</span>
          <span className="role-pill">{currentUser.role}</span>
        </button>
        <button className="menu-btn" onClick={onToggleMobileMenu} aria-label="Menu">
          <Menu size={20} />
        </button>
      </div>
    </header>
  )
}
