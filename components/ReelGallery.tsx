'use client'

import { useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Ticket, Sparkles, Star } from 'lucide-react'

interface ReelItem {
  event_id: number
  title: string
  event_type: string
  poster_url: string
  banner_url?: string
  base_price: number
  genre?: string
  concert_genre?: string
  city: string
}

interface ReelGalleryProps {
  events: ReelItem[]
  onSelectEvent: (event: any) => void
}

export function ReelGallery({ events, onSelectEvent }: ReelGalleryProps) {
  // Ensure we have balanced events across 3 columns
  const col1 = useMemo(() => {
    if (!events || events.length === 0) return []
    const items = events.filter((_, i) => i % 3 === 0)
    return [...items, ...items, ...items]
  }, [events])

  const col2 = useMemo(() => {
    if (!events || events.length === 0) return []
    const items = events.filter((_, i) => i % 3 === 1)
    return [...items, ...items, ...items]
  }, [events])

  const col3 = useMemo(() => {
    if (!events || events.length === 0) return []
    const items = events.filter((_, i) => i % 3 === 2)
    return [...items, ...items, ...items]
  }, [events])

  return (
    <div className="relative w-full h-[460px] sm:h-[500px] rounded-2xl overflow-hidden border border-border/80 bg-[#0d1217] shadow-2xl flex items-center justify-center">
      {/* Subtle Background Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(255,94,72,0.12),transparent_75%)] pointer-events-none" />

      {/* Header Tag */}
      <div className="absolute top-3.5 right-4 z-30 pointer-events-none">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#161f28]/90 backdrop-blur-md border border-primary/30 rounded-full shadow-lg">
          <Sparkles size={13} className="text-primary animate-spin-slow" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
            REEL GALLERY · 24 EVENTS
          </span>
        </div>
      </div>

      {/* Tilted Track Container - cleanly centered and scaled */}
      <div
        className="relative flex items-center justify-center gap-3 sm:gap-4.5 w-full h-[140%]"
        style={{
          transform: 'rotate(-8deg) scale(1.05)',
          transformOrigin: 'center center',
        }}
      >
        {/* COLUMN 1: Gliding Up */}
        <div className="reel-column flex flex-col gap-3.5 w-[130px] sm:w-[155px] shrink-0">
          <motion.div
            className="flex flex-col gap-3.5"
            animate={{ y: ['0%', '-50%'] }}
            transition={{
              duration: 26,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {col1.map((item, idx) => (
              <ReelCard key={`c1-${item.event_id}-${idx}`} item={item} onSelect={onSelectEvent} />
            ))}
          </motion.div>
        </div>

        {/* COLUMN 2: Gliding Down */}
        <div className="reel-column flex flex-col gap-3.5 w-[130px] sm:w-[155px] shrink-0">
          <motion.div
            className="flex flex-col gap-3.5"
            animate={{ y: ['-50%', '0%'] }}
            transition={{
              duration: 30,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {col2.map((item, idx) => (
              <ReelCard key={`c2-${item.event_id}-${idx}`} item={item} onSelect={onSelectEvent} />
            ))}
          </motion.div>
        </div>

        {/* COLUMN 3: Gliding Up */}
        <div className="reel-column flex flex-col gap-3.5 w-[130px] sm:w-[155px] shrink-0">
          <motion.div
            className="flex flex-col gap-3.5"
            animate={{ y: ['0%', '-50%'] }}
            transition={{
              duration: 28,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {col3.map((item, idx) => (
              <ReelCard key={`c3-${item.event_id}-${idx}`} item={item} onSelect={onSelectEvent} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Top & Bottom Soft Edge Fades (40px only, does NOT obscure cards) */}
      <div className="absolute top-0 inset-x-0 h-14 bg-gradient-to-b from-[#0d1217] via-[#0d1217]/80 to-transparent pointer-events-none z-20" />
      <div className="absolute bottom-0 inset-x-0 h-14 bg-gradient-to-t from-[#0d1217] via-[#0d1217]/80 to-transparent pointer-events-none z-20" />

      {/* Bottom Floating Hint */}
      <div className="absolute bottom-3 left-4 z-30 pointer-events-none">
        <div className="text-[10px] text-muted-foreground bg-[#11171d]/90 backdrop-blur-md px-3 py-1 rounded-full border border-border flex items-center gap-1.5 shadow-md">
          <Ticket size={11} className="text-primary" />
          <span>Click any poster to book seats</span>
        </div>
      </div>
    </div>
  )
}

function ReelCard({ item, onSelect }: { item: ReelItem; onSelect: (e: any) => void }) {
  return (
    <div
      onClick={() => onSelect(item)}
      className="group relative aspect-[2/3] w-full rounded-xl overflow-hidden border border-white/10 bg-[#161f28] cursor-pointer shadow-md transition-all duration-300 hover:scale-105 hover:border-primary hover:shadow-[0_8px_25px_rgba(255,94,72,0.4)] hover:z-30"
    >
      {/* Poster Image */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-108"
        style={{
          backgroundImage: `url(${item.poster_url || item.banner_url})`,
        }}
      />

      {/* Gentle Scrim */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

      {/* Event Type Badge */}
      <div className="absolute top-2 left-2 z-10">
        <span className="px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider bg-primary/95 text-primary-foreground shadow">
          {item.event_type}
        </span>
      </div>

      {/* Info Container */}
      <div className="absolute bottom-0 inset-x-0 p-2.5 z-10">
        <p className="text-[9px] font-bold text-primary uppercase tracking-wider truncate mb-0.5">
          {item.genre || item.concert_genre || item.city}
        </p>
        <h4 className="text-[11px] font-extrabold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors">
          {item.title}
        </h4>
        <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/10 text-[9px]">
          <span className="text-muted-foreground">₹{item.base_price}</span>
          <span className="font-bold text-emerald-400 flex items-center gap-0.5">
            <Star size={8} fill="#34d399" /> 4.9
          </span>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-20">
        <span className="px-2.5 py-1 bg-primary text-primary-foreground text-[10px] font-black rounded shadow-lg uppercase tracking-wider flex items-center gap-1">
          <Ticket size={11} /> Book
        </span>
      </div>
    </div>
  )
}
