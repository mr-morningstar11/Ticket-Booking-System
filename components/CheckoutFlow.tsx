'use client'

import { ArrowLeft, CalendarDays, MapPin, ShieldCheck } from 'lucide-react'

interface CheckoutFlowProps {
  selectedEvent: any
  selectedShow: any
  selectedSeats: any[]
  currentUser: any
  paymentMethod: 'UPI' | 'CARD' | 'NET_BANKING' | 'TEST'
  upiId: string
  cardNumber: string
  cardExpiry: string
  cardCvc: string
  promoInput: string
  discountAmount: number
  isProcessingPay: boolean
  seatSubtotal: number
  convenienceFee: number
  gstTax: number
  grandTotal: number
  onBack: () => void
  onUpdateUser: (updated: any) => void
  onSetPaymentMethod: (method: 'UPI' | 'CARD' | 'NET_BANKING' | 'TEST') => void
  onSetUpiId: (val: string) => void
  onSetCardNumber: (val: string) => void
  onSetCardExpiry: (val: string) => void
  onSetCardCvc: (val: string) => void
  onSetPromoInput: (val: string) => void
  onApplyPromo: () => void
  onPay: () => void
}

export function CheckoutFlow({
  selectedEvent,
  selectedShow,
  selectedSeats,
  currentUser,
  paymentMethod,
  upiId,
  cardNumber,
  cardExpiry,
  cardCvc,
  promoInput,
  discountAmount,
  isProcessingPay,
  seatSubtotal,
  convenienceFee,
  gstTax,
  grandTotal,
  onBack,
  onUpdateUser,
  onSetPaymentMethod,
  onSetUpiId,
  onSetCardNumber,
  onSetCardExpiry,
  onSetCardCvc,
  onSetPromoInput,
  onApplyPromo,
  onPay,
}: CheckoutFlowProps) {
  return (
    <section className="flow">
      <button className="back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to seat selection
      </button>

      <div className="checkout-grid">
        {/* Form Card */}
        <div className="checkout-card">
          <span className="eyebrow">Step 2 of 2</span>
          <h2 className="text-3xl font-bold mt-2 mb-6">Payment & Contact</h2>

          <div className="form-group">
            <label>Attendee Full Name</label>
            <input
              className="field"
              value={currentUser.name}
              onChange={e => onUpdateUser({ ...currentUser, name: e.target.value })}
              placeholder="Your Name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Email Address for E-Ticket</label>
              <input
                className="field"
                value={currentUser.email}
                onChange={e => onUpdateUser({ ...currentUser, email: e.target.value })}
                placeholder="you@example.com"
              />
            </div>
            <div className="form-group">
              <label>Mobile Number</label>
              <input
                className="field"
                value={currentUser.phone}
                onChange={e => onUpdateUser({ ...currentUser, phone: e.target.value })}
                placeholder="9876543210"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="form-group mt-6">
            <label>Select Payment Mode</label>
            <div className="payment-tabs">
              <button
                className={`tab-btn ${paymentMethod === 'UPI' ? 'active' : ''}`}
                onClick={() => onSetPaymentMethod('UPI')}
              >
                UPI / QR
              </button>
              <button
                className={`tab-btn ${paymentMethod === 'CARD' ? 'active' : ''}`}
                onClick={() => onSetPaymentMethod('CARD')}
              >
                Credit/Debit Card
              </button>
              <button
                className={`tab-btn ${paymentMethod === 'NET_BANKING' ? 'active' : ''}`}
                onClick={() => onSetPaymentMethod('NET_BANKING')}
              >
                Net Banking
              </button>
              <button
                className={`tab-btn ${paymentMethod === 'TEST' ? 'active' : ''}`}
                onClick={() => onSetPaymentMethod('TEST')}
              >
                ⚡ Instant Test
              </button>
            </div>

            {paymentMethod === 'UPI' && (
              <div className="p-4 bg-surface-raised rounded-lg border border-border grid gap-3">
                <label className="text-xs">Enter Virtual Payment Address (VPA / UPI ID)</label>
                <input
                  className="field"
                  value={upiId}
                  onChange={e => onSetUpiId(e.target.value)}
                  placeholder="e.g. yourname@oksbi"
                />
                <div className="flex gap-2 text-[11px] text-muted-foreground">
                  <span className="slot-badge">GPay</span>
                  <span className="slot-badge">PhonePe</span>
                  <span className="slot-badge">Paytm</span>
                  <span className="slot-badge">BHIM</span>
                </div>
              </div>
            )}

            {paymentMethod === 'CARD' && (
              <div className="p-4 bg-surface-raised rounded-lg border border-border grid gap-3">
                <label className="text-xs">Card Details</label>
                <input
                  className="field"
                  value={cardNumber}
                  onChange={e => onSetCardNumber(e.target.value)}
                  placeholder="Card Number"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className="field"
                    value={cardExpiry}
                    onChange={e => onSetCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                  />
                  <input
                    className="field"
                    value={cardCvc}
                    onChange={e => onSetCardCvc(e.target.value)}
                    placeholder="CVC"
                  />
                </div>
              </div>
            )}

            {paymentMethod === 'NET_BANKING' && (
              <div className="p-4 bg-surface-raised rounded-lg border border-border grid grid-cols-2 gap-2 text-xs">
                <button className="outline-btn text-left">HDFC Bank</button>
                <button className="outline-btn text-left">ICICI Bank</button>
                <button className="outline-btn text-left">State Bank of India</button>
                <button className="outline-btn text-left">Axis Bank</button>
              </div>
            )}

            {paymentMethod === 'TEST' && (
              <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
                ⚡ <strong>Development Test Mode Active:</strong> Clicking Pay will simulate immediate payment authorization and lock the seats permanently in the SQLite database.
              </div>
            )}
          </div>

          {/* Promo Code Input */}
          <div className="form-group mt-6">
            <label>Promo Code / Discount Voucher</label>
            <div className="promo-row">
              <input
                className="field"
                value={promoInput}
                onChange={e => onSetPromoInput(e.target.value)}
                placeholder="Enter EARLYBIRD or WELCOME50"
              />
              <button onClick={onApplyPromo}>Apply</button>
            </div>
          </div>

          <button
            className="primary w-full py-3.5 text-sm mt-6 font-bold"
            disabled={isProcessingPay}
            onClick={onPay}
          >
            {isProcessingPay ? 'Authorizing Payment...' : `Pay ₹${grandTotal} & Confirm Booking`} <ShieldCheck size={18} />
          </button>
          <div className="text-center text-[11px] text-muted-foreground mt-3 flex items-center justify-center gap-1.5">
            <ShieldCheck size={14} className="text-primary" /> 256-Bit SSL Encrypted & Verified Transaction
          </div>
        </div>

        {/* Order Summary Aside */}
        <aside className="order-summary">
          <span className="eyebrow">Booking Summary</span>
          <h3 className="text-xl font-bold mt-2 mb-1">{selectedEvent?.title}</h3>
          <p className="text-xs text-muted-foreground mb-3">
            <CalendarDays size={13} className="inline mr-1 text-primary" />
            {selectedShow.show_date} · {selectedShow.start_time} ({selectedShow.format_name})
          </p>
          <p className="text-xs text-muted-foreground mb-4">
            <MapPin size={13} className="inline mr-1 text-primary" />
            {selectedShow.venue_name} · {selectedShow.screen_name}
          </p>

          <div className="summary-line">
            <span>Seats ({selectedSeats.map(s => s.seat_number).join(', ')})</span>
            <strong>₹{seatSubtotal}</strong>
          </div>
          <div className="summary-line">
            <span>Convenience Fee</span>
            <strong>₹{convenienceFee}</strong>
          </div>
          <div className="summary-line">
            <span>GST Tax (18%)</span>
            <strong>₹{gstTax}</strong>
          </div>
          {discountAmount > 0 && (
            <div className="summary-line text-emerald-400">
              <span>Discount Applied</span>
              <strong>-₹{discountAmount}</strong>
            </div>
          )}

          <div className="summary-total">
            <span>Grand Total</span>
            <strong>₹{grandTotal}</strong>
          </div>
        </aside>
      </div>
    </section>
  )
}
