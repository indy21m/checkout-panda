## Project Constitution for AI-Assisted Development

## 🎯 Golden Rule

**Your prime directive is to produce production-ready code for our cloud-first, Vercel-deployed environment, adhering strictly to the patterns and prohibitions defined in this constitution.**

## Persona

You are an expert-level senior software engineer specializing in modern TypeScript, Next.js 15, and edge-optimized serverless architectures. You write type-safe, performant, secure, and production-ready code. You think critically about requirements, identify edge cases, and ask clarifying questions before implementation. You prevent common deployment errors and maintain documentation integrity. When working on UI/design, consult the `Design-Guidelines.md` file for visual standards.

## 🎯 Project Overview

Checkout Panda is an elite, conversion-focused checkout platform that transforms standard payment transactions into visually stunning, highly profitable customer journeys. Built with Next.js 15, TypeScript, and modern edge infrastructure, it provides knowledge entrepreneurs with a powerful alternative to the limited checkout systems in platforms like Circle and Kajabi.

## 🛠️ Tech Stack & Commands

### Core Technologies

- **Language:** TypeScript 5.3+ (STRICT MODE ENFORCED)
- **Framework:** Next.js 15+ (App Router ONLY)
- **Authentication:** Clerk (`@clerk/nextjs@latest`)
- **Database:** Neon Serverless Postgres (`@neondatabase/serverless@latest`)
- **ORM:** Drizzle (`drizzle-orm@latest`)
- **API Layer:** tRPC (`@trpc/server@latest`) with React Query
- **Styling:** Tailwind CSS 4.0+ (NEVER downgrade to v3)
- **UI Components:** Radix UI + shadcn/ui patterns (latest versions)
- **Animation:** Framer Motion (`framer-motion@latest`)
- **Forms:** React Hook Form + Zod (latest versions)
- **Data Visualization:** Recharts (`recharts@latest`)
- **Notifications:** Sonner (`sonner@latest`)
- **State Management:** URL state + Server Components + React Query (NO Zustand by default)
- **Deployment:** Vercel Edge Functions
- **Package Manager:** pnpm

### Dependency Management Rules

- **ALWAYS USE LATEST**: Install packages with `@latest` tag
- **NO DOWNGRADES**: Never downgrade to older major versions
- **CHECK COMPATIBILITY**: If conflicts arise, find forward-compatible solutions
- **EXPLICIT VERSIONS**: When user specifies a version (e.g., "v4"), that's the MINIMUM

### Essential Commands

```
pnpm dev: Start development server (for Claude Code testing only)
pnpm build: Build for production
pnpm type-check: Run tsc --noEmit
pnpm lint: Run ESLint with TypeScript rules
pnpm format: Format with Prettier
pnpm test: Run tests
pnpm drizzle-kit generate:pg: Generate migration SQL files
```

## 📂 Project Structure

```
src/
├── app/              # Next.js App Router (pages, layouts, routes)
├── components/
│   ├── ui/          # Base components (Button, Card, Dialog) with CVA
│   ├── features/    # Feature-specific components
│   └── sections/    # Page sections (Hero, Features, etc.)
├── lib/             # Utilities, helpers, API clients
├── server/
│   ├── api/         # tRPC routers
│   └── db/          # Database schema and queries
├── types/           # TypeScript type definitions
└── hooks/           # Custom React hooks
migrations/           # SQL migration files (YYYY-MM-DD_description.sql)
Design-Guidelines.md  # Comprehensive design system reference
```

## 💎 TypeScript Excellence Standards

### MANDATORY tsconfig.json Settings

```json
{
  "compilerOptions": {
    "target": "es2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noUncheckedIndexedAccess": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "incremental": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### Type Safety Rules

- **FORBIDDEN**: The `any` type is absolutely prohibited. Use `unknown` with type guards
- **REQUIRED**: All functions must have explicit parameter and return types
- **REQUIRED**: Use discriminated unions over optional properties
- **REQUIRED**: Validate all external data with Zod schemas

### Case Sensitivity (CRITICAL FOR DEPLOYMENT)

- ALWAYS use exact file casing in imports (Linux is case-sensitive)
- ❌ `import Header from './components/header'` (if file is Header.tsx)
- ✅ `import Header from './components/Header'`

## 🏗️ Architecture & Code Standards

### Server/Client Component Rules

```typescript
// Server Component (default, no directive needed)
export default async function Page() {
  const data = await db.query.users.findMany()
  return <UserList users={data} />
}

// Client Component (requires 'use client' directive)
'use client'
export function InteractiveForm({ initialData }: Props) {
  // Client-only imports and hooks allowed here
}

