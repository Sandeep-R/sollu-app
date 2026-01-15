# Sollu App - Premium Design System

## Overview

This document describes the Swiss spa-inspired premium design system implemented for the Sollu Tamil Learning App. The design prioritizes minimalism, elegance, and professional polish.

---

## Design Philosophy

**Key Principles:**
1. **Minimalism** - Remove unnecessary elements, let content breathe
2. **Hierarchy** - Clear visual hierarchy through typography and spacing
3. **Restraint** - Limited color palette, purposeful use of accent colors
4. **Elevation** - Subtle shadows create depth without distraction
5. **Fluidity** - Smooth transitions and animations
6. **Precision** - Perfect spacing and alignment throughout

**Inspiration:** Swiss spa luxury - calm, refined, expensive-feeling

---

## Color Palette

### Primary Colors

```css
/* Deep charcoal with blue undertones - main UI elements */
--primary: 215 25% 20%
--primary-foreground: 0 0% 100%

/* Soft stone grey - secondary elements */
--secondary: 210 15% 92%
--secondary-foreground: 215 25% 20%
```

### Semantic Colors

```css
/* Success - Refined sage green */
--success: 160 25% 45%
--success-foreground: 0 0% 100%

/* Warning - Warm amber */
--warning: 40 85% 55%
--warning-foreground: 40 90% 15%

/* Destructive - Muted terracotta */
--destructive: 5 60% 55%
--destructive-foreground: 0 0% 100%
```

### Neutral Colors

```css
/* Background - Off-white with blue tint */
--background: 210 20% 98%
--foreground: 215 25% 15%

/* Muted - Whisper grey */
--muted: 210 15% 95%
--muted-foreground: 215 15% 40%

/* Accent - Cool sage (minimal use) */
--accent: 160 20% 88%
--accent-foreground: 160 30% 25%

/* Borders - Barely there */
--border: 210 15% 88%
```

---

## Typography

### Font Family
- **Primary:** Inter (system font with premium characteristics)
- **Features:** Ligatures, kerning enabled
- **Letter spacing:** -0.011em (tighter for premium feel)

### Scale

```css
/* Headings - Light to normal weight for elegance */
h1: 4xl-6xl (text-4xl md:text-5xl lg:text-6xl) - font-light
h2: 3xl-4xl (text-3xl md:text-4xl) - font-light
h3: 2xl-3xl (text-2xl md:text-3xl) - font-normal
h4: xl-2xl (text-xl md:text-2xl) - font-normal

/* Body - Relaxed leading for readability */
p: leading-relaxed (1.625)
```

**Usage Notes:**
- Use font-light for large headings (creates premium feel)
- Use font-medium only for emphasis
- Never use font-bold except in specific UI elements

---

## Spacing System

**Base Unit:** 0.25rem (4px)

### Scale
- `xs`: 0.5rem (8px)
- `sm`: 0.75rem (12px)
- `md`: 1rem (16px)
- `lg`: 1.5rem (24px)
- `xl`: 2rem (32px)
- `2xl`: 3rem (48px)
- `3xl`: 4rem (64px)

### Component Spacing
- **Cards:** p-6 md:p-8 (24-32px padding)
- **Sections:** gap-8 md:gap-12 (32-48px gaps)
- **Elements:** gap-4 md:gap-6 (16-24px gaps)

---

## Elevation System

Subtle shadows that add depth without heaviness:

```css
.elevation-sm {
  box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.03), 0 1px 3px 0 rgb(0 0 0 / 0.02);
}

.elevation-md {
  box-shadow: 0 2px 4px 0 rgb(0 0 0 / 0.04), 0 4px 8px 0 rgb(0 0 0 / 0.03);
}

.elevation-lg {
  box-shadow: 0 4px 8px 0 rgb(0 0 0 / 0.05), 0 8px 16px 0 rgb(0 0 0 / 0.04);
}

.elevation-xl {
  box-shadow: 0 8px 16px 0 rgb(0 0 0 / 0.06), 0 16px 32px 0 rgb(0 0 0 / 0.05);
}
```

**Usage:**
- Static cards: `elevation-sm`
- Hoverable elements: `elevation-md` → `hover:elevation-lg`
- Modals/popovers: `elevation-xl`

---

## Border Radius

```css
--radius: 0.75rem (12px) - default
lg: 0.75rem
md: 0.625rem (10px)
sm: 0.5rem (8px)
```

**Usage:**
- Buttons: `rounded-lg` (12px)
- Cards: `rounded-xl` (16px)
- Pills/badges: `rounded-full`

---

## Components

### Button

**Variants:**
- `default`: Primary action - dark with elevation
- `outline`: Secondary action - transparent with border
- `secondary`: Tertiary action - light grey fill
- `ghost`: Minimal action - hover only
- `success`: Positive action - sage green
- `destructive`: Dangerous action - terracotta

**Sizes:**
- `sm`: h-9 px-4 - Compact contexts
- `default`: h-11 px-6 - Most actions
- `lg`: h-13 px-8 - Hero/primary CTAs
- `icon`: h-11 w-11 - Icon-only buttons

**States:**
- Hover: Slight color shift + elevation increase
- Active: Reduced elevation
- Disabled: 40% opacity
- Focus: 2px ring with primary/20 opacity

### Input & Textarea

**Style:**
- Border: 1px solid border color
- Focus: Border color shifts + 2px ring
- Padding: p-3 (comfortable touch targets)
- Border radius: rounded-lg
- Background: Subtle (card or muted)

