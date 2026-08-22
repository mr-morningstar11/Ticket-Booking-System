'use client'

import { Search, ArrowRight, X } from 'lucide-react'

interface HeroSectionProps {
  query: string
  onQueryChange: (q: string) => void
  onExplore: () => void
  onFeaturedClick: () => void
}

export function HeroSection({
  query,
  onQueryChange,
  onExplore,
  onFeaturedClick,
}: HeroSectionProps) {
  return (
    <section className="hero-shell">
      <div className="hero-copy">
        <div className="eyebrow">
          <span className="pulse" /> Live in Delhi NCR & Across India
        </div>
        <h1>Make tonight<br /><em>unforgettable.</em></h1>
        <p>
          Book verified tickets for blockbuster movies, stadium concerts, and music festivals with real-time seat locks and instant e-tickets.
        </p>

        <div className="searchbar">
          <Search size={19} />
          <input
            aria-label="Search events"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            placeholder="Search movies, artists, venues, IMAX 3D, cities..."
          />
          {query && (
            <button onClick={() => onQueryChange('')} className="text-muted-foreground hover:text-foreground mr-1" title="Clear search">
              <X size={16} />
            </button>
          )}
          <button onClick={onExplore}>
            Explore <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="hero-art" onClick={onFeaturedClick}>
        <div className="hero-image" />
        <div className="hero-stamp">
          <span>BLOCKBUSTER</span>
          <strong>IMAX 3D</strong>
          <small>BOOK NOW</small>
        </div>
        <div className="hero-note">
          Spider-Man: Brand New Day · Click to Book <ArrowRight size={14} />
        </div>
      </div>
    </section>
  )
}
