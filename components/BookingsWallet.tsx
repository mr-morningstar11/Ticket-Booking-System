'use client'

import { useState } from 'react'
import { ArrowLeft, CalendarDays, Eye, Mail, MapPin, Ticket, Trash2, X, AlertCircle } from 'lucide-react'
import { QRCodePass } from './QRCodePass'

interface BookingsWalletProps {
  userBookings: any[]
  currentUser: any
  onBack: () => void
  onCancelBooking: (bookingId: number) => void
  onEmailTicket: (email: string) => void
  onCopyRef: (ref: string) => void
}

export function BookingsWallet({
  userBookings,
  currentUser,
  onBack,
  onCancelBooking,
  onEmailTicket,
  onCopyRef,
}: BookingsWalletProps) {
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'CONFIRMED' | 'CANCELLED'>('ALL')
  const [viewingTicket, setViewingTicket] = useState<any | null>(null)
  const [cancellingBooking, setCancellingBooking] = useState<any | null>(null)

  const filtered = userBookings.filter(b => bookingFilter === 'ALL' || b.booking_status === bookingFilter)

  return (
    <section className="bookings">
      <button className="back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to discover
      </button>

      <div className="flex justify-between items-end mb-8 flex-wrap gap-4">
        <div>
          <span className="eyebrow">Personal Wallet</span>
          <h2>My <em>Bookings.</em></h2>
          <p className="text-muted-foreground text-sm">
            Showing verified tickets for {currentUser.name} ({currentUser.email})
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          <button
            className={`filter ${bookingFilter === 'ALL' ? 'active' : ''}`}
            onClick={() => setBookingFilter('ALL')}
          >
            All ({userBookings.length})
          </button>
          <button
            className={`filter ${bookingFilter === 'CONFIRMED' ? 'active' : ''}`}
            onClick={() => setBookingFilter('CONFIRMED')}
          >
            Active ({userBookings.filter(b => b.booking_status === 'CONFIRMED').length})
          </button>
          <button
            className={`filter ${bookingFilter === 'CANCELLED' ? 'active' : ''}`}
            onClick={() => setBookingFilter('CANCELLED')}
          >
            Cancelled ({userBookings.filter(b => b.booking_status === 'CANCELLED').length})
          </button>
        </div>
      </div>

      {userBookings.length === 0 ? (
        <div className="empty text-center py-20 bg-surface rounded-xl border border-border">
          <Ticket size={48} className="mx-auto mb-4 text-muted-foreground opacity-40" />
          <h3 className="text-xl font-bold mb-2">No bookings yet</h3>
          <p className="text-muted-foreground text-sm mb-6">
            Explore the latest movies and stadium concerts to book your first tickets.
          </p>
          <button className="primary mx-auto" onClick={onBack}>
            Discover Live Events
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(booking => {
            const isConfirmed = booking.booking_status === 'CONFIRMED'
            const seatList = booking.seats?.map((s: any) => s.seat_number).join(', ') || 'N/A'

            return (
              <div key={booking.booking_id} className="booking-card">
                <div
                  className="booking-thumb"
                  style={{
                    backgroundImage: `url(${booking.poster_url || booking.banner_url || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=400&q=80'})`,
                  }}
                />

                <div className="booking-info">
                  <div className="flex items-center gap-3">
                    <span className={`status-badge status-${booking.booking_status}`}>
                      {booking.booking_status}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {booking.booking_reference}
                    </span>
                  </div>

                  <h3>{booking.event_title}</h3>
                  <p>
                    <CalendarDays size={13} className="text-primary" />
                    {booking.show_date} · {booking.start_time} ({booking.format_name || 'Standard'})
                  </p>
                  <p>
                    <MapPin size={13} className="text-primary" />
                    {booking.venue_name} ({booking.screen_name}) · Seats: <strong className="text-foreground ml-1">{seatList}</strong>
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Paid: <strong className="text-primary ml-1">₹{booking.total_amount}</strong> via {booking.payment_method || 'UPI'}
                  </p>
                </div>

                <div className="booking-actions">
                  <button className="outline-btn" onClick={() => setViewingTicket(booking)}>
                    <Eye size={15} /> View Pass ({booking.seats?.length || 1})
                  </button>
                  <button
                    className="outline-btn"
                    onClick={() => onEmailTicket(currentUser.email)}
                  >
                    <Mail size={15} /> Email
                  </button>
                  {isConfirmed && (
                    <button
                      className="danger-btn"
                      onClick={() => setCancellingBooking(booking)}
                    >
                      <Trash2 size={15} /> Cancel
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Ticket Modal with QR Codes per Seat */}
      {viewingTicket && (
        <div className="modal-overlay" onClick={() => setViewingTicket(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '620px' }}>
            <button className="modal-close" onClick={() => setViewingTicket(null)}><X size={16} /></button>
            <div className="eyebrow mb-1">OFFICIAL DIGITAL ENTRY PASSES</div>
            <h3 className="text-2xl font-bold mb-4">{viewingTicket.event_title}</h3>

            <QRCodePass
              bookingReference={viewingTicket.booking_reference}
              eventTitle={viewingTicket.event_title}
              showDate={viewingTicket.show_date}
              startTime={viewingTicket.start_time}
              venueName={viewingTicket.venue_name}
              screenName={viewingTicket.screen_name || 'Screen 1'}
              formatName={viewingTicket.format_name || 'Standard'}
              seats={viewingTicket.seats || []}
              attendeeName={viewingTicket.user_name || currentUser.name}
              status={viewingTicket.booking_status}
            />

            <div className="mt-4">
              <button
                className="outline-btn w-full text-xs"
                onClick={() => onCopyRef(viewingTicket.booking_reference)}
              >
                Copy Booking Reference ({viewingTicket.booking_reference})
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancellation Modal */}
      {cancellingBooking && (
        <div className="modal-overlay" onClick={() => setCancellingBooking(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
            <div className="flex items-center gap-3 text-rose-500 mb-3">
              <AlertCircle size={24} />
              <h3 className="text-lg font-bold">Cancel Ticket Booking?</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Are you sure you want to cancel booking <strong>{cancellingBooking.booking_reference}</strong> for <em>{cancellingBooking.event_title}</em>?
              Your seats ({cancellingBooking.seats?.map((s: any) => s.seat_number).join(', ')}) will be released and a full refund of <strong>₹{cancellingBooking.total_amount}</strong> will be refunded to your original payment method.
            </p>
            <div className="flex gap-3">
              <button className="outline-btn flex-1" onClick={() => setCancellingBooking(null)}>
                Keep Booking
              </button>
              <button
                className="danger-btn flex-1"
                onClick={() => {
                  onCancelBooking(cancellingBooking.booking_id)
                  setCancellingBooking(null)
                }}
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
