'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Info, AlertCircle, Ticket, X } from 'lucide-react'
import { Header } from '@/components/Header'
import { HeroSection } from '@/components/HeroSection'
import { EventsList } from '@/components/EventsList'
import { EventDetailsModal } from '@/components/EventDetailsModal'
import { SeatPickerFlow } from '@/components/SeatPickerFlow'
import { CheckoutFlow } from '@/components/CheckoutFlow'
import { SuccessFlow } from '@/components/SuccessFlow'
import { BookingsWallet } from '@/components/BookingsWallet'
import { AdminDashboard } from '@/components/AdminDashboard'
import { UserSwitcherModal } from '@/components/UserSwitcherModal'

export default function Page() {
  // Global Data State
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [currentUser, setCurrentUser] = useState<any>({
    user_id: 2,
    name: 'Sanskar Pandey',
    email: 'sanskar@example.com',
    phone: '9876543210',
    role: 'CUSTOMER',
  })

  // Navigation & Filtering
  const [stage, setStage] = useState<'browse' | 'details' | 'seats' | 'checkout' | 'success' | 'bookings' | 'admin'>('browse')
  const [category, setCategory] = useState('All events')
  const [query, setQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('All Cities')
  const [selectedFormat, setSelectedFormat] = useState('All Formats')
  const [sortBy, setSortBy] = useState<'date' | 'price_asc' | 'price_desc' | 'rating'>('date')
  const [likedEvents, setLikedEvents] = useState<number[]>([2, 6])
  const [isUserModalOpen, setIsUserModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Event & Showtime Selection State
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null)
  const [eventDetails, setEventDetails] = useState<any | null>(null)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedShow, setSelectedShow] = useState<any | null>(null)
  const [showSeats, setShowSeats] = useState<any[]>([])
  const [selectedSeats, setSelectedSeats] = useState<any[]>([])
  const [holdSeconds, setHoldSeconds] = useState(600)

  // Checkout State
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NET_BANKING' | 'TEST'>('UPI')
  const [upiId, setUpiId] = useState('sanskar@okaxis')
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892')
  const [cardExpiry, setCardExpiry] = useState('12/28')
  const [cardCvc, setCardCvc] = useState('482')
  const [promoInput, setPromoInput] = useState('')
  const [discountAmount, setDiscountAmount] = useState(0)
  const [isProcessingPay, setIsProcessingPay] = useState(false)
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null)

  // Bookings Wallet & Admin State
  const [userBookings, setUserBookings] = useState<any[]>([])
  const [adminStats, setAdminStats] = useState<any | null>(null)

  // Toast Notifications
  const [toasts, setToasts] = useState<{ id: number; text: string; type: 'success' | 'info' | 'warning' }[]>([])

  const addToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, text, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }

  // Initial Data Fetch
  useEffect(() => {
    fetchEvents()
    fetchUsers()
  }, [])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/events', { cache: 'no-store' })
      const data = await res.json()
      if (data.success) {
        setEvents(data.data)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users')
      const data = await res.json()
      if (data.success) {
        setUsers(data.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchUserBookings = async (userId = currentUser.user_id) => {
    try {
      const param = currentUser.role === 'ADMIN' ? '' : `?user_id=${userId}`
      const res = await fetch(`/api/bookings${param}`)
      const data = await res.json()
      if (data.success) {
        setUserBookings(data.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const fetchAdminStats = async () => {
    try {
      const res = await fetch('/api/stats')
      const data = await res.json()
      if (data.success) {
        setAdminStats(data.data)
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Hold Timer countdown
  useEffect(() => {
    if (stage === 'seats' || stage === 'checkout') {
      const timer = setInterval(() => {
        setHoldSeconds(prev => (prev > 0 ? prev - 1 : 0))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [stage])

  // Select Event
  const handleSelectEvent = async (event: any) => {
    setSelectedEvent(event)
    setSelectedSeats([])
    setDiscountAmount(0)
    setPromoInput('')
    try {
      const res = await fetch(`/api/events/${event.event_id}`)
      const data = await res.json()
      if (data.success) {
        setEventDetails(data.data)
        if (data.data.shows && data.data.shows.length > 0) {
          const firstDate = data.data.shows[0].show_date
          setSelectedDate(firstDate)
          setSelectedShow(data.data.shows[0])
        } else {
          setSelectedDate('')
          setSelectedShow(null)
        }
      }
    } catch (e) {
      console.error(e)
    }
    setStage('details')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Select Showtime & Fetch Live Seats
  const handleSelectShow = async (show: any) => {
    setSelectedShow(show)
    setSelectedSeats([])
    try {
      const res = await fetch(`/api/shows/${show.show_id}/seats`)
      const data = await res.json()
      if (data.success) {
        setShowSeats(data.data.seats)
        setHoldSeconds(600)
        setStage('seats')
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Toggle Favorite
  const toggleLike = (e: React.MouseEvent, eventId: number) => {
    e.stopPropagation()
    if (likedEvents.includes(eventId)) {
      setLikedEvents(likedEvents.filter(id => id !== eventId))
      addToast('Removed from favorites', 'info')
    } else {
      setLikedEvents([...likedEvents, eventId])
      addToast('Saved to your favorites!', 'success')
    }
  }

  // Toggle Seat Selection
  const toggleSeat = (seatObj: any) => {
    if (seatObj.status !== 'AVAILABLE') return

    const exists = selectedSeats.find(s => s.seat_id === seatObj.seat_id)
    if (exists) {
      setSelectedSeats(selectedSeats.filter(s => s.seat_id !== seatObj.seat_id))
    } else {
      setSelectedSeats([...selectedSeats, seatObj])
    }
  }

  // Apply Promo Code
  const applyPromo = () => {
    const code = promoInput.trim().toUpperCase()
    if (code === 'EARLYBIRD' || code === 'SAVE10') {
      const discount = Math.round(seatSubtotal * 0.1)
      setDiscountAmount(discount)
      addToast(`Promo applied: 10% OFF (-₹${discount})`, 'success')
    } else if (code === 'WELCOME50' || code === 'FIRST50') {
      setDiscountAmount(50)
      addToast('Promo applied: ₹50 OFF', 'success')
    } else {
      addToast('Invalid promo code. Try EARLYBIRD or WELCOME50', 'warning')
    }
  }

  // Price calculations
  const seatSubtotal = useMemo(() => {
    return selectedSeats.reduce((sum, s) => sum + (s.calculated_price || selectedShow?.ticket_price || 0), 0)
  }, [selectedSeats, selectedShow])

  const convenienceFee = selectedSeats.length > 0 ? 45 : 0
  const gstTax = Math.round(seatSubtotal * 0.18 * 100) / 100
  const grandTotal = Math.max(0, seatSubtotal + convenienceFee + gstTax - discountAmount)

  // Checkout Pay
  const handlePay = async () => {
    if (selectedSeats.length === 0) {
      addToast('Please select at least one seat', 'warning')
      return
    }
    setIsProcessingPay(true)
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          show_id: selectedShow.show_id,
          seat_ids: selectedSeats.map(s => s.seat_id),
          payment_method: paymentMethod,
          convenience_fee: convenienceFee,
          discount: discountAmount,
          customer_name: currentUser.name,
          customer_email: currentUser.email,
          customer_phone: currentUser.phone,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setConfirmedBooking({
          ...data.data,
          event_title: selectedEvent.title,
          venue_name: selectedShow.venue_name,
          show_date: selectedShow.show_date,
          start_time: selectedShow.start_time,
          format_name: selectedShow.format_name,
          language: selectedShow.language,
        })
        setStage('success')
        addToast('🎉 Booking Confirmed! E-ticket generated.', 'success')
      } else {
        addToast(data.error || 'Payment failed. Please try again.', 'warning')
      }
    } catch (e) {
      console.error(e)
      addToast('Error processing booking', 'warning')
    } finally {
      setIsProcessingPay(false)
    }
  }

  // Cancel Booking
  const handleCancelBooking = async (bookingId: number) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        addToast('Booking cancelled. Seats released & refund initiated.', 'info')
        fetchUserBookings()
      } else {
        addToast(data.error || 'Could not cancel booking', 'warning')
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Join Waitlist
  const handleJoinWaitlist = async (eventId: number, showId?: number) => {
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser.user_id,
          event_id: eventId,
          show_id: showId,
          seat_category: 'PREMIUM',
        }),
      })
      const data = await res.json()
      if (data.success) {
        addToast(`You are #${data.data.position} on the waitlist! We will notify you if tickets open.`, 'success')
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Database Reset
  const handleResetDatabase = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' })
      const data = await res.json()
      if (data.success) {
        addToast('Database reseeded from database.sql successfully!', 'success')
        fetchEvents()
        fetchUserBookings()
        fetchAdminStats()
      }
    } catch (e) {
      console.error(e)
    }
  }

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (category === 'Movies' && e.event_type !== 'MOVIE') return false
      if (category === 'Concerts' && e.event_type !== 'CONCERT') return false
      if (category === 'Favorites' && !likedEvents.includes(e.event_id)) return false
      if (category === 'Delhi NCR' && e.region !== 'Delhi NCR') return false
      if (category === 'Bengaluru' && e.city !== 'Bengaluru') return false
      if (category === 'Mumbai' && e.city !== 'Mumbai') return false

      if (selectedCity !== 'All Cities') {
        if (selectedCity === 'Delhi NCR' && e.region !== 'Delhi NCR') return false
        if (selectedCity !== 'Delhi NCR' && e.city !== selectedCity) return false
      }

      if (selectedFormat !== 'All Formats') {
        const hasFormat = e.formats?.some((f: any) => f.format_name === selectedFormat)
        if (!hasFormat) return false
      }

      if (query.trim()) {
        const q = query.toLowerCase()
        const matchTitle = e.title?.toLowerCase().includes(q)
        const matchVenue = e.venue?.toLowerCase().includes(q)
        const matchCity = e.city?.toLowerCase().includes(q)
        const matchDirector = e.director?.toLowerCase().includes(q)
        const matchArtist = e.artist?.toLowerCase().includes(q)
        const matchGenre = (e.genre || e.concert_genre)?.toLowerCase().includes(q)
        if (!matchTitle && !matchVenue && !matchCity && !matchDirector && !matchArtist && !matchGenre) {
          return false
        }
      }

      return true
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return (a.base_price || 0) - (b.base_price || 0)
      if (sortBy === 'price_desc') return (b.base_price || 0) - (a.base_price || 0)
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0)
      return new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    })
  }, [events, category, selectedCity, selectedFormat, query, sortBy, likedEvents])

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Toast Layer */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            {t.type === 'success' && <CheckCircle2 size={17} className="text-emerald-400" />}
            {t.type === 'info' && <Info size={17} className="text-primary" />}
            {t.type === 'warning' && <AlertCircle size={17} className="text-amber-400" />}
            <span>{t.text}</span>
          </div>
        ))}
      </div>

      {/* Header */}
      <Header
        stage={stage}
        category={category}
        currentUser={currentUser}
        onNavigate={(newStage, newCategory) => {
          if (newCategory) setCategory(newCategory)
          if (newStage === 'bookings') fetchUserBookings()
          if (newStage === 'admin') fetchAdminStats()
          setStage(newStage)
          window.scrollTo({ top: 0, behavior: 'smooth' })
        }}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      />

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="modal-overlay" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ maxWidth: '320px' }}>
            <div className="flex justify-between items-center mb-6">
              <div className="logo"><span className="logo-mark"><Ticket size={16} /></span>ticket<span>hub</span></div>
              <button className="modal-close" onClick={() => setIsMobileMenuOpen(false)}><X size={16} /></button>
            </div>
            <div className="grid gap-3">
              <button className="outline-btn text-left justify-start" onClick={() => { setStage('browse'); setCategory('All events'); setIsMobileMenuOpen(false) }}>Discover Events</button>
              <button className="outline-btn text-left justify-start" onClick={() => { setStage('browse'); setCategory('Movies'); setIsMobileMenuOpen(false) }}>Movies</button>
              <button className="outline-btn text-left justify-start" onClick={() => { setStage('browse'); setCategory('Concerts'); setIsMobileMenuOpen(false) }}>Concerts</button>
              <button className="outline-btn text-left justify-start" onClick={() => { fetchUserBookings(); setStage('bookings'); setIsMobileMenuOpen(false) }}>My Bookings</button>
              <button className="outline-btn text-left justify-start" onClick={() => { setIsUserModalOpen(true); setIsMobileMenuOpen(false) }}>Switch Profile ({currentUser.name})</button>
            </div>
          </div>
        </div>
      )}

      {/* STAGE: BROWSE */}
      {stage === 'browse' && (
        <>
          <HeroSection
            query={query}
            onQueryChange={setQuery}
            onExplore={() => document.getElementById('events')?.scrollIntoView({ behavior: 'smooth' })}
            onFeaturedClick={() => {
              const spider = events.find(e => e.title?.includes('Spider-Man')) || events[0]
              if (spider) handleSelectEvent(spider)
            }}
          />

          <EventsList
            events={events}
            filteredEvents={filteredEvents}
            loading={loading}
            category={category}
            selectedCity={selectedCity}
            selectedFormat={selectedFormat}
            sortBy={sortBy}
            likedEvents={likedEvents}
            onSelectCategory={setCategory}
            onSelectCity={c => { setSelectedCity(c); addToast(`Showing events in ${c}`, 'info') }}
            onSelectFormat={setSelectedFormat}
            onSelectSort={setSortBy}
            onResetFilters={() => {
              setCategory('All events')
              setSelectedCity('All Cities')
              setSelectedFormat('All Formats')
              setQuery('')
              addToast('Filters reset', 'info')
            }}
            onToggleLike={toggleLike}
            onSelectEvent={handleSelectEvent}
          />
        </>
      )}

      {/* STAGE: DETAILS */}
      {stage === 'details' && selectedEvent && eventDetails && (
        <EventDetailsModal
          selectedEvent={selectedEvent}
          eventDetails={eventDetails}
          selectedDate={selectedDate}
          selectedShow={selectedShow}
          likedEvents={likedEvents}
          onBack={() => setStage('browse')}
          onToggleLike={toggleLike}
          onSelectDate={setSelectedDate}
          onSelectShow={handleSelectShow}
          onJoinWaitlist={handleJoinWaitlist}
        />
      )}

      {/* STAGE: SEATS */}
      {stage === 'seats' && selectedShow && (
        <SeatPickerFlow
          selectedEvent={selectedEvent}
          selectedShow={selectedShow}
          showSeats={showSeats}
          selectedSeats={selectedSeats}
          holdSeconds={holdSeconds}
          seatSubtotal={seatSubtotal}
          onBack={() => setStage('details')}
          onToggleSeat={toggleSeat}
          onContinue={() => {
            setStage('checkout')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
        />
      )}

      {/* STAGE: CHECKOUT */}
      {stage === 'checkout' && selectedShow && (
        <CheckoutFlow
          selectedEvent={selectedEvent}
          selectedShow={selectedShow}
          selectedSeats={selectedSeats}
          currentUser={currentUser}
          paymentMethod={paymentMethod}
          upiId={upiId}
          cardNumber={cardNumber}
          cardExpiry={cardExpiry}
          cardCvc={cardCvc}
          promoInput={promoInput}
          discountAmount={discountAmount}
          isProcessingPay={isProcessingPay}
          seatSubtotal={seatSubtotal}
          convenienceFee={convenienceFee}
          gstTax={gstTax}
          grandTotal={grandTotal}
          onBack={() => setStage('seats')}
          onUpdateUser={setCurrentUser}
          onSetPaymentMethod={setPaymentMethod}
          onSetUpiId={setUpiId}
          onSetCardNumber={setCardNumber}
          onSetCardExpiry={setCardExpiry}
          onSetCardCvc={setCardCvc}
          onSetPromoInput={setPromoInput}
          onApplyPromo={applyPromo}
          onPay={handlePay}
        />
      )}

      {/* STAGE: SUCCESS */}
      {stage === 'success' && confirmedBooking && (
        <SuccessFlow
          confirmedBooking={confirmedBooking}
          onViewBookings={() => { fetchUserBookings(); setStage('bookings'); }}
          onBookAnother={() => { setStage('browse'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        />
      )}

      {/* STAGE: BOOKINGS WALLET */}
      {stage === 'bookings' && (
        <BookingsWallet
          userBookings={userBookings}
          currentUser={currentUser}
          onBack={() => setStage('browse')}
          onCancelBooking={handleCancelBooking}
          onEmailTicket={email => addToast(`Ticket confirmation sent to ${email}`, 'success')}
          onCopyRef={ref => {
            navigator.clipboard.writeText(ref)
            addToast('Booking reference copied to clipboard', 'info')
          }}
        />
      )}

      {/* STAGE: ADMIN DASHBOARD */}
      {stage === 'admin' && (
        <AdminDashboard
          adminStats={adminStats}
          onBack={() => setStage('browse')}
          onResetDatabase={handleResetDatabase}
        />
      )}

      {/* USER SWITCHER MODAL */}
      <UserSwitcherModal
        isOpen={isUserModalOpen}
        users={users}
        currentUser={currentUser}
        onSelectUser={u => {
          setCurrentUser(u)
          setIsUserModalOpen(false)
          addToast(`Switched user to ${u.name} (${u.role})`, 'info')
        }}
        onClose={() => setIsUserModalOpen(false)}
      />

      {/* Footer */}
      <footer>
        <div className="logo" onClick={() => { setStage('browse'); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <span className="logo-mark"><Ticket size={18} /></span>
          ticket<span>hub</span>
        </div>
        <span>© 2026 Ticket Hub. All rights reserved.</span>
        <span>Connected to SQLite database: ticket_booking.db</span>
      </footer>
    </main>
  )
}
