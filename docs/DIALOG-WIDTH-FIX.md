# Dialog/Modal Width Issue Fix

## Problem
Dialogs and modals render as a narrow vertical strip (~49px wide) instead of their intended width, despite having width classes applied.

## Root Cause
**Tailwind CSS v4 parsing bug** with `calc()` in arbitrary values.

### What Doesn't Work in Tailwind v4:
```tsx
// These all fail silently - element renders at content width (~49px)
className="w-[calc(100vw-2rem)]"      // No spaces - invalid CSS
className="w-[calc(100vw_-_2rem)]"    // Underscores - Tailwind v4 parsing bug
className="w-full"                     // On fixed elements - no width reference
```

### Why It Fails:
1. CSS `calc()` requires spaces around operators: `calc(100vw - 2rem)` not `calc(100vw-2rem)`
2. Tailwind v3 converted underscores to spaces, but v4 has a parsing bug
3. `w-full` on `position: fixed` elements doesn't have a parent width reference
4. The element falls back to intrinsic/content width (~49px from close button)

## Solution
**Use inline styles for critical positioning and sizing:**

```tsx
<DialogPrimitive.Content
  className={cn(
    'fixed z-50 border bg-white/90 backdrop-blur-xl',
    'p-6 shadow-xl rounded-xl',
    // ... animation classes
    className
  )}
  style={{
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 'calc(100vw - 2rem)',
    maxWidth: '32rem',
  }}
>
```

### Why Inline Styles Work:
1. Highest CSS specificity - cannot be overridden by class conflicts
2. Bypasses Tailwind parsing entirely
3. Native CSS `calc()` works correctly
4. Guaranteed to apply regardless of build tooling

## Alternative Solutions (Less Reliable)

### CSS Custom Properties
```css
/* globals.css */
:root {
  --dialog-width: calc(100vw - 2rem);
}
```
```tsx
className="w-[var(--dialog-width)]"
```

### Fixed Pixel Widths
```tsx
className="w-80 sm:w-96 md:w-[28rem]"
```

## Files Affected
- `components/ui/dialog.tsx` - Main dialog component
- Any other modal/popup components using Tailwind arbitrary values with `calc()`

## Prevention
When creating modals/dialogs in Tailwind v4:
1. Prefer inline styles for width on fixed-position elements
2. Avoid `calc()` in Tailwind arbitrary values
3. Use CSS custom properties if dynamic values needed
4. Test on production build, not just dev server
