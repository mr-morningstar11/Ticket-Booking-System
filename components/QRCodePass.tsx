'use client'

import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { Ticket, ShieldCheck, Download, Copy, Check } from 'lucide-react'

interface QRCodePassProps {
  bookingReference: string
  eventTitle: string
  showDate: string
  startTime: string
  venueName: string
  screenName?: string
  formatName?: string
  seats: Array<{ seat_id?: number; seat_number: string; seat_category?: string; price?: number } | string>
  attendeeName: string
  status?: string
}

export function QRCodePass({
  bookingReference,
  eventTitle,
  showDate,
  startTime,
  venueName,
  screenName = 'Screen 1',
  formatName = '2D',
  seats,
  attendeeName,
  status = 'CONFIRMED',
}: QRCodePassProps) {
  // Normalize seats list to objects
  const normalizedSeats = seats.map((s, idx) => {
    if (typeof s === 'string') {
      return { seat_number: s, seat_category: 'Standard', seat_id: idx }
    }
    return s
  })

  const [activeSeatIndex, setActiveSeatIndex] = useState<number>(0)
  const [qrDataUrls, setQrDataUrls] = useState<Record<string, string>>({})
  const [copiedToken, setCopiedToken] = useState<string | null>(null)

  // Generate QR code for each seat
  useEffect(() => {
    async function generateQRs() {
      const urls: Record<string, string> = {}
      for (const seat of normalizedSeats) {
        const payload = JSON.stringify({
          ticket_ref: bookingReference,
          seat: seat.seat_number,
          category: seat.seat_category || 'Standard',
          event: eventTitle,
          date: showDate,
          time: startTime,
          venue: venueName,
          screen: screenName,
          holder: attendeeName,
          token: `${bookingReference}-${seat.seat_number}-${Date.now().toString(36).toUpperCase()}`,
        })

        try {
          const url = await QRCode.toDataURL(payload, {
            errorCorrectionLevel: 'M',
            margin: 2,
            width: 220,
            color: {
              dark: '#0d1217',
              light: '#ffffff',
            },
          })
          urls[seat.seat_number] = url
        } catch (err) {
          console.error('Error generating QR code:', err)
        }
      }
      setQrDataUrls(urls)
    }

    if (normalizedSeats.length > 0) {
      generateQRs()
    }
  }, [bookingReference, eventTitle, showDate, startTime, venueName, screenName, attendeeName, seats])

  const currentSeat = normalizedSeats[activeSeatIndex] || normalizedSeats[0]
  const currentQR = currentSeat ? qrDataUrls[currentSeat.seat_number] : null

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedToken(code)
    setTimeout(() => setCopiedToken(null), 2000)
  }

  return (
    <div className="digital-passes-container">
      {/* Header with Seat Switcher Tabs if multiple seats */}
      {normalizedSeats.length > 1 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Issued Passes ({normalizedSeats.length} Seats)
            </span>
            <span className="text-xs text-primary font-bold">
              Viewing Pass {activeSeatIndex + 1} of {normalizedSeats.length}
            </span>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            {normalizedSeats.map((seat, index) => (
              <button
                key={seat.seat_number}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${activeSeatIndex === index
                    ? 'bg-primary text-primary-foreground border-primary shadow-md'
                    : 'bg-surface-raised border-border text-foreground hover:border-muted-foreground'
                  }`}
                onClick={() => setActiveSeatIndex(index)}
              >
                Seat {seat.seat_number}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Individual Digital Pass Card */}
      {currentSeat && (
        <div className="pass-card bg-surface border border-border rounded-xl p-5 shadow-2xl relative overflow-hidden">
          {/* Top Banner */}
          <div className="flex justify-between items-start border-b border-border pb-4 mb-4">
            <div>
              <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest block">
                OFFICIAL ENTRY TICKET
              </span>
              <h3 className="text-lg font-bold text-foreground mt-0.5">{eventTitle}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {venueName} ({screenName}) · {formatName}
              </p>
            </div>

            <div className="text-right">
              <span className={`status-badge status-${status}`}>
                {status}
              </span>
              <div className="text-[10px] font-mono text-muted-foreground mt-1">
                {bookingReference}
              </div>
            </div>
          </div>

          {/* Seat & QR Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center my-3 bg-surface-raised/60 p-4 rounded-xl border border-border/70">
            {/* Seat Information */}
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-muted-foreground block font-bold tracking-wider">
                  ASSIGNED SEAT
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-primary tracking-tight">
                    {currentSeat.seat_number}
                  </span>
                  <span className="text-xs font-semibold text-foreground/80 px-2 py-0.5 bg-surface border border-border rounded">
                    {currentSeat.seat_category || 'Standard'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <span className="text-muted-foreground text-[10px] block">DATE</span>
                  <strong className="text-foreground">{showDate}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">TIME</span>
                  <strong className="text-foreground">{startTime}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">PASS HOLDER</span>
                  <strong className="text-foreground truncate block">{attendeeName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground text-[10px] block">GATE TURNSTILE</span>
                  <strong className="text-emerald-400">Gate A / Verified</strong>
                </div>
              </div>
            </div>

            {/* High-Resolution Accurate Scannable QR Code */}
            <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl shadow-inner text-center">
              {currentQR ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={currentQR}
                  alt={`QR Code for Seat ${currentSeat.seat_number}`}
                  className="w-36 h-36 object-contain rounded"
                />
              ) : (
                <div className="w-36 h-36 bg-gray-100 animate-pulse rounded flex items-center justify-center text-xs text-gray-500">
                  Generating QR...
                </div>
              )}
              <div className="text-[10px] text-gray-800 font-mono font-bold mt-1.5 flex items-center gap-1">
                <ShieldCheck size={11} className="text-emerald-600" />
                {bookingReference}-{currentSeat.seat_number}
              </div>
              <span className="text-[9px] text-gray-500">
                Scan at turnstile scanner
              </span>
            </div>
          </div>

          {/* Verification Token & Action Bar */}
          <div className="flex justify-between items-center pt-3 mt-3 border-t border-border text-xs">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-muted-foreground">
                Token: {bookingReference.slice(-6)}-{currentSeat.seat_number}
              </span>
              <button
                onClick={() => handleCopyCode(`${bookingReference}-${currentSeat.seat_number}`)}
                className="text-muted-foreground hover:text-primary p-1 rounded"
                title="Copy Pass Code"
              >
                {copiedToken ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 bg-surface-raised hover:bg-surface border border-border rounded text-foreground font-semibold"
              >
                <Download size={12} /> Print Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary of all seats */}
      {normalizedSeats.length > 1 && (
        <div className="mt-3 text-center text-xs text-muted-foreground">
          💡 Click any seat tab above to switch QR pass or print individual gate tickets for each attendee.
        </div>
      )}
    </div>
  )
}
