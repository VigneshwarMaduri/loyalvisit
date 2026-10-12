# LoyalVisit — B2B Digital Loyalty & Retention Platform

LoyalVisit transforms walk-in customers into high-frequency regulars through instant mobile web passes, gamified rewards (Mystery Vault), and a lightning-fast merchant camera scanner.

## Key Features

- **Mobile-First Experience**: High-converting, frictionless UI designed strictly for mobile viewports.
- **Instant Customer Web Pass (`/customer/pass`)**: Zero app store installation needed. Customers access their loyalty card and scannable QR token via browser.
- **Fast Merchant Scanner (`/merchant/scanner`)**: High-speed camera scanner powered by `html5-qrcode` with single-tap stamp awarding (`+1`, `+2`, `+3`).
- **Real-Time Supabase Sync**: PostgreSQL database with Row Level Security (RLS) and real-time subscription channels.
- **Table Standees (`/merchant/settings`)**: Instant high-resolution QR standees for customer onboarding (`/join/[businessId]`).

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS, Lucide React
- **Backend & Auth**: Supabase (PostgreSQL, Realtime, Auth)
- **Scanning & Codes**: `html5-qrcode`, `qrcode.react`

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.
