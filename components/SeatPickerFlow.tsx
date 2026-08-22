'use client'

import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react'

interface SeatPickerFlowProps {
  selectedEvent: any
  selectedShow: any
  showSeats: any[]
  selectedSeats: any[]
  holdSeconds: number
  seatSubtotal: number
  onBack: () => void
  onToggleSeat: (seat: any) => void
  onContinue: () => void
}

export function SeatPickerFlow({
  selectedEvent,
  selectedShow,
  showSeats,
  selectedSeats,
  holdSeconds,
  seatSubtotal,
  onBack,
  onToggleSeat,
  onContinue,
}: SeatPickerFlowProps) {
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <section className="flow">
      <button className="back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to show details
      </button>

      <div className="flow-head">
        <div>
          <span className="eyebrow">Step 1 of 2</span>
          <h2>Choose your <em>seats.</em></h2>
          <p>
            {selectedEvent?.title} · {selectedShow.venue_name} ({selectedShow.screen_name}) · {selectedShow.show_date} at {selectedShow.start_time}
          </p>
        </div>

        <div className="hold-pill">
          <Clock3 size={18} />
          <span>Seats held for <strong>{formatTimer(holdSeconds)}</strong></span>
        </div>
      </div>

      <div className="seat-layout">
        <div className="screen-indicator">ALL EYES THIS WAY — SCREEN</div>

        {/* Grid */}
        <div className="seat-matrix">
          {showSeats.map(seat => {
            const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id)
            const isBooked = seat.status === 'BOOKED'
            const categoryClass = `category-${seat.seat_category.toLowerCase()}`

            return (
              <button
                key={seat.seat_id}
                disabled={isBooked}
                className={`seat-btn ${categoryClass} ${isBooked ? 'unavailable' : ''} ${isSelected ? 'chosen' : ''}`}
                onClick={() => onToggleSeat(seat)}
                title={`${seat.seat_number} (${seat.seat_category}) - ₹${seat.calculated_price}`}
              >
                <span>{seat.seat_number}</span>
                <span className="text-[8px] opacity-75">₹{seat.calculated_price}</span>
              </button>
            )
          })}
        </div>

        {/* Legend */}
        <div className="seat-legend">
          <span><i className="legend-standard" /> Standard (₹{selectedShow.ticket_price})</span>
          <span><i className="legend-premium" /> Premium (₹{Math.round(selectedShow.ticket_price * 1.5)})</span>
          <span><i className="legend-vip" /> VIP (₹{Math.round(selectedShow.ticket_price * 2.0)})</span>
          <span><i className="legend-vvip" /> VVIP (₹{Math.round(selectedShow.ticket_price * 2.5)})</span>
          <span><i className="legend-selected" /> Selected</span>
          <span><i className="legend-sold" /> Booked / Unavailable</span>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="flow-bottom">
        <div>
          <small>Seats Selected ({selectedSeats.length})</small>
          <div className="selected-seats-pills">
            {selectedSeats.length === 0 ? (
              <span className="text-xs text-muted-foreground">Click any available seat above to select</span>
            ) : (
              selectedSeats.map(s => (
                <span key={s.seat_id} className="seat-tag">
                  {s.seat_number} (₹{s.calculated_price})
                </span>
              ))
            )}
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right">
            <small className="text-muted-foreground text-xs block">Subtotal</small>
            <strong className="text-xl font-bold text-primary">₹{seatSubtotal}</strong>
          </div>

          <button
            className="primary"
            disabled={selectedSeats.length === 0}
            onClick={onContinue}
          >
            Continue to Checkout ({selectedSeats.length}) <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  )
}