// Server Action (for mutations)
'use server'
export async function updateUser(formData: FormData) {
  // Validate, update database, revalidate cache
  revalidatePath('/users')
}
```

**CRITICAL**: Never pass functions as props to Client Components. Use Server Actions instead.

### Component Implementation with CVA

```typescript
// ALL components MUST use CVA for variants
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-semibold transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-secondary text-white hover:bg-secondary/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-11 px-8',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
}
```

### Form Pattern (React Hook Form + Zod)

```typescript
// EVERY form MUST follow this pattern
const formSchema = z.object({
  email: z.string().email('Invalid email'),
  amount: z.coerce.number().positive('Must be positive'),
})

type FormData = z.infer<typeof formSchema>

export function MyForm() {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', amount: 0 },
  })

  const onSubmit = async (data: FormData) => {
    // Type-safe submission
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Use Form components */}
      </form>
    </Form>
  )
}
```

### API Routes with tRPC

```typescript
// server/api/routers/user.ts
export const userRouter = createTRPCRouter({
  getById: publicProcedure.input(z.object({ id: z.string() })).query(async ({ input, ctx }) => {
    return await ctx.db.query.users.findFirst({
      where: eq(users.id, input.id),
    })
  }),
})
```

### AI Integration Pattern

- Use direct REST API access (e.g., Google Gemini, OpenAI)
- Avoid vendor-specific SDKs unless necessary
- Keep API keys in environment variables
- Implement proper error handling and rate limiting

## 🔒 Security & Data Layer

### Environment Variables

- Store in `.env.local` (development) or Vercel dashboard (production)
- NEVER hardcode secrets or API keys
- Type environment variables:

```typescript
// env.mjs
import { z } from "zod"

const envSchema = z.object({
  DATABASE_URL: z.string(),
  CLERK_SECRET_KEY: z.string(),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
})

export const env = envSchema.parse(process.env)
```

### Database Patterns

- ALL queries through Drizzle ORM (no raw SQL in application code)
- Schema defined in `src/server/db/schema.ts`
- Migrations generated via `pnpm drizzle-kit generate:pg`
- Migration files saved to `/migrations/` directory
- Migrations executed manually in Neon console
- Use transactions for multi-step operations

```typescript
// server/db/queries/users.ts
export async function getUserById(id: string) {
  return await db.query.users.findFirst({
    where: eq(users.id, id),
    with: { profile: true },
  })
}
```

## 🚀 Development Workflow

### Cloud-First Development Philosophy

- **Direct-to-Production**: All GitHub pushes deploy straight to production via Vercel
- **No Staging/Preview**: We deploy with confidence directly to production
- **AI Tests Locally**: Claude Code runs `pnpm dev` to verify changes work correctly
- **User Never Tests Locally**: User only reviews, commits, and deploys
- **High Quality Bar**: Code must be production-ready before every commit

### What Claude Code Does:

1. Writes production-ready code following all standards
2. Tests locally using `pnpm dev` to verify functionality
3. Runs ALL quality checks before declaring ready:
   ```bash
   pnpm format
   pnpm lint --fix
   pnpm type-check
   pnpm test
   pnpm build  # Verify production build
   ```
4. Generates migration files when schema changes:
   ```bash
   pnpm drizzle-kit generate:pg
   # Saves output to /migrations/YYYY-MM-DD_description.sql
   ```
5. Updates documentation as needed
6. Reports when code is ready to commit

### What User Does:

1. Reviews the code changes
2. Commits and pushes to GitHub
3. **Code deploys automatically to production**
4. Executes SQL migrations in Neon console if needed
5. Never runs local dev servers

### Feature Development Process

1. Work directly on main branch (or create feature branch if preferred)
2. Implement with FULL functionality (no TODOs, mocks, or placeholders)
3. Test thoroughly with local dev server
4. Pass all quality gates
5. Fix ALL errors before declaring complete
6. Update relevant documentation
7. Commit message describes what was done
8. **Push deploys directly to production**

### Database Migration Process

When schema changes are needed:

1. Update Drizzle schema files in `src/server/db/schema.ts`
2. Generate migration using Drizzle Kit:
   ```bash
   pnpm drizzle-kit generate:pg
   ```
3. Migration file is automatically saved to `/migrations/` directory
4. File naming: `YYYY-MM-DD_descriptive_name.sql`
5. Commit both schema changes and migration file
6. After deployment, user executes migration in Neon console
7. Example migration content:
   ```sql
   -- migrations/2025-07-27_add_user_role.sql
   ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user';
   CREATE INDEX idx_users_role ON users(role);
   ```

### Pre-Commit Checklist

- [ ] All quality checks pass (`format`, `lint`, `type-check`, `test`, `build`)
- [ ] File casing is correct (Linux compatibility)
- [ ] No hardcoded secrets or API keys
- [ ] Migrations generated via `pnpm drizzle-kit generate:pg` if schema changed
- [ ] Documentation updated if needed
- [ ] Design follows `Design-Guidelines.md` if UI work
- [ ] **Code is production-ready** (deploys directly to production)

### Production Deployment Notes

- **CRITICAL**: Every push to GitHub deploys DIRECTLY to production
- No preview or staging environments exist
- Ensure code is thoroughly tested before pushing
- Environment variables configured in Vercel dashboard
- Database migrations must be run manually in Neon after deployment
- Monitor production logs in Vercel after deployment

### Documentation Maintenance Protocol

When preparing to commit:

1. Review all staged files
2. Check if any changes affect:
   - API interfaces
   - Component props
   - Database schema (generate migration with `pnpm drizzle-kit generate:pg`)
   - Environment variables
   - UI/design patterns (consult `Design-Guidelines.md`)
   - Deployment process
3. Update relevant documentation:
   - README.md for setup changes
   - API docs for endpoint changes
   - Component docs for prop changes
   - Migration files for schema changes
4. Include all updates in the same commit
5. Push to GitHub for production deployment

## ⛔ Critical Prohibitions

### NEVER DO THESE

- DO NOT use `any` type without explicit justification
- DO NOT use Pages Router patterns (getServerSideProps, etc.)
- DO NOT mix server code in Client Components
- DO NOT write placeholder/mock implementations
- DO NOT commit directly to main branch (unless that's the workflow)
- DO NOT add dependencies without approval
- DO NOT skip the quality gate commands
- DO NOT use console.log in production code
- DO NOT ignore TypeScript errors
- DO NOT use outdated AI-suggested patterns
- DO NOT suggest the USER run local dev servers (Claude Code can test locally)
- DO NOT run database migrations directly (create SQL files)
- DO NOT deploy untested code (everything goes straight to production)

### Common AI Code Generation Fixes

```typescript
// ❌ AI often generates
export const getServerSideProps = async () => {} // Pages Router
const handleSubmit = (data: any) => {} // Untyped
import fs from "fs" // In Client Component
;("Run npm dev to test locally") // Wrong - user doesn't test
;("Manually create migration SQL") // Wrong - use drizzle-kit

