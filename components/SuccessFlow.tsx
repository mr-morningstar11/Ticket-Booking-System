'use client'

import { Check, ArrowRight, ArrowLeft } from 'lucide-react'
import { QRCodePass } from './QRCodePass'

interface SuccessFlowProps {
  confirmedBooking: any
  onViewBookings: () => void
  onBookAnother: () => void
}

export function SuccessFlow({
  confirmedBooking,
  onViewBookings,
  onBookAnother,
}: SuccessFlowProps) {
  if (!confirmedBooking) return null

  return (
    <section className="success max-w-3xl mx-auto py-10 px-4">
      <div className="success-icon">
        <Check size={36} />
      </div>
      <span className="eyebrow">Booking Confirmed</span>
      <h2>See you at the show!</h2>
      <p className="max-w-lg mx-auto text-muted-foreground text-sm mb-6">
        Your official digital entry passes with verified gate QR codes have been issued. Each seat has its individual entry barcode.
      </p>

      {/* Render Accurate Scannable QR Pass with Seat Selector */}
      <div className="my-6 text-left">
        <QRCodePass
          bookingReference={confirmedBooking.booking_reference}
          eventTitle={confirmedBooking.event_title}
          showDate={confirmedBooking.show_date}
          startTime={confirmedBooking.start_time}
          venueName={confirmedBooking.venue_name}
          screenName={confirmedBooking.screen_name || 'Screen 1'}
          formatName={confirmedBooking.format_name || '2D'}
          seats={confirmedBooking.seats || []}
          attendeeName={confirmedBooking.customer_name || 'Attendee'}
          status="CONFIRMED"
        />
      </div>

      <div className="flex gap-4 justify-center flex-wrap mt-8">
        <button className="primary" onClick={onViewBookings}>
          View in My Bookings Wallet <ArrowRight size={16} />
        </button>
        <button className="outline-btn" onClick={onBookAnother}>
          <ArrowLeft size={16} /> Book Another Event
        </button>
      </div>
    </section>
  )
}
