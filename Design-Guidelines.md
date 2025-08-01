# Complete Design Guidelines for Beautiful Next.js Apps (2025)

_A comprehensive design system for creating visually stunning, emotionally resonant web applications that define the 2025 user experience_

**Version 2.0 | July 2025**

---

## Table of Contents

1. [Design Philosophy & Core Principles](https://claude.ai/chat/678a956b-8a40-467c-a8ee-2d64b63626b6#philosophy)
2. [Tech Stack & Architecture](https://claude.ai/chat/678a956b-8a40-467c-a8ee-2d64b63626b6#tech-stack)
3. [Visual Excellence Standards](https://claude.ai/chat/678a956b-8a40-467c-a8ee-2d64b63626b6#visual-standards)
4. [Design Foundations](https://claude.ai/chat/678a956b-8a40-467c-a8ee-2d64b63626b6#foundations)
5. [Component Library](https://claude.ai/chat/678a956b-8a40-467c-a8ee-2d64b63626b6#components)
6. [Layout & Spatial Design](https://claude.ai/chat/678a956b-8a40-467c-a8ee-2d64b63626b6#layout)
7. [Motion & Animation](https://claude.ai/chat/678a956b-8a40-467c-a8ee-2d64b63626b6#motion)
8. [Implementation with Modern Stack](https://claude.ai/chat/678a956b-8a40-467c-a8ee-2d64b63626b6#implementation)
9. [Quality & Performance Standards](https://claude.ai/chat/678a956b-8a40-467c-a8ee-2d64b63626b6#quality)

---

## Design Philosophy & Core Principles {#philosophy}

### The Five Pillars of Exceptional Design (2025)

**1. Meaningful Expression over Functional Minimalism**

- Interfaces must be personal, emotionally resonant, and dynamic
- Strategic use of color, shape, and motion creates memorable experiences
- Every interaction should feel considered and delightful
- Balance clarity with character—never boring, always intuitive

**2. Intelligence as an Interface Layer**

- AI is seamlessly integrated into the user experience
- Interfaces anticipate user needs and provide contextual assistance
- Real-time personalization based on user behavior
- Smart defaults and predictive interactions reduce friction

**3. System-First Design**

- A comprehensive design system is the foundation of every project
- Components built systematically from shared design tokens
- Consistency achieved through programmable design patterns
- Every element serves both aesthetic and functional purposes

**4. Standalone Excellence**

- Each application is a distinct, self-contained product
- Independent architecture allows for focused, specialized experiences
- Clean separation enables independent scaling and evolution
- Every app should feel complete and polished on its own

**5. Accessibility as a Cornerstone**

- Beautiful design and inclusive design are inseparable
- Every visual decision considers users with different abilities
- Accessibility enhances usability for everyone, not just those with disabilities
- WCAG compliance is the baseline, not the goal

### Target Experience Goals

- **Visual Impact**: Users should say "wow" on first impression
- **Emotional Connection**: Create moments of joy and delight
- **Effortless Flow**: Complex tasks feel simple and intuitive
- **Responsive Performance**: Beautiful interfaces that load instantly
- **Inclusive Design**: Stunning visuals accessible to everyone

---

## Tech Stack & Architecture {#tech-stack}

### Core Technologies (Per-Project)

```typescript
// Essential dependencies for a beautiful Next.js app in 2025
{
  "dependencies": {
    // Framework
    "next": "15.x",
    "react": "19.x",

    // Authentication
    "@clerk/nextjs": "latest",

    // Database & ORM
    "@neondatabase/serverless": "latest",
    "drizzle-orm": "latest",

    // API Layer
    "@trpc/server": "latest",
    "@trpc/client": "latest",
    "@trpc/next": "latest",

    // Styling
    "tailwindcss": "latest",
    "tailwind-merge": "latest",
    "class-variance-authority": "latest",

    // UI Components
    "@radix-ui/react-*": "latest", // All needed primitives
    "framer-motion": "latest", // Essential for fluid animations, layout transitions, and micro-interactions that define modern UI

    // Forms
    "react-hook-form": "latest",
    "@hookform/resolvers": "latest",
    "zod": "latest",

    // Data Visualization
    "recharts": "latest",

    // Notifications
    "sonner": "latest"
  }
}
```

### Architecture Principles

Each application follows a standalone architecture with:

- **Dedicated Clerk Instance**: Independent user management
- **Dedicated Neon Database**: Isolated data storage
- **Dedicated Vercel Blob**: Separate file storage
- **Type-Safe Everything**: End-to-end type safety with TypeScript
- **Edge-Optimized**: Built for Vercel's global edge network

---

## Visual Excellence Standards {#visual-standards}

### Color Philosophy for 2025

#### Dynamic Color Systems

```css
/* Aurora Gradients - The signature of 2025 design */
.gradient-aurora {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
}

.gradient-sunset {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.gradient-ocean {
  background: linear-gradient(to right, #43e97b 0%, #38f9d7 100%);
}

/* Animated gradients for hero sections */
@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.gradient-animated {
  background-size: 200% 200%;
  animation: gradient-shift 15s ease infinite;
}
```

#### Semantic Color Usage

```css
/* CVA-powered color variants */
const buttonVariants = cva(
  "transition-all duration-200",
  {
    variants: {
      intent: {
        primary: "bg-gradient-to-r from-primary to-secondary text-white",
        secondary: "bg-white/10 backdrop-blur text-primary border border-primary/20",
        danger: "bg-gradient-to-r from-red-500 to-pink-500 text-white",
      }
    }
  }
)
```

### Typography That Speaks

#### Variable Font Magic

```css
/* Kinetic typography with variable fonts */
.heading-hero {
  font-size: clamp(3rem, 8vw, 6rem);
  font-variation-settings: 'wght' 200;
  transition: font-variation-settings 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.heading-hero:hover {
  font-variation-settings: 'wght' 900;
}

/* Mixed weight emphasis */
.text-emphasis {
  position: relative;
}

.text-emphasis::before {
  content: attr(data-text);
  position: absolute;
  font-variation-settings: 'wght' 100;
  -webkit-text-stroke: 2px currentColor;
  -webkit-text-fill-color: transparent;
}
```

### Depth & Dimension

#### Liquid Glass Effects

```css
/* Glass morphism with color tints */
.glass-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.18);
  box-shadow:
    0 8px 32px 0 rgba(31, 38, 135, 0.15),
    inset 0 1px 0 0 rgba(255, 255, 255, 0.15);
}
```

#### Modern Shadows & Elevation

```css
/* Colored shadow system for depth */
.shadow-primary {
  box-shadow:
    0 10px 40px -10px rgba(10, 132, 255, 0.35),
    0 2px 10px -2px rgba(10, 132, 255, 0.2);
}

.shadow-gradient {
  box-shadow:
    0 10px 40px -10px rgba(102, 126, 234, 0.35),
    0 10px 40px -10px rgba(240, 147, 251, 0.35);
}

/* Elevation on hover */
.elevate-on-hover {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.elevate-on-hover:hover {
  transform: translateY(-4px);
  box-shadow:
    0 20px 40px -15px rgba(0, 0, 0, 0.2),
    0 10px 20px -5px rgba(10, 132, 255, 0.2);
}
```

---

## Design Foundations {#foundations}

### The 2025 Color System

```css
:root {
  /* Primary Palette */
  --color-primary: #0a84ff;
  --color-primary-hover: #0066cc;
  --color-primary-pressed: #004499;

  /* Secondary & Accent */
  --color-secondary: #5856d6;
  --color-accent: #ff3b30;
  --color-success: #34c759;
  --color-warning: #ff9500;

  /* Backgrounds with subtle gradients */
  --color-background-primary: #ffffff;
  --color-background-secondary: #f8f9fe;
  --color-background-tertiary: #f2f3f8;

  /* Text with perfect contrast */
  --color-text-primary: #000000;
  --color-text-secondary: #3c3c43;
  --color-text-tertiary: #3c3c4399;

  /* Special Effects */
  --gradient-primary: linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%);
  --gradient-glass: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.1) 0%,
    rgba(255, 255, 255, 0.05) 100%
  );
}

/* Dark mode with OLED optimization */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background-primary: #000000;
    --color-background-secondary: #0a0a0b;
    --color-background-tertiary: #151516;

    --color-text-primary: #ffffff;
    --color-text-secondary: #ebebf5;
    --color-text-tertiary: #ebebf599;
  }
}
```

### Spacing System (8px Grid)

```css
:root {
  /* Base spacing scale */
  --space-0: 0;
  --space-1: 0.25rem; /* 4px */
  --space-2: 0.5rem; /* 8px */
  --space-3: 0.75rem; /* 12px */
  --space-4: 1rem; /* 16px */
  --space-5: 1.25rem; /* 20px */
  --space-6: 1.5rem; /* 24px */
  --space-8: 2rem; /* 32px */
  --space-10: 2.5rem; /* 40px */
  --space-12: 3rem; /* 48px */
  --space-16: 4rem; /* 64px */
  --space-20: 5rem; /* 80px */
  --space-24: 6rem; /* 96px */

  /* Component-specific spacing */
  --spacing-card-padding: var(--space-6);
  --spacing-section-gap: var(--space-16);
  --spacing-page-margin: var(--space-8);
}
```

### Modern Border Radius

```css
:root {
  --radius-sm: 0.375rem; /* 6px - Subtle rounding */
  --radius-md: 0.5rem; /* 8px - Default */
  --radius-lg: 0.75rem; /* 12px - Cards, buttons */
  --radius-xl: 1rem; /* 16px - Modals, large cards */
  --radius-2xl: 1.5rem; /* 24px - Hero sections */
  --radius-full: 9999px; /* Pills, circles */
}
```

---

## Component Library {#components}

### Button Component with CVA

```typescript
// components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary: [
          "bg-gradient-to-r from-primary to-secondary text-white",
          "hover:shadow-lg hover:shadow-primary/25",
          "focus-visible:ring-primary"
        ],
        secondary: [
          "bg-white/10 backdrop-blur-md text-primary",
          "border border-primary/20",
          "hover:bg-white/20 hover:border-primary/30",
          "dark:bg-black/10 dark:hover:bg-black/20"
        ],
        ghost: [
          "text-primary hover:bg-primary/10",
          "dark:hover:bg-primary/20"
        ],
        glass: [
          "bg-white/10 backdrop-blur-xl text-white",
          "border border-white/20",
          "hover:bg-white/20 hover:border-white/30",
          "shadow-xl shadow-black/10"
        ]
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-6 text-base",
        lg: "h-14 px-8 text-lg",
        icon: "h-10 w-10"
      }
    },
    defaultVariants: {
      variant: "primary",
      size: "md"
    }
  }
)

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, children, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {children}
      </button>
    )
  }
)
```

### Modern Card with Framer Motion

```typescript
// components/ui/card.tsx
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient"
  interactive?: boolean
}

export function Card({
  className,
  variant = "default",
  interactive = false,
  children,
  ...props
}: CardProps) {
  const variants = {
    default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800",
    glass: [
      "bg-white/10 dark:bg-black/10",
      "backdrop-blur-xl backdrop-saturate-150",
      "border border-white/20 dark:border-white/10",
      "shadow-xl shadow-black/10"
    ].join(" "),
    gradient: [
      "bg-gradient-to-br from-white/10 to-white/5",
      "dark:from-black/10 dark:to-black/5",
      "backdrop-blur-xl",
      "border border-white/20 dark:border-white/10"
    ].join(" ")
  }

  const Component = interactive ? motion.div : "div"

  return (
    <Component
      className={cn(
        "rounded-xl p-6 transition-all duration-300",
        variants[variant],
        interactive && "cursor-pointer hover:shadow-2xl hover:scale-[1.02]",
        className
      )}
      whileHover={interactive ? { y: -4 } : undefined}
      whileTap={interactive ? { scale: 0.98 } : undefined}
      {...props}
    >
      {children}
    </Component>
  )
}
```

### Form Components with React Hook Form

```typescript
// components/ui/form-field.tsx
import { useFormContext } from "react-hook-form"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface FormFieldProps {
  name: string
  label: string
  type?: string
  placeholder?: string
  className?: string
}

export function FormField({
  name,
  label,
  type = "text",
  placeholder,
  className
}: FormFieldProps) {
  const {
    register,
    formState: { errors }
  } = useFormContext()

  const error = errors[name]

  return (
    <div className="relative">
      <div className="relative">
        <input
          {...register(name)}
          type={type}
          placeholder={placeholder}
          className={cn(
            "peer w-full px-4 py-3 pt-6",
            "bg-white dark:bg-gray-900",
            "border-2 border-gray-200 dark:border-gray-800",
            "rounded-lg",
            "placeholder-transparent",
            "focus:border-primary focus:outline-none",
            "transition-all duration-200",
            error && "border-red-500 focus:border-red-500",
            className
          )}
        />
        <label
          htmlFor={name}
          className={cn(
            "absolute left-4 top-2",
            "text-xs font-medium",
            "text-gray-600 dark:text-gray-400",
            "transition-all duration-200",
            "peer-placeholder-shown:top-4",
            "peer-placeholder-shown:text-base",
            "peer-placeholder-shown:text-gray-400",
            "peer-focus:top-2",
            "peer-focus:text-xs",
            "peer-focus:text-primary",
            error && "text-red-500 peer-focus:text-red-500"
          )}
        >
          {label}
        </label>
      </div>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-1 text-sm text-red-500"
          >
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
```

### Toast Notifications with Sonner

```typescript
// components/ui/toast-demo.tsx
import { toast } from 'sonner'

// Success toast with custom styling
toast.success('Your changes have been saved!', {
  className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0',
  duration: 4000,
})

// Error toast with action
toast.error('Something went wrong', {
  action: {
    label: 'Retry',
    onClick: () => handleRetry(),
  },
})

// Promise toast for async operations
toast.promise(saveData(), {
  loading: 'Saving your changes...',
  success: 'Changes saved successfully!',
  error: 'Failed to save changes',
})
```

---

## Layout & Spatial Design {#layout}

### Bento Grid System

```css
/* Modern bento grid for dashboards */
.bento-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--space-6);

  /* Featured items span multiple cells */
  .bento-item-featured {
    grid-column: span 2;
    grid-row: span 2;
  }

  /* Tall items for stats */
  .bento-item-tall {
    grid-row: span 2;
  }

  /* Wide items for charts */
  .bento-item-wide {
    grid-column: span 2;
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .bento-grid {
    grid-template-columns: 1fr;

    .bento-item-featured,
    .bento-item-wide {
      grid-column: span 1;
    }
  }
}
```

### Hero Section Patterns

```typescript
// components/sections/hero.tsx
export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-shift" />

      {/* Floating orbs for depth */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-primary/30 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/30 rounded-full blur-3xl animate-float-delayed" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
        >
          Welcome to the Future
        </motion.h1>
      </div>
    </section>
  )
}
```

---

## Motion & Animation {#motion}

### Framer Motion Patterns

```typescript
// Animation variants for consistent motion
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
}

export const staggerContainer = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const scaleIn = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.9, opacity: 0 },
}

// Page transitions
export const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.3,
}
```

### Micro-Interactions

```css
/* Button press effect */
.interactive-element {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.interactive-element:active {
  transform: scale(0.98);
}

/* Magnetic hover effect */
@keyframes magnetic-hover {
  0%,
  100% {
    transform: translate(0, 0);
  }
  25% {
    transform: translate(-2px, -2px);
  }
  75% {
    transform: translate(2px, 2px);
  }
}

.magnetic-hover:hover {
  animation: magnetic-hover 0.5s ease infinite;
}

/* Pulse effect for notifications */
@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.pulse::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: inherit;
  animation: pulse-ring 1.5s ease-out infinite;
}
```

### Layout Animations with Magic Motion

```typescript
// components/animations/shared-layout.tsx
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

// Example: Image gallery with shared layout animation
export function ImageGallery({ images }) {
  const [selectedId, setSelectedId] = useState(null)

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        {images.map(image => (
          <motion.div
            key={image.id}
            layoutId={`image-${image.id}`}
            onClick={() => setSelectedId(image.id)}
            className="cursor-pointer rounded-lg overflow-hidden"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.img
              src={image.thumbnail}
              alt={image.alt}
              className="w-full h-full object-cover"
            />
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedId && (
          <motion.div
            initial={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
            animate={{ backgroundColor: "rgba(0, 0, 0, 0.8)" }}
            exit={{ backgroundColor: "rgba(0, 0, 0, 0)" }}
            className="fixed inset-0 z-50 flex items-center justify-center p-8"
            onClick={() => setSelectedId(null)}
          >
            <motion.div
              layoutId={`image-${selectedId}`}
              className="relative max-w-4xl max-h-full"
            >
              <motion.img
                src={images.find(img => img.id === selectedId).full}
                alt={images.find(img => img.id === selectedId).alt}
                className="w-full h-full object-contain rounded-lg"
              />
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2"
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedId(null)
                }}
              >
                ✕
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// Example: Tab navigation with layout animation
export function AnimatedTabs({ tabs }) {
  const [activeTab, setActiveTab] = useState(tabs[0].id)

  return (
    <div>
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative px-4 py-2 rounded-md transition-colors ${
              activeTab === tab.id
                ? 'text-primary'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-white dark:bg-gray-800 rounded-md shadow-sm"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35
                }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="mt-4"
        >
          {tabs.find(tab => tab.id === activeTab).content}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
```

### Scroll-Triggered Animations

```typescript
// components/animations/scroll-reveal.tsx
import { motion, useInView } from "framer-motion"
import { useRef } from "react"

export function ScrollReveal({ children, delay = 0 }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.25, 0.1, 0.25, 1] // Custom easing
      }}
    >
      {children}
    </motion.div>
  )
}
```

---

## Implementation with Modern Stack {#implementation}

### Project Structure

```
your-app/
├── app/                    # Next.js 15 App Router
│   ├── (auth)/            # Auth routes (login, register)
│   ├── (dashboard)/       # Protected routes
│   ├── api/              # API routes
│   │   └── trpc/         # tRPC endpoints
│   └── layout.tsx        # Root layout with providers
├── components/
│   ├── ui/               # Radix UI + CVA components
│   ├── forms/            # React Hook Form components
│   └── sections/         # Page sections
├── lib/
│   ├── db/              # Drizzle schema & queries
│   ├── trpc/            # tRPC setup
│   └── utils/           # Helper functions
├── hooks/               # Custom React hooks
├── stores/              # Zustand stores
└── styles/             # Global styles & Tailwind
```

### Data Visualization with Recharts

```typescript
// components/charts/revenue-chart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export function RevenueChart({ data }) {
  return (
    <Card variant="glass" className="p-6">
      <h3 className="text-lg font-semibold mb-4">Revenue Overview</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            contentStyle={{
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              border: 'none',
              borderRadius: '8px',
              backdropFilter: 'blur(10px)'
            }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#0A84FF"
            strokeWidth={3}
            fill="url(#revenueGradient)"
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
```

### AI Integration Pattern

```typescript
// lib/ai/gemini.ts
export async function generateWithGemini(prompt: string) {
  const response = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    })
  })

  return response.json()
}

// Usage in a component
export function AIAssistant() {
  const [suggestion, setSuggestion] = useState('')
  const [loading, setLoading] = useState(false)

  async function getSuggestion() {
    setLoading(true)
    const result = await generateWithGemini("Suggest improvements for this UI")
    setSuggestion(result.candidates[0].content.parts[0].text)
    setLoading(false)
  }

  return (
    <Card variant="glass" className="p-4">
      <Button onClick={getSuggestion} loading={loading}>
        ✨ Get AI Suggestion
      </Button>
      {suggestion && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-sm"
        >
          {suggestion}
        </motion.p>
      )}
    </Card>
  )
}
```

---

## Quality & Performance Standards {#quality}

### Core Web Vitals Targets

- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5s

### Performance Optimization Checklist

- [ ] Use Next.js Image component for all images
- [ ] Implement dynamic imports for heavy components
- [ ] Enable Tailwind CSS purging in production
- [ ] Use Framer Motion's lazy loading features
- [ ] Implement virtual scrolling for long lists
- [ ] Optimize bundle size with tree shaking
- [ ] Use edge functions for API routes
- [ ] Enable HTTP/2 push for critical resources

### Accessibility Standards

- [ ] WCAG 2.1 AA compliance minimum
- [ ] All interactive elements keyboard accessible
- [ ] Proper ARIA labels on all components
- [ ] Focus indicators visible and high contrast
- [ ] Motion respects prefers-reduced-motion
- [ ] Color contrast ratios meet standards
- [ ] Screen reader tested with NVDA/JAWS
- [ ] Mobile touch targets minimum 44x44px

### Testing Strategy

```typescript
// Example component test with React Testing Library
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('should handle click events', async () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByRole('button')
    await userEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should show loading state', () => {
    render(<Button loading>Save</Button>)

    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })
})
```

---

## Conclusion

This design system provides everything needed to create visually stunning, high-performance Next.js applications in 2025. The key principles:

1. **Start with Visual Impact** - Make users say "wow" from the first interaction
2. **Build on Solid Foundations** - Use the modern tech stack systematically
3. **Motion Brings Life** - Every interaction should feel considered and delightful
4. **Performance is Design** - Beautiful apps must also be blazingly fast
5. **Iterate Based on Feedback** - Use analytics and user testing to refine

Remember: In 2025, users expect more than functional interfaces. They want experiences that inspire, delight, and feel magical. This guide gives you the tools to deliver exactly that.

---

**Document Status**: v2.0 - Active  
**Last Updated**: July 2025  
**Next Review**: October 2025

_For the latest updates and component examples, visit our design system repository._
