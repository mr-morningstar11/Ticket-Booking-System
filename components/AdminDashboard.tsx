'use client'

import { ArrowLeft, RotateCcw } from 'lucide-react'

interface AdminDashboardProps {
  adminStats: any
  onBack: () => void
  onResetDatabase: () => void
}

export function AdminDashboard({
  adminStats,
  onBack,
  onResetDatabase,
}: AdminDashboardProps) {
  return (
    <section className="flow">
      <button className="back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to discover
      </button>

      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <span className="eyebrow">Management Portal</span>
          <h2>Admin <em>Dashboard.</em></h2>
        </div>
        <button className="outline-btn" onClick={onResetDatabase}>
          <RotateCcw size={15} /> Reseed Database (database.sql)
        </button>
      </div>

      {adminStats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="p-5 bg-surface border border-border rounded-lg">
            <span className="text-xs text-muted-foreground block">TOTAL REVENUE</span>
            <strong className="text-2xl text-primary block mt-1">₹{adminStats.totalRevenue}</strong>
          </div>
          <div className="p-5 bg-surface border border-border rounded-lg">
            <span className="text-xs text-muted-foreground block">CONFIRMED BOOKINGS</span>
            <strong className="text-2xl text-foreground block mt-1">{adminStats.totalBookings}</strong>
          </div>
          <div className="p-5 bg-surface border border-border rounded-lg">
            <span className="text-xs text-muted-foreground block">SEATS OCCUPIED</span>
            <strong className="text-2xl text-emerald-400 block mt-1">
              {adminStats.seatsOccupied} / {adminStats.seatsOccupied + adminStats.seatsAvailable}
            </strong>
          </div>
          <div className="p-5 bg-surface border border-border rounded-lg">
            <span className="text-xs text-muted-foreground block">REGISTERED USERS</span>
            <strong className="text-2xl text-foreground block mt-1">{adminStats.totalUsers}</strong>
          </div>
        </div>
      )}

      <div className="bg-surface border border-border rounded-xl p-6">
        <h3 className="text-lg font-bold mb-4">Recent Bookings Across All Users</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-muted-foreground border-b border-border">
              <tr>
                <th className="pb-3">Reference</th>
                <th className="pb-3">Customer</th>
                <th className="pb-3">Event</th>
                <th className="pb-3">Show Date</th>
                <th className="pb-3">Amount</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {adminStats?.recentBookings?.map((b: any) => (
                <tr key={b.booking_id}>
                  <td className="py-3 font-mono text-primary">{b.booking_reference}</td>
                  <td className="py-3 font-medium">{b.user_name}</td>
                  <td className="py-3">{b.event_title}</td>
                  <td className="py-3">{b.show_date} {b.start_time}</td>
                  <td className="py-3 font-bold">₹{b.total_amount}</td>
                  <td className="py-3">
                    <span className={`status-badge status-${b.booking_status}`}>{b.booking_status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
