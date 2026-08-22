'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Clock3, Sparkles, User, Info, Check, RotateCcw, MapPin, Disc3, Music2 } from 'lucide-react'

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

// Sleek Cinema Armchair Icon matching movie reference
function CinemaChair({ isSelected, isBooked, category }: { isSelected: boolean; isBooked: boolean; category: string }) {
  let fillClass = 'text-[#2a343f] stroke-[#3a4856]'
  if (isBooked) {
    fillClass = 'text-[#cbd5e1] stroke-[#94a3b8]'
  } else if (isSelected) {
    fillClass = 'text-[#f59e0b] stroke-[#fbbf24] filter drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]'
  } else if (category === 'VVIP') {
    fillClass = 'text-[#1e2730] stroke-[#ec4899]/70 hover:stroke-[#ec4899] hover:text-[#2d3a47]'
  } else if (category === 'VIP') {
    fillClass = 'text-[#1e2730] stroke-[#a855f7]/70 hover:stroke-[#a855f7] hover:text-[#2d3a47]'
  } else if (category === 'PREMIUM') {
    fillClass = 'text-[#1e2730] stroke-[#f59e0b]/70 hover:stroke-[#f59e0b] hover:text-[#2d3a47]'
  } else {
    fillClass = 'text-[#1e2730] stroke-[#3b82f6]/70 hover:stroke-[#3b82f6] hover:text-[#2d3a47]'
  }

  return (
    <svg viewBox="0 0 24 24" className={`w-full h-full transition-all duration-200 ${fillClass}`} fill="currentColor">
      <path d="M6 3.5C6 2.67 6.67 2 7.5 2H16.5C17.33 2 18 2.67 18 3.5V13H6V3.5Z" rx="1.5" />
      <rect x="5.5" y="12.5" width="13" height="6.5" rx="2" strokeWidth="0.5" />
      <rect x="2.5" y="7" width="3" height="11.5" rx="1.5" strokeWidth="0.5" />
      <rect x="18.5" y="7" width="3" height="11.5" rx="1.5" strokeWidth="0.5" />
    </svg>
  )
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
  const [hoveredSeat, setHoveredSeat] = useState<any | null>(null)
  const [activeConcertStand, setActiveConcertStand] = useState<string>('ALL')

  const isConcert = selectedEvent?.event_type === 'CONCERT'

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Group seats by tier/category and rows for Cinema mode
  const cinemaSections = useMemo(() => {
    const rowsMap: { [key: string]: any[] } = {}
    
    showSeats.forEach(seat => {
      if (!rowsMap[seat.row_label]) rowsMap[seat.row_label] = []
      rowsMap[seat.row_label].push(seat)
    })

    Object.keys(rowsMap).forEach(r => {
      rowsMap[r].sort((a, b) => {
        const numA = parseInt(a.seat_number.replace(/\D/g, ''), 10) || 0
        const numB = parseInt(b.seat_number.replace(/\D/g, ''), 10) || 0
        return numA - numB
      })
    })

    const result: {
      category: string
      title: string
      multiplier: number
      price: number
      rows: { rowLabel: string; seats: any[] }[]
    }[] = []

    if (rowsMap['H'] && rowsMap['H'].length > 0) {
      result.push({
        category: 'VVIP',
        title: 'VVIP / RECLINERS',
        multiplier: 2.4,
        price: Math.round(selectedShow.ticket_price * 2.4),
        rows: [{ rowLabel: 'H', seats: rowsMap['H'] }],
      })
    }

    const vipRows = ['G', 'F'].filter(r => rowsMap[r] && rowsMap[r].length > 0).map(r => ({ rowLabel: r, seats: rowsMap[r] }))
    if (vipRows.length > 0) {
      result.push({
        category: 'VIP',
        title: 'VIP CLUB',
        multiplier: 1.8,
        price: Math.round(selectedShow.ticket_price * 1.8),
        rows: vipRows,
      })
    }

    const premiumRows = ['E', 'D'].filter(r => rowsMap[r] && rowsMap[r].length > 0).map(r => ({ rowLabel: r, seats: rowsMap[r] }))
    if (premiumRows.length > 0) {
      result.push({
        category: 'PREMIUM',
        title: 'PREMIUM PRIME',
        multiplier: 1.4,
        price: Math.round(selectedShow.ticket_price * 1.4),
        rows: premiumRows,
      })
    }

    const standardRows = ['C', 'B', 'A'].filter(r => rowsMap[r] && rowsMap[r].length > 0).map(r => ({ rowLabel: r, seats: rowsMap[r] }))
    if (standardRows.length > 0) {
      result.push({
        category: 'STANDARD',
        title: 'EXECUTIVE STANDARD',
        multiplier: 1.0,
        price: Math.round(selectedShow.ticket_price * 1.0),
        rows: standardRows,
      })
    }

    if (result.length === 0) {
      const allRows = Object.keys(rowsMap).sort().reverse().map(r => ({ rowLabel: r, seats: rowsMap[r] }))
      result.push({
        category: 'STANDARD',
        title: 'SEATING SECTION',
        multiplier: 1.0,
        price: selectedShow.ticket_price,
        rows: allRows,
      })
    }

    return result
  }, [showSeats, selectedShow])

  // Concert Stadium Zones based on reference image
  const concertStands = useMemo(() => {
    const basePrice = selectedShow.ticket_price || 2500
    
    // Map seats to authentic stadium zones
    const floorSeats = showSeats.filter(s => s.row_label === 'A')
    const lowerCFSeats = showSeats.filter(s => s.row_label === 'B')
    const lowerBGSeats = showSeats.filter(s => s.row_label === 'C')
    const lowerAHSeats = showSeats.filter(s => s.row_label === 'D')
    const upperLPSeats = showSeats.filter(s => s.row_label === 'E')
    const upperKQSeats = showSeats.filter(s => s.row_label === 'F')
    const upperJRSeats = showSeats.filter(s => s.row_label === 'G')
    const southPremiumSeats = showSeats.filter(s => s.row_label === 'H')

    return [
      {
        id: 'FLOOR',
        name: 'Standing (Floor)',
        tag: 'GENERAL ADMISSION',
        price: Math.round(basePrice * 2.5),
        color: '#c8a364',
        textColor: '#000000',
        seats: floorSeats,
        description: 'Direct Stage & Runway Front Access'
      },
      {
        id: 'SOUTH_PREMIUM',
        name: 'South Premium (West, Center, East)',
        tag: 'VVIP ELEVATED',
        price: Math.round(basePrice * 4.8),
        color: '#f59e0b',
        textColor: '#000000',
        seats: southPremiumSeats,
        description: 'Prime Center Elevated Panoramic View'
      },
      {
        id: 'LOWER_AH',
        name: 'Lower Stand - A & H',
        tag: 'LOWER BOWL',
        price: Math.round(basePrice * 3.6),
        color: '#38bdf8',
        textColor: '#000000',
        seats: lowerAHSeats,
        description: 'Close Proximity Wing Stands'
      },
      {
        id: 'LOWER_BG',
        name: 'Lower Stand - B & G',
        tag: 'LOWER BOWL',
        price: Math.round(basePrice * 1.8),
        color: '#06b6d4',
        textColor: '#000000',
        seats: lowerBGSeats,
        description: 'Side Lower Tier Arena View'
      },
      {
        id: 'LOWER_CF',
        name: 'Lower Stand - C & F',
        tag: 'LOWER BOWL',
        price: Math.round(basePrice * 1.2),
        color: '#10b981',
        textColor: '#000000',
        seats: lowerCFSeats,
        description: 'Side Stage Wing Seating'
      },
      {
        id: 'UPPER_JR',
        name: 'Upper Stand - J & R',
        tag: 'UPPER TIER',
        price: Math.round(basePrice * 2.4),
        color: '#fb7185',
        textColor: '#000000',
        seats: upperJRSeats,
        description: 'Mid Upper Deck Center Perspective'
      },
      {
        id: 'UPPER_KQ',
        name: 'Upper Stand - K & Q',
        tag: 'UPPER TIER',
        price: Math.round(basePrice * 1.4),
        color: '#c084fc',
        textColor: '#000000',
        seats: upperKQSeats,
        description: 'Side Upper Stadium Deck'
      },
      {
        id: 'UPPER_LP',
        name: 'Upper Stand - L & P',
        tag: 'UPPER TIER',
        price: Math.round(basePrice * 1.0),
        color: '#f43f5e',
        textColor: '#ffffff',
        seats: upperLPSeats,
        description: 'Upper Wing Stage Overview'
      },
    ]
  }, [showSeats, selectedShow])

  const splitRowIntoBlocks = (seats: any[]) => {
    if (seats.length <= 5) return { left: seats, center: [], right: [] }
    if (seats.length === 8) {
      return {
        left: seats.slice(0, 2),
        center: seats.slice(2, 6),
        right: seats.slice(6, 8),
      }
    }
    return {
      left: seats.slice(0, 2),
      center: seats.slice(2, 8),
      right: seats.slice(8, 10),
    }
  }

  const availableCount = showSeats.filter(s => s.status !== 'BOOKED').length

  const filteredConcertStands = activeConcertStand === 'ALL'
    ? concertStands
    : concertStands.filter(s => s.id === activeConcertStand)

  return (
    <section className="flow max-w-5xl mx-auto">
      <button className="back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to show details
      </button>

      <div className="flow-head">
        <div>
          <span className="eyebrow">
            {isConcert ? 'Stadium Concert Arena Layout' : 'Cinema Hall Layout'} · {selectedShow.format_name || 'Live'}
          </span>
          <h2>
            {isConcert ? 'Select Your ' : 'Choose your '}
            <em>{isConcert ? 'Concert Stand & Seats.' : 'seats.'}</em>
          </h2>
          <p>
            {selectedEvent?.title} · {selectedShow.venue_name} · {selectedShow.show_date} at {selectedShow.start_time}
          </p>
        </div>

        <div className="hold-pill">
          <Clock3 size={18} className="text-primary animate-pulse" />
          <span>Seats held for <strong>{formatTimer(holdSeconds)}</strong></span>
        </div>
      </div>

      {/* ===================== STADIUM CONCERT MODE ===================== */}
      {isConcert ? (
        <div className="stadium-container">
          {/* Concert Tour Subheader Banner */}
          <div className="concert-stadium-header">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Sparkles size={16} className="text-amber-400" />
              <span className="text-xs font-black tracking-widest text-amber-300 uppercase">
                {selectedEvent.title} · WORLD TOUR ARENA
              </span>
              <Sparkles size={16} className="text-amber-400" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {selectedShow.venue_name.toUpperCase()}
            </h3>
            <p className="text-xs text-sky-200 opacity-90">{selectedShow.show_date}</p>
          </div>

          {/* Interactive SVG Stadium Map (Modeled after Coldplay Narendra Modi Stadium reference) */}
          <div className="stadium-map-wrapper">
            <svg
              viewBox="0 0 700 520"
              className="w-full max-w-[620px] mx-auto filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.8)]"
            >
              <defs>
                {/* Stage Lighting Glow */}
                <radialGradient id="stageGlow" cx="50%" cy="30%" r="50%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.9)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
                {/* Field Background Radial */}
                <radialGradient id="stadiumGrass" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#1e3a8a" />
                  <stop offset="60%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </radialGradient>
              </defs>

              {/* Stadium Bowl Base */}
              <circle cx="350" cy="270" r="240" fill="url(#stadiumGrass)" stroke="#1e293b" strokeWidth="2" />

              {/* ---------------- UPPER STANDS (OUTER RING) ---------------- */}
              {/* Upper L (Left Stage View: Pink) */}
              <path
                d="M 130,220 A 230,230 0 0,1 230,80 L 260,120 A 180,180 0 0,0 175,230 Z"
                fill="#f43f5e"
                opacity={activeConcertStand === 'ALL' || activeConcertStand === 'UPPER_LP' ? 0.9 : 0.35}
                className="cursor-pointer transition-all hover:opacity-100 hover:brightness-125"
                onClick={() => setActiveConcertStand(activeConcertStand === 'UPPER_LP' ? 'ALL' : 'UPPER_LP')}
              />
              <text x="180" y="150" fill="#fff" fontSize="11" fontWeight="800" textAnchor="middle">UPPER L</text>
              <text x="180" y="165" fill="#fff" fontSize="9" fontWeight="700" textAnchor="middle">₹2,500</text>

              {/* Upper P (Right Stage View: Pink) */}
              <path
                d="M 470,80 A 230,230 0 0,1 570,220 L 525,230 A 180,180 0 0,0 440,120 Z"
                fill="#f43f5e"
                opacity={activeConcertStand === 'ALL' || activeConcertStand === 'UPPER_LP' ? 0.9 : 0.35}
                className="cursor-pointer transition-all hover:opacity-100 hover:brightness-125"
                onClick={() => setActiveConcertStand(activeConcertStand === 'UPPER_LP' ? 'ALL' : 'UPPER_LP')}
              />
              <text x="520" y="150" fill="#fff" fontSize="11" fontWeight="800" textAnchor="middle">UPPER P</text>
              <text x="520" y="165" fill="#fff" fontSize="9" fontWeight="700" textAnchor="middle">₹2,500</text>

              {/* Upper K (Left Mid: Lavender) */}
              <path
                d="M 115,240 A 235,235 0 0,0 160,370 L 205,345 A 180,180 0 0,1 170,245 Z"
                fill="#c084fc"
                opacity={activeConcertStand === 'ALL' || activeConcertStand === 'UPPER_KQ' ? 0.9 : 0.35}
                className="cursor-pointer transition-all hover:opacity-100 hover:brightness-125"
                onClick={() => setActiveConcertStand(activeConcertStand === 'UPPER_KQ' ? 'ALL' : 'UPPER_KQ')}
              />
              <text x="150" y="300" fill="#000" fontSize="11" fontWeight="900" textAnchor="middle">UPPER K</text>
              <text x="150" y="315" fill="#000" fontSize="9" fontWeight="800" textAnchor="middle">₹3,500</text>

              {/* Upper Q (Right Mid: Lavender) */}
              <path
                d="M 585,240 A 235,235 0 0,1 540,370 L 495,345 A 180,180 0 0,0 530,245 Z"
                fill="#c084fc"
                opacity={activeConcertStand === 'ALL' || activeConcertStand === 'UPPER_KQ' ? 0.9 : 0.35}
                className="cursor-pointer transition-all hover:opacity-100 hover:brightness-125"
                onClick={() => setActiveConcertStand(activeConcertStand === 'UPPER_KQ' ? 'ALL' : 'UPPER_KQ')}
              />
              <text x="550" y="300" fill="#000" fontSize="11" fontWeight="900" textAnchor="middle">UPPER Q</text>
              <text x="550" y="315" fill="#000" fontSize="9" fontWeight="800" textAnchor="middle">₹3,500</text>

              {/* Upper J (Left Rear: Rose) */}
              <path
                d="M 175,390 A 235,235 0 0,0 260,465 L 285,420 A 180,180 0 0,1 215,365 Z"
                fill="#fb7185"
                opacity={activeConcertStand === 'ALL' || activeConcertStand === 'UPPER_JR' ? 0.9 : 0.35}
                className="cursor-pointer transition-all hover:opacity-100 hover:brightness-125"
                onClick={() => setActiveConcertStand(activeConcertStand === 'UPPER_JR' ? 'ALL' : 'UPPER_JR')}
              />
              <text x="230" y="425" fill="#000" fontSize="11" fontWeight="900" textAnchor="middle">UPPER J</text>
              <text x="230" y="440" fill="#000" fontSize="9" fontWeight="800" textAnchor="middle">₹6,500</text>

              {/* Upper R (Right Rear: Rose) */}
              <path
                d="M 525,390 A 235,235 0 0,1 440,465 L 415,420 A 180,180 0 0,0 485,365 Z"
                fill="#fb7185"
                opacity={activeConcertStand === 'ALL' || activeConcertStand === 'UPPER_JR' ? 0.9 : 0.35}
                className="cursor-pointer transition-all hover:opacity-100 hover:brightness-125"
                onClick={() => setActiveConcertStand(activeConcertStand === 'UPPER_JR' ? 'ALL' : 'UPPER_JR')}
              />
              <text x="470" y="425" fill="#000" fontSize="11" fontWeight="900" textAnchor="middle">UPPER R</text>
              <text x="470" y="440" fill="#000" fontSize="9" fontWeight="800" textAnchor="middle">₹6,500</text>

              {/* ---------------- LOWER STANDS (INNER RING) ---------------- */}
              {/* Lower C (Left Stage: Emerald) */}
              <path
                d="M 235,160 A 145,145 0 0,0 195,235 L 235,245 A 105,105 0 0,1 265,190 Z"
                fill="#10b981"
                opacity={activeConcertStand === 'ALL' || activeConcertStand === 'LOWER_CF' ? 0.95 : 0.35}
                className="cursor-pointer transition-all hover:opacity-100 hover:brightness-125"
                onClick={() => setActiveConcertStand(activeConcertStand === 'LOWER_CF' ? 'ALL' : 'LOWER_CF')}
              />
              <text x="225" y="200" fill="#000" fontSize="10" fontWeight="900" textAnchor="middle">LOWER C</text>
              <text x="225" y="213" fill="#000" fontSize="8" fontWeight="800" textAnchor="middle">₹3,000</text>

              {/* Lower F (Right Stage: Emerald) */}
              <path
                d="M 465,160 A 145,145 0 0,1 505,235 L 465,245 A 105,105 0 0,0 435,190 Z"
                fill="#10b981"
                opacity={activeConcertStand === 'ALL' || activeConcertStand === 'LOWER_CF' ? 0.95 : 0.35}
                className="cursor-pointer transition-all hover:opacity-100 hover:brightness-125"
                onClick={() => setActiveConcertStand(activeConcertStand === 'LOWER_CF' ? 'ALL' : 'LOWER_CF')}
              />
              <text x="475" y="200" fill="#000" fontSize="10" fontWeight="900" textAnchor="middle">LOWER F</text>
              <text x="475" y="213" fill="#000" fontSize="8" fontWeight="800" textAnchor="middle">₹3,000</text>

              {/* Lower B (Left Mid: Cyan) */}
              <path
                d="M 195,245 A 145,145 0 0,0 215,320 L 255,305 A 105,105 0 0,1 240,250 Z"
                fill="#06b6d4"
                opacity={activeConcertStand === 'ALL' || activeConcertStand === 'LOWER_BG' ? 0.95 : 0.35}
                className="cursor-pointer transition-all hover:opacity-100 hover:brightness-125"
                onClick={() => setActiveConcertStand(activeConcertStand === 'LOWER_BG' ? 'ALL' : 'LOWER_BG')}
              />
              <text x="225" y="280" fill="#000" fontSize="10" fontWeight="900" textAnchor="middle">LOWER B</text>
              <text x="225" y="293" fill="#000" fontSize="8" fontWeight="800" textAnchor="middle">₹4,500</text>

              {/* Lower G (Right Mid: Cyan) */}
              <path
                d="M 505,245 A 145,145 0 0,1 485,320 L 445,305 A 105,105 0 0,0 460,250 Z"
                fill="#06b6d4"
                opacity={activeConcertStand === 'ALL' || activeConcertStand === 'LOWER_BG' ? 0.95 : 0.35}
                className="cursor-pointer transition-all hover:opacity-100 hover:brightness-125"
                onClick={() => setActiveConcertStand(activeConcertStand === 'LOWER_BG' ? 'ALL' : 'LOWER_BG')}
              />
              <text x="475" y="280" fill="#000" fontSize="10" fontWeight="900" textAnchor="middle">LOWER G</text>
              <text x="475" y="293" fill="#000" fontSize="8" fontWeight="800" textAnchor="middle">₹4,500</text>

              {/* Lower A (Left Front Wing: Sky Blue) */}
              <path
                d="M 220,330 A 145,145 0 0,0 270,390 L 295,355 A 105,105 0 0,1 260,312 Z"
                fill="#38bdf8"
                opacity={activeConcertStand === 'ALL' || activeConcertStand === 'LOWER_AH' ? 0.95 : 0.35}
                className="cursor-pointer transition-all hover:opacity-100 hover:brightness-125"
                onClick={() => setActiveConcertStand(activeConcertStand === 'LOWER_AH' ? 'ALL' : 'LOWER_AH')}
              />
              <text x="260" y="355" fill="#000" fontSize="10" fontWeight="900" textAnchor="middle">LOWER A</text>
              <text x="260" y="367" fill="#000" fontSize="8" fontWeight="800" textAnchor="middle">₹9,500</text>

              {/* Lower H (Right Front Wing: Sky Blue) */}
              <path
                d="M 480,330 A 145,145 0 0,1 430,390 L 405,355 A 105,105 0 0,0 440,312 Z"
                fill="#38bdf8"
                opacity={activeConcertStand === 'ALL' || activeConcertStand === 'LOWER_AH' ? 0.95 : 0.35}
                className="cursor-pointer transition-all hover:opacity-100 hover:brightness-125"
                onClick={() => setActiveConcertStand(activeConcertStand === 'LOWER_AH' ? 'ALL' : 'LOWER_AH')}
              />
              <text x="440" y="355" fill="#000" fontSize="10" fontWeight="900" textAnchor="middle">LOWER H</text>
              <text x="440" y="367" fill="#000" fontSize="8" fontWeight="800" textAnchor="middle">₹9,500</text>

              {/* ---------------- SOUTH PREMIUM (CENTER ELEVATED) ---------------- */}
              <path
                d="M 285,400 A 145,145 0 0,0 415,400 L 398,348 A 95,95 0 0,1 302,348 Z"
                fill="#f59e0b"
                opacity={activeConcertStand === 'ALL' || activeConcertStand === 'SOUTH_PREMIUM' ? 1 : 0.4}
                className="cursor-pointer transition-all hover:opacity-100 hover:brightness-125 filter drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                onClick={() => setActiveConcertStand(activeConcertStand === 'SOUTH_PREMIUM' ? 'ALL' : 'SOUTH_PREMIUM')}
              />
              <text x="350" y="375" fill="#000" fontSize="11" fontWeight="900" textAnchor="middle">SOUTH PREMIUM</text>
              <text x="350" y="390" fill="#000" fontSize="9" fontWeight="900" textAnchor="middle">West · Center · East (₹12,500)</text>

              {/* ---------------- STANDING (FLOOR) ARENA ---------------- */}
              <circle
                cx="350"
                cy="260"
                r="95"
                fill="#c8a364"
                stroke="#d4af37"
                strokeWidth="3"
                opacity={activeConcertStand === 'ALL' || activeConcertStand === 'FLOOR' ? 0.95 : 0.45}
                className="cursor-pointer transition-all hover:opacity-100 hover:brightness-110"
                onClick={() => setActiveConcertStand(activeConcertStand === 'FLOOR' ? 'ALL' : 'FLOOR')}
              />

              {/* Sound mixing tents / delay towers */}
              <rect x="300" y="270" width="16" height="22" rx="3" fill="#ffffff" opacity="0.85" />
              <rect x="384" y="270" width="16" height="22" rx="3" fill="#ffffff" opacity="0.85" />
              <rect x="320" y="315" width="18" height="12" rx="2" fill="#ffffff" opacity="0.85" />
              <rect x="362" y="315" width="18" height="12" rx="2" fill="#ffffff" opacity="0.85" />

              {/* Runway / Catwalk */}
              <rect x="345" y="150" width="10" height="70" fill="#ffffff" opacity="0.9" />
              <circle cx="350" cy="220" r="14" fill="#ffffff" opacity="0.9" />

              {/* Standing Floor Label */}
              <text x="350" y="250" fill="#000" fontSize="12" fontWeight="900" textAnchor="middle">STANDING (FLOOR)</text>
              <text x="350" y="266" fill="#000" fontSize="10" fontWeight="800" textAnchor="middle">₹6,450</text>

              {/* ---------------- MAIN STAGE ---------------- */}
              <rect
                x="260"
                y="85"
                width="180"
                height="65"
                rx="8"
                fill="#ffffff"
                stroke="#38bdf8"
                strokeWidth="3"
                className="filter drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              />
              <text x="350" y="125" fill="#0f172a" fontSize="18" fontWeight="900" letterSpacing="3" textAnchor="middle">
                STAGE
              </text>
            </svg>
          </div>

          {/* Stand Category Selector Bar */}
          <div className="stand-filter-tabs">
            <button
              className={`stand-tab ${activeConcertStand === 'ALL' ? 'active' : ''}`}
              onClick={() => setActiveConcertStand('ALL')}
            >
              🏟️ All Stadium Stands
            </button>
            {concertStands.map(stand => (
              <button
                key={stand.id}
                className={`stand-tab ${activeConcertStand === stand.id ? 'active' : ''}`}
                style={{
                  borderColor: activeConcertStand === stand.id ? stand.color : undefined,
                }}
                onClick={() => setActiveConcertStand(stand.id)}
              >
                <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: stand.color }} />
                <span>{stand.name.split(' (')[0]}</span>
                <span className="text-xs font-mono opacity-80">₹{stand.price}</span>
              </button>
            ))}
          </div>

          {/* Interactive Seats / Passes Grid for Active Stand */}
          <div className="concert-seats-panel">
            {filteredConcertStands.map(stand => (
              <div key={stand.id} className="concert-stand-card" style={{ borderLeftColor: stand.color }}>
                <div className="concert-stand-header">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: stand.color }} />
                      <h4 className="font-extrabold text-foreground text-sm sm:text-base">{stand.name}</h4>
                      <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded bg-surface border border-border">
                        {stand.tag}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{stand.description}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground block">Price per ticket</span>
                    <strong className="text-lg font-black text-amber-400 font-mono">₹{stand.price}</strong>
                  </div>
                </div>

                {/* Seats / Ticket Pass Units */}
                <div className="concert-stand-seats">
                  {stand.seats.map(seat => {
                    const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id)
                    const isBooked = seat.status === 'BOOKED'
                    return (
                      <button
                        key={seat.seat_id}
                        disabled={isBooked}
                        className={`concert-seat-pill ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => onToggleSeat({ ...seat, calculated_price: stand.price })}
                        onMouseEnter={() => setHoveredSeat({ ...seat, calculated_price: stand.price, standName: stand.name })}
                        onMouseLeave={() => setHoveredSeat(null)}
                      >
                        <span className="seat-code">{seat.seat_number}</span>
                        <span className="seat-status-dot" />
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Live Tooltip & Legend matching reference */}
          <div className="h-6 flex items-center justify-center text-xs font-semibold text-muted-foreground my-2">
            {hoveredSeat ? (
              <span className="text-foreground flex items-center gap-2 bg-surface-raised px-3 py-1 rounded-full border border-border">
                <span className="text-amber-400 font-bold">{hoveredSeat.standName || 'Seat'} · {hoveredSeat.seat_number}</span> · <span className="text-emerald-400 font-mono">₹{hoveredSeat.calculated_price}</span>
              </span>
            ) : (
              <span>Click on any stand above or select seats directly to reserve</span>
            )}
          </div>

          {/* Concert Pricing Reference Legend */}
          <div className="concert-legend-grid">
            <div className="legend-section-title">SEATED (STANDS)</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#10b981' }} />
                <span>Lower - C & F (₹3,000)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#06b6d4' }} />
                <span>Lower - B & G (₹4,500)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#38bdf8' }} />
                <span>Lower - A & H (₹9,500)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#f59e0b' }} />
                <span>South Premium (₹12,500)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#f43f5e' }} />
                <span>Upper - L & P (₹2,500)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#c084fc' }} />
                <span>Upper - K & Q (₹3,500)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#fb7185' }} />
                <span>Upper - J & R (₹6,500)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded" style={{ backgroundColor: '#c8a364' }} />
                <span>Standing Floor (₹6,450)</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ===================== CINEMA THEATER MODE ===================== */
        <div className="theater-container">
          <div className="screen-stage">
            <div className="screen-curve" />
            <div className="screen-glow-beam" />
            <div className="screen-title">
              <span>SCREEN THIS WAY</span>
            </div>
          </div>

          <div className="seating-hall">
            {cinemaSections.map(sec => (
              <div key={sec.category} className="tier-section">
                <div className="tier-header">
                  <span className="tier-name">{sec.title}</span>
                  <span className="tier-price">₹{sec.price}</span>
                </div>

                <div className="tier-rows">
                  {sec.rows.map(({ rowLabel, seats }) => {
                    const { left, center, right } = splitRowIntoBlocks(seats)

                    return (
                      <div key={rowLabel} className="theater-row">
                        <span className="row-indicator">{rowLabel}</span>

                        <div className="seat-cluster">
                          {left.map(seat => {
                            const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id)
                            const isBooked = seat.status === 'BOOKED'
                            return (
                              <button
                                key={seat.seat_id}
                                disabled={isBooked}
                                className={`seat-unit ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                                onClick={() => onToggleSeat(seat)}
                                onMouseEnter={() => setHoveredSeat(seat)}
                                onMouseLeave={() => setHoveredSeat(null)}
                                aria-label={`Seat ${seat.seat_number} - ₹${seat.calculated_price}`}
                              >
                                <CinemaChair isSelected={isSelected} isBooked={isBooked} category={seat.seat_category} />
                                <span className="seat-number-label">{seat.seat_number}</span>
                              </button>
                            )
                          })}
                        </div>

                        {center.length > 0 && <div className="aisle-space" />}

                        {center.length > 0 && (
                          <div className="seat-cluster center-cluster">
                            {center.map(seat => {
                              const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id)
                              const isBooked = seat.status === 'BOOKED'
                              return (
                                <button
                                  key={seat.seat_id}
                                  disabled={isBooked}
                                  className={`seat-unit ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                                  onClick={() => onToggleSeat(seat)}
                                  onMouseEnter={() => setHoveredSeat(seat)}
                                  onMouseLeave={() => setHoveredSeat(null)}
                                  aria-label={`Seat ${seat.seat_number} - ₹${seat.calculated_price}`}
                                >
                                  <CinemaChair isSelected={isSelected} isBooked={isBooked} category={seat.seat_category} />
                                  <span className="seat-number-label">{seat.seat_number}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}

                        {right.length > 0 && <div className="aisle-space" />}

                        {right.length > 0 && (
                          <div className="seat-cluster">
                            {right.map(seat => {
                              const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id)
                              const isBooked = seat.status === 'BOOKED'
                              return (
                                <button
                                  key={seat.seat_id}
                                  disabled={isBooked}
                                  className={`seat-unit ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                                  onClick={() => onToggleSeat(seat)}
                                  onMouseEnter={() => setHoveredSeat(seat)}
                                  onMouseLeave={() => setHoveredSeat(null)}
                                  aria-label={`Seat ${seat.seat_number} - ₹${seat.calculated_price}`}
                                >
                                  <CinemaChair isSelected={isSelected} isBooked={isBooked} category={seat.seat_category} />
                                  <span className="seat-number-label">{seat.seat_number}</span>
                                </button>
                              )
                            })}
                          </div>
                        )}

                        <span className="row-indicator">{rowLabel}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          <div className="h-6 flex items-center justify-center text-xs font-semibold text-muted-foreground my-2">
            {hoveredSeat ? (
              <span className="text-foreground flex items-center gap-2 bg-surface-raised px-3 py-1 rounded-full border border-border">
                <span className="text-primary font-bold">Seat {hoveredSeat.seat_number}</span> · {hoveredSeat.seat_category} · <span className="text-emerald-400 font-mono">₹{hoveredSeat.calculated_price}</span>
              </span>
            ) : (
              <span>Tap or hover over any available seat to view details</span>
            )}
          </div>

          <div className="theater-legend">
            <div className="legend-item">
              <span className="legend-icon available-icon" />
              <span>Available ({availableCount})</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon reserved-icon" />
              <span>Reserved / Booked</span>
            </div>
            <div className="legend-item">
              <span className="legend-icon selected-icon" />
              <span>Selected ({selectedSeats.length})</span>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Checkout Bar */}
      <div className="flow-bottom">
        <div>
          <small className="text-xs text-muted-foreground block font-medium">
            {isConcert ? 'Concert Passes Selected' : 'Seats Selected'} ({selectedSeats.length})
          </small>
          <div className="selected-seats-pills">
            {selectedSeats.length === 0 ? (
              <span className="text-xs text-muted-foreground">Select stands or seats in the arena above to proceed</span>
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
            <strong className="text-2xl font-black text-primary font-mono">₹{seatSubtotal}</strong>
          </div>

          <button
            className="primary py-3 px-6 text-sm font-bold shadow-lg"
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
