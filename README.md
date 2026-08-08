# 🎟️ EventX — Delightful Events Start Here

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Convex](https://img.shields.io/badge/Convex-Backend-purple?style=flat-square)](https://www.convex.dev/)
[![Clerk](https://img.shields.io/badge/Clerk-Auth-blue?style=flat-square)](https://clerk.dev/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=flat-square&logo=react)](https://react.dev/)

EventX is a production-ready SaaS event management and ticketing platform. It empowers organizers to create, manage, promote, and monetize events, while providing attendees with a delightful experience to discover events, register, and receive digital tickets with QR codes for fast, real-time venue check-in. Smart autofill capabilities draft titles, descriptions, categories, and capacity recommendations.

---

## 📖 Table of Contents

1. [Features](#-features)
2. [Tech Stack](#-tech-stack)
3. [Folder Structure](#-folder-structure)
4. [Database Design](#-database-design)
5. [Installation Guide](#-installation-guide)
6. [Environment Variables](#-environment-variables)
7. [Deployment](#-deployment)

---

## ⚡ Features

### 🔒 Authentication & Security
- Unified sign-in and sign-up modals powered by **Clerk**
- Secure JWT session token exchanges with Convex for server-side authorization
- Automated database profile creation on first sign-in

### 📅 Event Management (Free vs. Pro)
- **Free**: Create 1 active event, register attendees, export CSV, instant QR tickets
- **Pro**: Unlimited events, full color presets, Smart Event Assistant, advanced organizer dashboards

### ⚡ Smart Event Creation
- **Smart Event Assistant**: Drafts titles, descriptions, categories, and suggested capacities from minimal prompts

### 🎟️ Ticketing & Fast Check-In
- Real-time QR Code ticket generation
- **In-Browser QR Scanner**: Scan tickets at the door via mobile or webcam
- **Manual Check-In Fallback**: Check in attendees via ticket ID or one-click dashboard

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16.2 (App Router, React 19) |
| **Styling** | Tailwind CSS 4.0 |
| **Database** | Convex (serverless, reactive) |
| **Auth** | Clerk |
| **AI Engine** | Google Gemini / Groq |
| **QR** | `react-qr-code` & `html5-qrcode` |

---

## 📂 Folder Structure

```
eventx/
├── app/                      # Next.js App Router root
│   ├── (auth)/               # Clerk Authentication Layouts
│   ├── (main)/               # Core Application pages (protected)
│   │   ├── create-event/     # Event Creator Page & AI Components
│   │   ├── my-events/        # Organizers Dashboard & QR Scanner
│   │   └── my-tickets/       # User Digital Tickets wallet
│   ├── (public)/             # Public pages (landing, explore, event details)
│   │   ├── explore/          # Geolocation Search & Category filters
│   │   └── events/           # Dynamic slug pages for registration
│   ├── layout.js             # Global Layout with Providers
│   └── page.jsx              # Landing / Home page
├── components/               # Shareable UI components
│   ├── ui/                   # Shadcn UI low-level components
│   ├── Header.jsx            # Dynamic navigation bar
│   ├── EventCard.jsx         # Uniform Event display component
│   └── onboarding-modal.jsx  # Interactive onboarding modal
├── convex/                   # Convex Backend & endpoints
│   ├── schema.js             # Database Table Schemas & Indexes
│   ├── users.js              # User mutations & queries
│   ├── events.js             # Event creation, deletion, organizer queries
│   ├── registrations.js      # Ticketing & Check-in logic
│   ├── explore.js            # Geolocation queries & featured listings
│   └── dashboard.js          # Organizer statistics calculations
├── hooks/                    # Reusable custom React hooks
└── lib/                      # Helper libraries and static assets
```

---

## 🗄️ Database Design

### `users` Table
- `name`, `email`, `tokenIdentifier`, `hasCompletedOnboarding`
- `location`: `city`, `state`, `country`
- `interests` (array), `freeEventCreated`

### `events` Table
- `title`, `description`, `slug`, `category`, `tags`
- `startDate`, `endDate`, `timezone`, `locationType`
- `venue`, `city`, `state`, `country`, `capacity`
- `ticketType`, `ticketPrice`, `registrationCount`
- `coverImage`, `themeColor`

### `registrations` Table
- `eventId`, `userId`, `attendeeName`, `attendeeEmail`
- `qrCode`, `checkedIn`, `checkedInAt`, `status`

---

## 🚀 Installation Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create `.env.local` with the variables listed below.

### 3. Initialize Convex Backend
```bash
npx convex dev
```

### 4. Start the Development Server
```bash
npm run dev
```

Open **`http://localhost:3000`**.

---

## 🔑 Environment Variables

```ini
# Convex
CONVEX_DEPLOYMENT=your_convex_deployment_id
NEXT_PUBLIC_CONVEX_URL=https://your_project.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://your_project.convex.site

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
CLERK_JWT_ISSUER_DOMAIN=https://your_clerk_domain.accounts.dev

# External APIs
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key
GROQ_API_KEY=your_groq_api_key
```

---

## 🌐 Deployment

1. Push code to GitHub
2. Link repository to [Vercel](https://vercel.com)
3. Add all environment variables in **Project Settings → Environment Variables**
4. Build command: `next build`
5. Connect Convex production deployment via the Convex Dashboard
