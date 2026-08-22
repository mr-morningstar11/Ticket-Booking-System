'use client'

import { X, Check } from 'lucide-react'

interface UserSwitcherModalProps {
  isOpen: boolean
  users: any[]
  currentUser: any
  onSelectUser: (user: any) => void
  onClose: () => void
}

export function UserSwitcherModal({
  isOpen,
  users,
  currentUser,
  onSelectUser,
  onClose,
}: UserSwitcherModalProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '450px' }}>
        <button className="modal-close" onClick={onClose}><X size={16} /></button>
        <div className="eyebrow mb-1">USER ACCOUNTS & ROLES</div>
        <h3 className="text-xl font-bold mb-4">Switch Active Profile</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Select a user profile from the database to test customer bookings, organiser dashboard, or administrative oversight.
        </p>

        <div className="grid gap-2 mb-6">
          {users.map(u => (
            <div
              key={u.user_id}
              className={`p-3.5 rounded-lg border cursor-pointer flex justify-between items-center transition-all ${
                currentUser.user_id === u.user_id
                  ? 'bg-surface-raised border-primary shadow-md'
                  : 'bg-surface border-border hover:border-muted-foreground'
              }`}
              onClick={() => onSelectUser(u)}
            >
              <div>
                <div className="font-bold text-sm flex items-center gap-2">
                  {u.name}
                  {currentUser.user_id === u.user_id && <Check size={14} className="text-primary" />}
                </div>
                <div className="text-xs text-muted-foreground">{u.email} · {u.phone}</div>
              </div>
              <span className="role-pill">{u.role}</span>
            </div>
          ))}
        </div>

        <button className="outline-btn w-full" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
