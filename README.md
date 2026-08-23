# 🎟️Ticket Booking System

A full-stack, real-time ticket booking web application built with **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS**, and **SQLite**. Designed with premium aesthetics, rich animations, and an interactive seating engine supporting both **Cinema Theaters** and **Concentric Stadium Concert Arenas**.

---

## ✨ Features

### 🎬 Interactive Seating Engines
- **Cinema Theater Seating:**
  - Curved screen visualizer with ambient glow.
  - Multi-tier seat categories (**Executive Standard**, **Premium Prime**, **VIP Club**, **VVIP Recliners**) with custom dynamic pricing multipliers.
  - Realistic theater chair layout with Left, Center, and Right aisle split blocks.
- **Concert & Stadium Arena Seating:**
  - Dynamic 2D concentric annular sector map (SVG-driven).
  - Stand zones: **Floor Standing (GA)**, **South Premium (VVIP)**, **Lower Stands (A&H, B&G, C&F)**.
  - Real-time seat availability, live price calculation, and interactive sightline ratings.

### ⏱️ Real-Time Seat Locking & Hold Timer
- 10-minute temporary seat hold countdown timer upon selection to prevent double-booking.
- Real-time seat status tracking (`AVAILABLE`, `HOLD`, `BOOKED`).

### 💳 Seamless Checkout & Voucher System
- Multi-payment simulator supporting **UPI**, **Credit/Debit Card**, and **Net Banking**.
- Promo codes & discount engine (e.g. `SAVE10`, `FLAT50`).
- Transparent fee breakdown with Seat Subtotal, Convenience Fee, and GST tax calculation.

### 🎫 Digital QR Code Event Pass
- Boarding-pass style ticket generator.
- Dynamic **QR Code generation** for instant gate check-in.
- Ticket details including show date, time, venue address, screen type, and assigned seats.

### 💼 Bookings Wallet & Ticket Management
- View active and past ticket reservations.
- Instant ticket cancellation with automated seat release and refund simulation.

### 📊 Admin Analytics Dashboard
- Comprehensive metrics: Total Revenue, Tickets Sold, Active Occupancy, and Total Events.
- Recent booking transactions log with customer details and payment methods.

### 👤 Multi-User Simulation
- Quick-switcher modal to simulate actions across different users and administrative accounts.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 16 (App Router)](https://nextjs.org/)
- **Frontend Library:** [React 19](https://react.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/) & Custom CSS animations
- **Database:** [SQLite](https://sqlite.org/) via Node.js native `node:sqlite`
- **Icons & UI Utilities:** [Lucide React](https://lucide.dev/), `clsx`, `tailwind-merge`
- **Visuals & Animations:** [Framer Motion](https://www.framer.com/motion/), [OGL](https://github.com/oframe/ogl) (WebGL Orb Shaders), `qrcode`

---

## 📂 Project Structure

```text
ticket-booking-system/
├── app/
│   ├── api/                      # Next.js App Router API endpoints
│   │   ├── bookings/             # Booking creation & user reservations
│   │   ├── events/               # Event listings & detailed showtimes
│   │   ├── shows/[id]/seats/     # Real-time seat statuses & prices
│   │   ├── stats/                # Admin analytics & revenue metrics
│   │   ├── users/                # User accounts & roles
│   │   └── waitlist/             # Waitlist handling
│   ├── globals.css               # Design system tokens & animations
│   ├── layout.tsx                # Root HTML shell & metadata
│   └── page.tsx                  # Main single-page application orchestrator
├── components/
│   ├── AdminDashboard.tsx        # Revenue & bookings management panel
│   ├── BookingsWallet.tsx        # Customer ticket wallet & cancellation flow
│   ├── CheckoutFlow.tsx          # Payment & voucher checkout modal
│   ├── EventDetailsModal.tsx     # Showtimes, venues & format picker
│   ├── EventsList.tsx            # Event catalog with search, filter & tags
│   ├── Header.tsx                # Navigation bar & user switcher trigger
│   ├── HeroSection.tsx           # Featured promotions & trending carousel
│   ├── Orb.tsx                   # WebGL ambient background visualizer
│   ├── QRCodePass.tsx            # Digital boarding pass & QR code pass
│   ├── ReelGallery.tsx           # Highlight reel showcase
│   ├── SeatPickerFlow.tsx        # Cinema & Stadium seat selection engine
│   └── UserSwitcherModal.tsx     # Profile simulation modal
├── lib/
│   ├── db.ts                     # SQLite database connection & helpers
│   └── utils.ts                  # ClassName merging utilities
├── ticket_booking.db             # SQLite database file
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (version 20.x or 22.x+ recommended for native `node:sqlite`)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ticket-booking-system
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Database & Seeding

The application uses an embedded SQLite database (`ticket_booking.db`). Database tables and seed data include:
- `users`: User profiles with customer and admin roles.
- `venues` & `screens`: Venues, multiplexes, and auditoriums with seating capacities.
- `events`: Movies, concerts, comedy specials, and sports events.
- `shows`: Scheduled showtimes with base ticket pricing.
- `seats` & `show_seats`: Seat layouts with row labels, categories, multipliers, and real-time locking statuses.
- `bookings` & `booking_seats`: Completed orders, transaction amounts, and QR passes.

---

## 🎟️ Promo Codes

You can test discount vouchers during checkout:
- `SAVE10`: **10% OFF** your total seat subtotal.
- `FLAT50`: **₹50 FLAT OFF** on your booking.

---

## 📝 License

This project is licensed under the MIT License.