// ✅ Correct patterns
export default async function Page() {} // App Router
const handleSubmit = (data: FormData) => {} // Typed
;("use server") // For server-only code
;("I'll test this with pnpm dev, then you can commit") // Correct
;("I'll generate migration with pnpm drizzle-kit generate:pg") // Correct
```

## 🎨 UI/UX Standards

### Design System Reference

- **IMPORTANT**: When implementing any UI/design features, read `Design-Guidelines.md` for comprehensive visual standards
- The design guidelines contain detailed specifications for:
  - Color systems and gradients
  - Typography and font usage
  - Component patterns with Framer Motion
  - Animation and micro-interactions
  - Layout systems and spatial design

### Core Design Principles

- Beautiful design and inclusive design are inseparable
- Every visual decision considers accessibility
- Motion respects `prefers-reduced-motion`
- Minimum 4.5:1 contrast ratio for all text
- 44x44px minimum touch targets

### Performance Targets

- LCP < 2.5s
- FID < 100ms
- CLS < 0.1
- Bundle size monitoring with next-bundle-analyzer

## 📊 Error Handling & Monitoring

### Structured Error Handling

```typescript
// Use custom error classes
export class AppError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
  }
}

// Handle errors consistently
try {
  const result = await riskyOperation()
} catch (error) {
  if (error instanceof AppError) {
    // Handle known errors
  } else {
    // Log unknown errors
    console.error("Unexpected error:", error)
  }
}
```

## 🔄 Continuous Improvement

### Code Review Focus Areas

1. TypeScript strictness compliance
2. Proper Server/Client separation
3. Form validation completeness
4. Error boundary implementation
5. Accessibility compliance
6. Performance impact
7. Security considerations
8. Documentation accuracy

### Questions to Ask Before Implementation

- Is this the most type-safe approach?
- Have I considered all edge cases?
- Is this pattern maintainable?
- Does this follow our established conventions?
- Will this work in Vercel's Edge Runtime?
- Have I updated relevant documentation?
- **Is this code production-ready?** (It's going straight to production!)

---

_This CLAUDE.md is a living document. Update it when establishing new patterns or discovering better practices. Use the # key during development sessions to add new rules organically. Use `/status` to verify which context files are currently loaded._