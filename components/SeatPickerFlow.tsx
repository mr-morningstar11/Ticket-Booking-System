'use client'

import { useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Clock3, Sparkles, User, Info, Check, RotateCcw, MapPin, Disc3, Music2, Layers, Calendar, Play, Volume2 } from 'lucide-react'
import Orb from './Orb'

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

// Polar to Cartesian Annular Sector Path Generator
function createAnnularSector(cx: number, cy: number, rIn: number, rOut: number, startDeg: number, endDeg: number): string {
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const startRad = toRad(startDeg)
  const endRad = toRad(endDeg)

  const x1 = cx + rOut * Math.cos(startRad)
  const y1 = cy + rOut * Math.sin(startRad)
  const x2 = cx + rOut * Math.cos(endRad)
  const y2 = cy + rOut * Math.sin(endRad)
  const x3 = cx + rIn * Math.cos(endRad)
  const y3 = cy + rIn * Math.sin(endRad)
  const x4 = cx + rIn * Math.cos(startRad)
  const y4 = cy + rIn * Math.sin(startRad)

  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0
  return `M ${x1.toFixed(1)},${y1.toFixed(1)} A ${rOut},${rOut} 0 ${largeArc},1 ${x2.toFixed(1)},${y2.toFixed(1)} L ${x3.toFixed(1)},${y3.toFixed(1)} A ${rIn},${rIn} 0 ${largeArc},0 ${x4.toFixed(1)},${y4.toFixed(1)} Z`
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
  const [activeConcertStand, setActiveConcertStand] = useState<string>('FLOOR')

  const isConcert = selectedEvent?.event_type === 'CONCERT'

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60)
    const s = secs % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Cinema Tier grouping
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

    const standardRows = ['A', 'B', 'C'].filter(r => rowsMap[r] && rowsMap[r].length > 0).map(r => ({ rowLabel: r, seats: rowsMap[r] }))
    if (standardRows.length > 0) {
      result.push({
        category: 'STANDARD',
        title: 'EXECUTIVE STANDARD',
        multiplier: 1.0,
        price: Math.round(selectedShow.ticket_price * 1.0),
        rows: standardRows,
      })
    }

    const premiumRows = ['D', 'E'].filter(r => rowsMap[r] && rowsMap[r].length > 0).map(r => ({ rowLabel: r, seats: rowsMap[r] }))
    if (premiumRows.length > 0) {
      result.push({
        category: 'PREMIUM',
        title: 'PREMIUM PRIME',
        multiplier: 1.4,
        price: Math.round(selectedShow.ticket_price * 1.4),
        rows: premiumRows,
      })
    }

    const vipRows = ['F', 'G'].filter(r => rowsMap[r] && rowsMap[r].length > 0).map(r => ({ rowLabel: r, seats: rowsMap[r] }))
    if (vipRows.length > 0) {
      result.push({
        category: 'VIP',
        title: 'VIP CLUB',
        multiplier: 1.8,
        price: Math.round(selectedShow.ticket_price * 1.8),
        rows: vipRows,
      })
    }

    if (rowsMap['H'] && rowsMap['H'].length > 0) {
      result.push({
        category: 'VVIP',
        title: 'VVIP / RECLINERS',
        multiplier: 2.4,
        price: Math.round(selectedShow.ticket_price * 2.4),
        rows: [{ rowLabel: 'H', seats: rowsMap['H'] }],
      })
    }

    if (result.length === 0) {
      const allRows = Object.keys(rowsMap).sort().map(r => ({ rowLabel: r, seats: rowsMap[r] }))
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

  // Concentric Inner-Circle Stadium Stands
  const concertStands = useMemo(() => {
    const basePrice = selectedShow.ticket_price || 2500

    return [
      {
        id: 'FLOOR',
        code: 'GA',
        name: 'Standing (Floor)',
        tag: 'GENERAL ADMISSION',
        price: Math.round(basePrice * 2.5),
        color: '#6366f1',
        gradient: 'linear-gradient(135deg, #818cf8, #4f46e5)',
        textColor: '#ffffff',
        seats: showSeats.filter(s => s.row_label === 'A' || s.row_label === 'B'),
        description: 'Direct Stage & Runway Front Access · Unreserved Standing Arena',
        viewRating: '★★★★★ Center Front',
      },
      {
        id: 'SOUTH_PREMIUM',
        code: 'SP',
        name: 'South Premium',
        tag: 'VVIP ELEVATED',
        price: Math.round(basePrice * 4.8),
        color: '#f59e0b',
        gradient: 'linear-gradient(135deg, #fde047, #d97706)',
        textColor: '#000000',
        seats: showSeats.filter(s => s.row_label === 'H'),
        description: 'Prime Center Elevated Panoramic Direct Stage Perspective',
        viewRating: '★★★★★ Best Overall',
      },
      {
        id: 'LOWER_AH',
        code: 'L-AH',
        name: 'Lower Stand - A & H',
        tag: 'LOWER BOWL',
        price: Math.round(basePrice * 3.6),
        color: '#06b6d4',
        gradient: 'linear-gradient(135deg, #38bdf8, #0284c7)',
        textColor: '#000000',
        seats: showSeats.filter(s => s.row_label === 'F' || s.row_label === 'G'),
        description: 'Close Proximity Wing Stands with Direct Performer Sightline',
        viewRating: '★★★★☆ Stage Wings',
      },
      {
        id: 'LOWER_BG',
        code: 'L-BG',
        name: 'Lower Stand - B & G',
        tag: 'LOWER BOWL',
        price: Math.round(basePrice * 1.8),
        color: '#10b981',
        gradient: 'linear-gradient(135deg, #34d399, #059669)',
        textColor: '#000000',
        seats: showSeats.filter(s => s.row_label === 'D' || s.row_label === 'E'),
        description: 'Side Lower Tier Arena View with Crystal Clear Acoustics',
        viewRating: '★★★★☆ Lower Mid',
      },
      {
        id: 'LOWER_CF',
        code: 'L-CF',
        name: 'Lower Stand - C & F',
        tag: 'LOWER BOWL',
        price: Math.round(basePrice * 1.2),
        color: '#ef4444',
        gradient: 'linear-gradient(135deg, #fb7185, #b91c1c)',
        textColor: '#ffffff',
        seats: showSeats.filter(s => s.row_label === 'C'),
        description: 'Side Stage Wing Seating with Close Performer Proximity',
        viewRating: '★★★☆☆ Side Stage',
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

  const activeStandObject = concertStands.find(s => s.id === activeConcertStand) || concertStands[0]

  // Scaled Up Stadium Arena Arc Geometry:
  // Center: (300, 270)
  // Inner Radius: Rin = 125, Outer Radius: Rout = 215
  const cx = 300
  const cy = 270

  const lowerCPath = useMemo(() => createAnnularSector(cx, cy, 125, 215, 188, 235), [])
  const lowerFPath = useMemo(() => createAnnularSector(cx, cy, 125, 215, 305, 352), [])
  const lowerBPath = useMemo(() => createAnnularSector(cx, cy, 125, 215, 140, 185), [])
  const lowerGPath = useMemo(() => createAnnularSector(cx, cy, 125, 215, -5, 40), [])
  const lowerAPath = useMemo(() => createAnnularSector(cx, cy, 125, 215, 107, 137), [])
  const lowerHPath = useMemo(() => createAnnularSector(cx, cy, 125, 215, 43, 73), [])
  const southPremPath = useMemo(() => createAnnularSector(cx, cy, 120, 220, 76, 104), [])

  return (
    <section className="flow max-w-6xl mx-auto">
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
          {/* Dynamic WebGL Ambient Orb Background from React Bits */}
          <div className="stadium-orb-backdrop">
            <Orb
              hue={263}
              hoverIntensity={0.35}
              rotateOnHover={true}
              forceHoverState={false}
              backgroundColor="#080d16"
            />
          </div>

          {/* Musico-Inspired Concert Tour Artist Hero Banner with Respected Images */}
          <div className="concert-artist-hero mb-6 relative overflow-hidden rounded-2xl border border-sky-500/25 bg-slate-950/70 backdrop-blur-xl p-4 sm:p-5 shadow-2xl z-10">
            {/* Artist Stage Backdrop Overlay */}
            {selectedEvent.banner_url && (
              <div
                className="absolute inset-0 bg-cover bg-center opacity-25 pointer-events-none mix-blend-luminosity filter blur-[1px]"
                style={{ backgroundImage: `url(${selectedEvent.banner_url})` }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/80 to-slate-950/40 pointer-events-none" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
              {/* Left: Respected Artist Photo Avatar + Tour Title + Venue */}
              <div className="flex items-center gap-4 text-left w-full md:w-auto">
                {selectedEvent.poster_url && (
                  <div className="relative flex-shrink-0 group">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-amber-400/80 shadow-[0_0_20px_rgba(245,158,11,0.4)] bg-slate-800">
                      <img
                        src={selectedEvent.poster_url}
                        alt={selectedEvent.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border border-slate-900"></span>
                    </span>
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="text-[11px] font-black tracking-widest text-amber-300 uppercase">
                      {selectedEvent.title} · WORLD TOUR ARENA
                    </span>
                    <Sparkles size={14} className="text-amber-400" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
                    {selectedShow.venue_name.toUpperCase()}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-sky-200 mt-1 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={13} className="text-sky-400" />
                      {selectedShow.show_date}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock3 size={13} className="text-amber-400" />
                      {selectedShow.start_time || '07:00 PM'}
                    </span>
                    {selectedEvent.artist && (
                      <>
                        <span>•</span>
                        <span className="text-amber-300 font-bold">Artist: {selectedEvent.artist}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Musico Live Waveform / Audio Track Preview Card */}
              <div className="flex items-center gap-3 bg-slate-900/90 border border-sky-500/30 rounded-xl px-4 py-2.5 shadow-lg backdrop-blur-md self-stretch md:self-auto justify-between md:justify-start">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-slate-950 shadow-md flex-shrink-0">
                  <Music2 size={20} className="animate-bounce" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-white uppercase tracking-wider">Live Tour Audio</span>
                    <span className="text-[9px] px-1.5 py-0.5 bg-rose-500/20 text-rose-400 border border-rose-500/40 rounded font-bold uppercase">LIVE</span>
                  </div>
                  {/* Animated Sound Waveform Bars */}
                  <div className="flex items-center gap-1 mt-1 h-3.5">
                    <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3" />
                    <span className="w-1 bg-rose-400 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-4" />
                    <span className="w-1 bg-sky-400 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-2.5" />
                    <span className="w-1 bg-emerald-400 rounded-full animate-[pulse_0.9s_ease-in-out_infinite] h-3.5" />
                    <span className="w-1 bg-purple-400 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-2" />
                    <span className="w-1 bg-amber-400 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-3.5" />
                    <span className="text-[10px] text-slate-300 ml-1.5 font-mono">320kbps Stadium Mix</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side 2-Column Split: Enlarged Inner-Circle Map on Left, Stand Details on Right */}
          <div className="stadium-split-layout">

            {/* LEFT COLUMN: Enlarged Inner-Circle Stadium Map */}
            <div className="stadium-map-column">
              <div className="stadium-map-wrapper w-full">
                <svg
                  viewBox="0 0 600 540"
                  className="w-full max-w-[540px] mx-auto filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.9)]"
                >
                  <defs>
                    {/* Floor Area Gradient */}
                    <radialGradient id="gradFloor" cx="50%" cy="40%" r="65%">
                      <stop offset="0%" stopColor="#818cf8" />
                      <stop offset="55%" stopColor="#6366f1" />
                      <stop offset="100%" stopColor="#4338ca" />
                    </radialGradient>

                    {/* South Premium Gradient */}
                    <linearGradient id="gradSouthPrem" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fde047" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#d97706" />
                    </linearGradient>

                    {/* Lower Stand A & H (Cyan) */}
                    <linearGradient id="gradLowerAH" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#38bdf8" />
                      <stop offset="55%" stopColor="#06b6d4" />
                      <stop offset="100%" stopColor="#0284c7" />
                    </linearGradient>

                    {/* Lower Stand B & G (Emerald Mint) */}
                    <linearGradient id="gradLowerBG" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#34d399" />
                      <stop offset="55%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#047857" />
                    </linearGradient>

                    {/* Lower Stand C & F (Crimson Rose) */}
                    <linearGradient id="gradLowerCF" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#fb7185" />
                      <stop offset="50%" stopColor="#ef4444" />
                      <stop offset="100%" stopColor="#b91c1c" />
                    </linearGradient>

                    {/* Main Stage Gradient */}
                    <linearGradient id="gradStage" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#ffffff" />
                      <stop offset="100%" stopColor="#e0f2fe" />
                    </linearGradient>
                  </defs>

                  {/* Stadium Base Plate (Transparent / Subtle Dashed Outline) */}
                  <circle cx="300" cy="270" r="235" fill="transparent" stroke="rgba(56, 189, 248, 0.2)" strokeDasharray="5 5" strokeWidth="1.5" />

                  {/* ---------------- INNER CONCENTRIC STANDS ---------------- */}
                  {/* Lower C (Stage Left Wing) */}
                  <path
                    d={lowerCPath}
                    fill="url(#gradLowerCF)"
                    stroke={activeConcertStand === 'LOWER_CF' ? '#ffffff' : '#1e293b'}
                    strokeWidth={activeConcertStand === 'LOWER_CF' ? 4 : 2}
                    opacity={activeConcertStand === 'LOWER_CF' ? 1 : 0.9}
                    className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:stroke-white"
                    onClick={() => setActiveConcertStand('LOWER_CF')}
                  />

                  {/* Lower F (Stage Right Wing) */}
                  <path
                    d={lowerFPath}
                    fill="url(#gradLowerCF)"
                    stroke={activeConcertStand === 'LOWER_CF' ? '#ffffff' : '#1e293b'}
                    strokeWidth={activeConcertStand === 'LOWER_CF' ? 4 : 2}
                    opacity={activeConcertStand === 'LOWER_CF' ? 1 : 0.9}
                    className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:stroke-white"
                    onClick={() => setActiveConcertStand('LOWER_CF')}
                  />

                  {/* Lower B */}
                  <path
                    d={lowerBPath}
                    fill="url(#gradLowerBG)"
                    stroke={activeConcertStand === 'LOWER_BG' ? '#ffffff' : '#1e293b'}
                    strokeWidth={activeConcertStand === 'LOWER_BG' ? 4 : 2}
                    opacity={activeConcertStand === 'LOWER_BG' ? 1 : 0.9}
                    className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:stroke-white"
                    onClick={() => setActiveConcertStand('LOWER_BG')}
                  />

                  {/* Lower G */}
                  <path
                    d={lowerGPath}
                    fill="url(#gradLowerBG)"
                    stroke={activeConcertStand === 'LOWER_BG' ? '#ffffff' : '#1e293b'}
                    strokeWidth={activeConcertStand === 'LOWER_BG' ? 4 : 2}
                    opacity={activeConcertStand === 'LOWER_BG' ? 1 : 0.9}
                    className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:stroke-white"
                    onClick={() => setActiveConcertStand('LOWER_BG')}
                  />

                  {/* Lower A */}
                  <path
                    d={lowerAPath}
                    fill="url(#gradLowerAH)"
                    stroke={activeConcertStand === 'LOWER_AH' ? '#ffffff' : '#1e293b'}
                    strokeWidth={activeConcertStand === 'LOWER_AH' ? 4 : 2}
                    opacity={activeConcertStand === 'LOWER_AH' ? 1 : 0.9}
                    className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:stroke-white"
                    onClick={() => setActiveConcertStand('LOWER_AH')}
                  />

                  {/* Lower H */}
                  <path
                    d={lowerHPath}
                    fill="url(#gradLowerAH)"
                    stroke={activeConcertStand === 'LOWER_AH' ? '#ffffff' : '#1e293b'}
                    strokeWidth={activeConcertStand === 'LOWER_AH' ? 4 : 2}
                    opacity={activeConcertStand === 'LOWER_AH' ? 1 : 0.9}
                    className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:stroke-white"
                    onClick={() => setActiveConcertStand('LOWER_AH')}
                  />

                  {/* ---------------- SOUTH PREMIUM (CENTER ELEVATED) ---------------- */}
                  <path
                    d={southPremPath}
                    fill="url(#gradSouthPrem)"
                    stroke={activeConcertStand === 'SOUTH_PREMIUM' ? '#ffffff' : '#fbbf24'}
                    strokeWidth={activeConcertStand === 'SOUTH_PREMIUM' ? 4 : 2.5}
                    opacity={activeConcertStand === 'SOUTH_PREMIUM' ? 1 : 0.9}
                    className="cursor-pointer transition-all duration-200 hover:brightness-125 hover:stroke-white filter drop-shadow-[0_0_16px_rgba(245,158,11,0.7)]"
                    onClick={() => setActiveConcertStand('SOUTH_PREMIUM')}
                  />

                  {/* ---------------- STANDING (FLOOR) ARENA ---------------- */}
                  <circle
                    cx="300"
                    cy="270"
                    r="110"
                    fill="url(#gradFloor)"
                    stroke={activeConcertStand === 'FLOOR' ? '#ffffff' : '#818cf8'}
                    strokeWidth={activeConcertStand === 'FLOOR' ? 4 : 2.5}
                    opacity={activeConcertStand === 'FLOOR' ? 1 : 0.9}
                    className="cursor-pointer transition-all duration-200 hover:brightness-110 hover:stroke-white"
                    onClick={() => setActiveConcertStand('FLOOR')}
                  />

                  {/* Sound mixing tents / delay towers */}
                  <rect x="245" y="275" width="20" height="24" rx="4" fill="#ffffff" opacity="0.9" />
                  <rect x="335" y="275" width="20" height="24" rx="4" fill="#ffffff" opacity="0.9" />
                  <rect x="270" y="325" width="22" height="15" rx="3" fill="#ffffff" opacity="0.9" />
                  <rect x="308" y="325" width="22" height="15" rx="3" fill="#ffffff" opacity="0.9" />

                  {/* Runway / Catwalk */}
                  <rect x="295" y="130" width="10" height="90" fill="#ffffff" opacity="0.9" />
                  <circle cx="300" cy="220" r="16" fill="#ffffff" opacity="0.95" />

                  {/* ---------------- MAIN STAGE ---------------- */}
                  <rect
                    x="200"
                    y="55"
                    width="200"
                    height="75"
                    rx="8"
                    fill="url(#gradStage)"
                    stroke="#38bdf8"
                    strokeWidth="3.5"
                    className="filter drop-shadow-[0_0_25px_rgba(56,189,248,0.85)]"
                  />
                  <text x="300" y="100" fill="#0f172a" fontSize="19" fontWeight="900" letterSpacing="4" textAnchor="middle">
                    STAGE
                  </text>
                </svg>
              </div>
            </div>

            {/* RIGHT COLUMN: Stand Categories & Active Stand Seat Selection */}
            <div className="stadium-details-column">

              {/* Stand Categories Selector (Visible Next to Stage/Arena Block) */}
              <div className="stadium-categories-panel">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Layers size={14} className="text-sky-400" /> Arena Stands & Categories
                  </span>
                  <span className="text-[11px] text-muted-foreground font-medium">
                    Select stand or click on map
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {concertStands.map(s => {
                    const isCurrent = activeConcertStand === s.id
                    return (
                      <button
                        key={s.id}
                        className={`stand-overview-item ${isCurrent ? 'current' : ''}`}
                        style={{
                          borderLeftWidth: '4px',
                          borderLeftColor: s.color,
                        }}
                        onClick={() => setActiveConcertStand(s.id)}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-3.5 h-3.5 rounded-full flex-shrink-0 shadow" style={{ background: s.gradient }} />
                          <span className="truncate text-xs font-bold">{s.name.split(' (')[0]}</span>
                        </div>
                        <span className="text-xs font-mono font-black text-amber-400">₹{s.price}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Active Stand Detail & Seat Selection Card */}
              <div className="active-stand-card" style={{ borderTopWidth: '4px', borderTopColor: activeStandObject.color }}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full shadow" style={{ background: activeStandObject.gradient }} />
                      <h4 className="text-lg font-black text-white">{activeStandObject.name}</h4>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 mt-1 inline-block rounded bg-[#1e293b] border border-border text-sky-300">
                      {activeStandObject.tag} · {activeStandObject.viewRating}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-muted-foreground block">TICKET PRICE</span>
                    <strong className="text-2xl font-black text-amber-400 font-mono">₹{activeStandObject.price}</strong>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4">
                  {activeStandObject.description}
                </p>

                {/* Available Seats / Passes in this Stand */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Select Available Seats / Passes ({activeStandObject.seats.filter(s => s.status !== 'BOOKED').length} left):
                    </span>
                  </div>

                  <div className="concert-stand-seats">
                    {activeStandObject.seats.map(seat => {
                      const isSelected = selectedSeats.some(s => s.seat_id === seat.seat_id)
                      const isBooked = seat.status === 'BOOKED'
                      return (
                        <button
                          key={seat.seat_id}
                          disabled={isBooked}
                          className={`concert-seat-pill ${isBooked ? 'booked' : ''} ${isSelected ? 'selected' : ''}`}
                          onClick={() => onToggleSeat({ ...seat, calculated_price: activeStandObject.price })}
                          onMouseEnter={() => setHoveredSeat({ ...seat, calculated_price: activeStandObject.price, standName: activeStandObject.name })}
                          onMouseLeave={() => setHoveredSeat(null)}
                        >
                          <span className="seat-code">{seat.seat_number}</span>
                          <span className="seat-status-dot" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Live Hover Info */}
                <div className="h-6 flex items-center text-xs font-semibold text-muted-foreground my-2">
                  {hoveredSeat ? (
                    <span className="text-foreground flex items-center gap-2 bg-[#1e293b] px-3 py-1 rounded-full border border-border">
                      <span className="text-amber-400 font-bold">{hoveredSeat.standName || 'Seat'} · {hoveredSeat.seat_number}</span> · <span className="text-emerald-400 font-mono">₹{hoveredSeat.calculated_price}</span>
                    </span>
                  ) : (
                    <span className="text-[11px] opacity-75">Click on any pill above to add to your order</span>
                  )}
                </div>
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
