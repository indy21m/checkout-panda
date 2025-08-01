# Checkout Panda 🐼

Elite checkout platform that transforms payment transactions into visually stunning, highly profitable customer journeys.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.3+
- **Authentication:** Clerk
- **Database:** Neon Serverless Postgres
- **ORM:** Drizzle ORM
- **API:** tRPC
- **Styling:** Tailwind CSS + CVA
- **UI Components:** Radix UI + Custom Components
- **Animations:** Framer Motion
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- Clerk account
- Neon database
- Vercel account

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

### Installation

```bash
# Install dependencies
pnpm install

# Run database migrations
pnpm drizzle-kit generate:pg
# Apply migrations in Neon console

# Start development server
pnpm dev
```

## Project Structure

```
├── app/              # Next.js App Router
├── components/       # React components
│   └── ui/          # Base UI components
├── server/          # Backend code
│   ├── api/         # tRPC routers
│   └── db/          # Database schema
├── lib/             # Utilities
└── public/          # Static assets
```

## Key Features

- 🎨 **Drag-and-Drop Builder** - Visual checkout page builder
- 💰 **One-Click Upsells** - Post-purchase upsell flows
- 🎁 **Order Bumps** - Pre-purchase add-ons
- 📊 **Analytics Dashboard** - Real-time conversion tracking
- 🔄 **A/B Testing** - Built-in split testing
- 🎯 **Funnel Builder** - Visual flow editor

## Development

```bash
# Development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Format code
pnpm format

# Build for production
pnpm build
```

## Deployment

The project auto-deploys to Vercel on push to the main branch.

## License

MIT

---

Built with ❤️ by the Checkout Panda Team
