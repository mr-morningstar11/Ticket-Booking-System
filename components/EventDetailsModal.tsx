'use client'

import { useState } from 'react'
import { ArrowLeft, Heart, Video, ArrowRight, X } from 'lucide-react'

interface EventDetailsModalProps {
  selectedEvent: any
  eventDetails: any
  selectedDate: string
  selectedShow: any
  likedEvents: number[]
  onBack: () => void
  onToggleLike: (e: React.MouseEvent, eventId: number) => void
  onSelectDate: (date: string) => void
  onSelectShow: (show: any) => void
  onJoinWaitlist: (eventId: number) => void
}

export function EventDetailsModal({
  selectedEvent,
  eventDetails,
  selectedDate,
  selectedShow,
  likedEvents,
  onBack,
  onToggleLike,
  onSelectDate,
  onSelectShow,
  onJoinWaitlist,
}: EventDetailsModalProps) {
  const [isTrailerOpen, setIsTrailerOpen] = useState(false)

  if (!selectedEvent || !eventDetails) return null

  const isLiked = likedEvents.includes(selectedEvent.event_id)
  const uniqueDates = Array.from(new Set(eventDetails.shows?.map((s: any) => s.show_date) || [])) as string[]

  return (
    <section className="flow">
      <button className="back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to discover events
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Poster & Trailer */}
        <div className="lg:col-span-1">
          <div
            className="w-full aspect-[3/4] rounded-xl overflow-hidden bg-cover bg-center border border-border shadow-2xl relative mb-4"
            style={{ backgroundImage: `url(${selectedEvent.poster_url || selectedEvent.banner_url})` }}
          >
            <button
              className={`heart-btn ${isLiked ? 'liked' : ''}`}
              onClick={e => onToggleLike(e, selectedEvent.event_id)}
            >
              <Heart size={18} fill={isLiked ? '#ff3366' : 'none'} />
            </button>
          </div>

          <button className="outline-btn w-full mb-3" onClick={() => setIsTrailerOpen(true)}>
            <Video size={16} /> Watch Official Preview
          </button>
        </div>

        {/* Metadata & Shows */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <div className="eyebrow">{selectedEvent.event_type} · {selectedEvent.age_rating || 'UA'}</div>
            {selectedEvent.status === 'UPCOMING' ? (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                ✨ UPCOMING RELEASE
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                🔥 NOW SHOWING
              </span>
            )}
          </div>
          <h1 className="text-4xl font-extrabold mb-3">{selectedEvent.title}</h1>
          <p className="text-muted-foreground text-sm mb-6 leading-relaxed">{selectedEvent.description}</p>

          {/* Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-surface rounded-lg border border-border mb-8 text-xs">
            <div>
              <span className="text-muted-foreground block">GENRE</span>
              <strong className="text-foreground">{eventDetails.genre || eventDetails.concert_genre || 'Entertainment'}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block">{eventDetails.director ? 'DIRECTOR' : 'ARTIST'}</span>
              <strong className="text-foreground">{eventDetails.director || eventDetails.artist || 'Live Performer'}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block">DURATION</span>
              <strong className="text-foreground">{eventDetails.duration_minutes ? `${eventDetails.duration_minutes} mins` : '3 Hours'}</strong>
            </div>
            <div>
              <span className="text-muted-foreground block">CITY</span>
              <strong className="text-foreground">{eventDetails.city}</strong>
            </div>
          </div>

          {/* Formats */}
          {eventDetails.formats && eventDetails.formats.length > 0 && (
            <div className="mb-6">
              <span className="eyebrow text-xs mb-2 block">Available Formats</span>
              <div className="flex gap-2 flex-wrap">
                {eventDetails.formats.map((f: any) => (
                  <span key={f.format_name} className="px-3 py-1.5 bg-surface-raised border border-border rounded-md text-xs font-bold">
                    {f.format_name} · ₹{f.price}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Showtimes */}
          <div className="shows-container">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-bold">
                  Select Show & Time
                </h3>
                <span className="text-xs text-muted-foreground">
                  {uniqueDates.length} dates available for booking
                </span>
              </div>
              <span className="text-xs text-primary font-semibold">
                {selectedEvent.status === 'UPCOMING' ? '✨ Advance Booking' : '⚡ Instant Confirmation'}
              </span>
            </div>

            {eventDetails.shows && eventDetails.shows.length > 0 ? (
              <>
                {/* Date Pills */}
                <div className="show-dates">
                  {uniqueDates.map(d => {
                    const [y, m, day] = d.split('-').map(Number)
                    const dateObj = y && m && day ? new Date(y, m - 1, day) : new Date(d)
                    const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' })
                    const monthDay = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                    return (
                      <button
                        key={d}
                        className={`date-pill ${selectedDate === d ? 'active' : ''}`}
                        onClick={() => onSelectDate(d)}
                      >
                        <strong>{weekday}</strong>
                        <div>{monthDay}</div>
                      </button>
                    )
                  })}
                </div>

                {/* Show Slots */}
                <div className="showtime-slots">
                  {eventDetails.shows
                    .filter((s: any) => !selectedDate || s.show_date === selectedDate)
                    .map((show: any) => {
                      const isAvailable = show.available_seats_count > 0
                      return (
                        <div
                          key={show.show_id}
                          className={`slot-card ${selectedShow?.show_id === show.show_id ? 'active' : ''}`}
                        >
                          <div className="slot-time">
                            <span>{show.start_time}</span>
                            <span className="text-primary font-mono text-sm">₹{show.ticket_price}</span>
                          </div>
                          <div className="slot-meta">
                            <span className="slot-badge">{show.format_name || '2D'}</span>
                            <span className="slot-badge">{show.language || 'English'}</span>
                            <span className="slot-badge">{show.screen_name}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground mt-1">
                            {show.venue_name}
                          </div>
                          <div className="text-[10px] text-emerald-400 font-semibold mt-1">
                            {isAvailable ? `${show.available_seats_count} seats available` : 'Sold out'}
                          </div>

                          <button
                            className="primary mt-2 py-2 text-xs"
                            disabled={!isAvailable}
                            onClick={() => onSelectShow(show)}
                          >
                            {isAvailable ? 'Select Seats' : 'Sold Out'}
                          </button>
                        </div>
                      )
                    })}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm mb-4">No scheduled shows currently open online for this event.</p>
                <button className="primary mx-auto" onClick={() => onJoinWaitlist(selectedEvent.event_id)}>
                  Join Priority Waitlist
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {isTrailerOpen && (
        <div className="modal-overlay" onClick={() => setIsTrailerOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <button className="modal-close" onClick={() => setIsTrailerOpen(false)}><X size={16} /></button>
            <h3 className="text-xl font-bold mb-4">{selectedEvent.title} — Official Teaser</h3>
            <div className="w-full aspect-video rounded-lg overflow-hidden bg-black border border-border flex items-center justify-center">
              <div className="text-center p-6">
                <Video size={44} className="mx-auto mb-3 text-primary" />
                <p className="font-bold">{selectedEvent.title}</p>
                <p className="text-xs text-muted-foreground mt-1">HD Preview Trailer Stream</p>
                <a
                  href={`https://www.youtube.com/results?search_query=${encodeURIComponent(selectedEvent.title + ' trailer')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="primary mt-4 inline-flex items-center gap-2 text-xs"
                >
                  Watch on YouTube <ArrowRight size={14} />
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
