'use client'

import { useState } from 'react'
import { MapPin, ChevronDown, RefreshCw, Ticket, Heart, ShieldCheck, Zap, RotateCcw } from 'lucide-react'

interface EventsListProps {
  events: any[]
  filteredEvents: any[]
  loading: boolean
  category: string
  selectedCity: string
  selectedFormat: string
  sortBy: string
  likedEvents: number[]
  onSelectCategory: (c: string) => void
  onSelectCity: (city: string) => void
  onSelectFormat: (format: string) => void
  onSelectSort: (sort: 'date' | 'price_asc' | 'price_desc' | 'rating') => void
  onResetFilters: () => void
  onToggleLike: (e: React.MouseEvent, eventId: number) => void
  onSelectEvent: (event: any) => void
}

export function EventsList({
  events,
  filteredEvents,
  loading,
  category,
  selectedCity,
  selectedFormat,
  sortBy,
  likedEvents,
  onSelectCategory,
  onSelectCity,
  onSelectFormat,
  onSelectSort,
  onResetFilters,
  onToggleLike,
  onSelectEvent,
}: EventsListProps) {
  const [isCityMenuOpen, setIsCityMenuOpen] = useState(false)

  const cities = ['All Cities', 'Delhi NCR', 'Gurugram', 'Delhi', 'Noida', 'Bengaluru', 'Mumbai', 'Chennai']
  const categoriesList = ['All events', 'Upcoming', 'Now Showing', 'Movies', 'Concerts', 'Delhi NCR', 'Bengaluru', 'Mumbai', 'Favorites']

  return (
    <>
      {/* Location Bar */}
      <section className="location-row">
        <div className="relative">
          <button className="location-btn" onClick={() => setIsCityMenuOpen(!isCityMenuOpen)}>
            <MapPin size={16} />
            <span>{selectedCity}</span>
            <ChevronDown size={14} />
          </button>

          {isCityMenuOpen && (
            <div className="dropdown-menu">
              {cities.map(city => {
                const count = city === 'All Cities'
                  ? events.length
                  : events.filter(e => city === 'Delhi NCR' ? e.region === 'Delhi NCR' : e.city === city).length
                return (
                  <button
                    key={city}
                    className={`dropdown-item ${selectedCity === city ? 'active' : ''}`}
                    onClick={() => {
                      onSelectCity(city)
                      setIsCityMenuOpen(false)
                    }}
                  >
                    <span>{city}</span>
                    <span className="count">{count}</span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <span className="text-xs text-muted-foreground hidden sm:inline">
          Showing {filteredEvents.length} events near you · 100% Instant E-Tickets
        </span>
      </section>

      {/* Events Section */}
      <section id="events" className="events-section">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Handpicked Experiences</span>
            <h2>Find your next<br /><em>favorite night.</em></h2>
          </div>
          <button className="text-button" onClick={onResetFilters}>
            Reset all filters <RefreshCw size={15} />
          </button>
        </div>

        {/* Filters and Sort */}
        <div className="filters-bar">
          <div className="filters-pills">
            {categoriesList.map(c => (
              <button
                key={c}
                className={category === c ? 'filter active' : 'filter'}
                onClick={() => onSelectCategory(c)}
              >
                {c === 'Favorites' ? `❤️ Favorites (${likedEvents.length})` : c === 'Upcoming' ? '✨ Upcoming' : c === 'Now Showing' ? '🔥 Now Showing' : c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedFormat}
              onChange={e => onSelectFormat(e.target.value)}
              className="sort-select"
            >
              <option value="All Formats">All Formats</option>
              <option value="IMAX 3D">IMAX 3D</option>
              <option value="2D">2D</option>
              <option value="3D">3D</option>
              <option value="4DX 3D">4DX 3D</option>
            </select>

            <select
              value={sortBy}
              onChange={e => onSelectSort(e.target.value as any)}
              className="sort-select"
            >
              <option value="date">Sort by Date</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="py-20 text-center text-muted-foreground">Loading verified events...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="empty text-center py-20">
            <Ticket size={40} className="mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-bold mb-2">No events found matching your criteria</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Try switching cities, clearing the search query, or selecting &apos;All events&apos;.
            </p>
            <button className="primary mx-auto" onClick={onResetFilters}>
              View All {events.length} Events
            </button>
          </div>
        ) : (
          <div className="event-grid">
            {filteredEvents.map(event => {
              const isLiked = likedEvents.includes(event.event_id)
              const [y, m, d] = (event.start_date || '').split('-').map(Number)
              const dateObj = y && m && d ? new Date(y, m - 1, d) : new Date(event.start_date)
              const monthStr = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()
              const dayStr = dateObj.getDate()
              const isUpcoming = event.status === 'UPCOMING'

              return (
                <article key={event.event_id} className={`event-card ${isUpcoming ? 'event-card-upcoming' : ''}`}>
                  <div className="card-image-wrap" onClick={() => onSelectEvent(event)}>
                    <div
                      className="card-image"
                      style={{
                        backgroundImage: `url(${event.poster_url || event.banner_url || 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=800&q=80'})`,
                      }}
                    />
                    <span className={`tag ${isUpcoming ? 'tag-upcoming' : ''}`}>
                      {isUpcoming ? '✨ UPCOMING' : '🔥 NOW SHOWING'}
                    </span>
                    <button
                      className={`heart-btn ${isLiked ? 'liked' : ''}`}
                      onClick={e => onToggleLike(e, event.event_id)}
                      aria-label="Save to favorites"
                    >
                      <Heart size={16} fill={isLiked ? '#ff3366' : 'none'} />
                    </button>
                  </div>

                  <div className="card-content">
                    <div className="card-top">
                      <div className="date-block">
                        <strong>{dayStr}</strong>
                        <span>{monthStr}</span>
                      </div>

                      <div className="card-info">
                        <span className="category-label">
                          {event.event_type === 'MOVIE' ? (event.genre || 'Movie') : (event.concert_genre || 'Live Music')}
                        </span>
                        <h3 className="line-clamp-1">{event.title}</h3>
                        <p>
                          <MapPin size={12} className="text-primary flex-shrink-0" />
                          <span className="truncate">{event.venue || event.city}</span>
                        </p>
                      </div>
                    </div>

                    {event.formats && event.formats.length > 0 && (
                      <div className="flex gap-1.5 flex-wrap mb-3">
                        {event.formats.slice(0, 3).map((f: any) => (
                          <span key={f.format_name} className="slot-badge">{f.format_name}</span>
                        ))}
                      </div>
                    )}

                    <div className="card-footer">
                      <div className="price">
                        <small>{isUpcoming ? 'Advance tickets' : 'Tickets from'}</small>
                        <strong>₹{event.base_price}</strong>
                      </div>
                      <button className={`book-btn ${isUpcoming ? 'book-btn-upcoming' : ''}`} onClick={() => onSelectEvent(event)}>
                        {isUpcoming ? 'Pre-Book' : 'Book Now'}
                      </button>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </section>

      {/* Trust */}
      <section className="trust">
        <div>
          <ShieldCheck size={26} />
          <span>
            <strong>100% Guaranteed Official Tickets</strong>
            <small>Direct integration with certified cinema & venue screens.</small>
          </span>
        </div>
        <div>
          <Zap size={26} />
          <span>
            <strong>Instant Mobile QR Delivery</strong>
            <small>Your digital passes are ready immediately with zero wait.</small>
          </span>
        </div>
        <div>
          <RotateCcw size={26} />
          <span>
            <strong>Hassle-Free 1-Click Cancellation</strong>
            <small>Plans changed? Cancel anytime before showtime for full refund.</small>
          </span>
        </div>
      </section>
    </>
  )
}