### Card

**Structure:**
- Background: Pure white (--card)
- Border: Minimal or none
- Shadow: elevation-sm or elevation-md
- Padding: p-6 md:p-8
- Border radius: rounded-xl

### Flashcard

**Specifications:**
- Size: 320px max width × 240-280px height
- 3D flip: 700ms ease-out transition
- Hover: scale-[1.02] + elevation increase
- Typography:
  - Front: text-xl-2xl medium weight
  - Back: text-xl-2xl medium weight on primary background

### Evaluation Feedback

**Structure:**
- Border radius: rounded-xl
- Padding: p-6
- Border: Semantic color at 20% opacity
- Background: Semantic color at 5% opacity
- Icon: Circular background with icon

**Color mapping:**
- Correct → Success colors
- Partially Correct → Warning colors
- Incorrect → Destructive colors

---

## Transitions & Animations

**Standard Transition:**
```css
.transition-smooth {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Animation Timing:**
- Fast UI feedback: 150-200ms
- Standard transitions: 300ms
- Flip animations: 700ms
- Smooth scrolling: enabled

**Easing:**
- Default: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- Entrance: `ease-out`
- Exit: `ease-in`

---

## Responsive Breakpoints

```css
sm: 640px  /* Mobile landscape */
md: 768px  /* Tablet */
lg: 1024px /* Desktop */
xl: 1280px /* Large desktop */
2xl: 1536px /* Extra large */
```

**Mobile-First Strategy:**
- Base styles for mobile (320px+)
- Use `md:` prefix for tablet+ (768px+)
- Use `lg:` prefix for desktop+ (1024px+)

---

## Icon System

**Library:** Lucide React

**Common Icons:**
- `CheckCircle2`: Success states
- `XCircle`: Error states
- `AlertTriangle`: Warning states
- `Loader2`: Loading (with animate-spin)
- `Sparkles`: AI/evaluation features
- `RotateCcw`: Refresh/retry actions
- `BookOpen`: Learning/educational context

**Sizing:**
- Small: w-4 h-4 (16px)
- Default: w-5 h-5 (20px)
- Large: w-6 h-6 (24px)
- Hero: w-10 h-10+ (40px+)

---

## Empty & Loading States

### Empty States

**Structure:**
```tsx
<div className="flex flex-col items-center gap-6 p-12 md:p-20">
  <div className="w-20 h-20 rounded-full bg-secondary/50 flex items-center justify-center">
    <Icon className="w-10 h-10 text-muted-foreground" />
  </div>
  <div className="text-center space-y-2 max-w-md">
    <h3 className="text-2xl font-light">Heading</h3>
    <p className="text-muted-foreground leading-relaxed">Description</p>
  </div>
</div>
```

### Loading States

**Spinner:**
```tsx
<Loader2 className="w-10 h-10 text-primary animate-spin" />
```

**With Context:**
```tsx
<div className="flex flex-col items-center gap-4 p-20">
  <Loader2 className="w-10 h-10 text-primary animate-spin" />
  <p className="text-sm text-muted-foreground">Loading message</p>
</div>
```

---

## Best Practices

### Do's ✓
- Use generous whitespace
- Limit color usage (neutrals + 1-2 accents per screen)
- Use elevation to indicate interactivity
- Keep animations subtle and purposeful
- Ensure 44px minimum touch targets on mobile
- Use semantic HTML
- Maintain consistent spacing

### Don'ts ✗
- Don't use bright colors unnecessarily
- Don't use heavy borders (prefer subtle shadows)
- Don't use emoji in UI (use icons instead)
- Don't use bold font weights liberally
- Don't create busy layouts
- Don't use complex gradients
- Don't mix border and shadow styles

---

## Accessibility

- **Color contrast:** All text meets WCAG AA standards
- **Focus states:** Visible keyboard focus indicators
- **Touch targets:** Minimum 44×44px
- **Screen readers:** Semantic HTML with proper ARIA
- **Motion:** Respects `prefers-reduced-motion`

---

## Components Redesigned

✅ **Core Learning:**
- Flashcard
- FlashcardDeck
- Evaluation Feedback
- Evaluation Loading

✅ **UI Primitives:**
- Button
- (More to come)

🚧 **In Progress:**
- SentenceSubmissionForm
- TranslationForm
- Auth pages
- Admin interface
- Input components
- Card components

---

## Implementation Status

**Phase 1: Foundation** ✅
- Color system
- Typography scale
- Spacing system
- Elevation system
- Transition utilities

**Phase 2: Core Components** ✅
- Flashcard
- FlashcardDeck
- EvaluationFeedback
- Button

**Phase 3: Forms** 🚧
- SentenceSubmissionForm
- TranslationForm
- Input/Textarea
- Label

**Phase 4: Pages** ⏳
- Home/Learning page
- Auth pages (Sign In/Sign Up)
- Admin dashboard
- Admin conversations

---

## Notes for Developers

1. **Always use design tokens** (CSS variables) instead of hard-coded colors
2. **Follow the spacing scale** - don't create custom spacing values
3. **Use elevation classes** - don't create custom shadows
4. **Maintain consistency** - refer to this document for patterns
5. **Test responsive** - always check mobile, tablet, and desktop
6. **Optimize for touch** - ensure comfortable tap targets on mobile

---

**Last Updated:** January 15, 2026
**Status:** Active Development
**Version:** 1.0.0
