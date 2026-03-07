# MediCare-Plus: UI/UX Design Specification & Design System
**Version:** 1.0
**Design Philosophy:** Institutional Trust, Medical Authority, High Readability, Human Care.
**Core Objective:** Transition from a "startup landing page" aesthetic to a premium, hospital-grade healthcare platform.

---

## 1. Color Palette

The color system is rooted in traditional medical trust colors: deep blues for authority, soft teals for health/healing, and expansive whites/grays for a sterile, clean layout. Flashy gradients and highly saturated neon colors are explicitly avoided.

### Primary Colors (Trust & Authority)
- **Primary Navy:** `#1A365D` (Deep, authoritative blue. Used for primary text, major headings, and primary buttons.)
- **Primary Blue:** `#2B6CB0` (Used for active states, key links, and secondary visual weight.)

### Secondary Colors (Health & Care)
- **Soft Teal:** `#319795` (Used for subtle accents, medical icons, and highlight areas without overpowering.)
- **Muted Teal/Cyan:** `#B2F5EA` (Used for extremely subtle backgrounds or alert banners.)

### Neutral / Background Colors (Cleanliness & Space)
- **Pure White:** `#FFFFFF` (Main background for content areas and cards.)
- **Off-White/Light Gray:** `#F7FAFC` (Secondary background to separate sections and create depth without borders.)
- **Border/Divider Gray:** `#E2E8F0` (Soft structural lines, card borders.)
- **Body Text Gray:** `#4A5568` (High contrast, easy to read, reduces eye strain compared to pure black.)
- **Disabled/Muted Text:** `#A0AEC0` 

### Semantic Colors (Feedback)
- **Success (Green):** `#2F855A` (Soft, natural green for confirmed appointments, successful actions.)
- **Success Background:** `#F0FFF4`
- **Error (Red):** `#C53030` (Clear, non-aggressive red for errors, failed validations.)
- **Error Background:** `#FFF5F5`
- **Warning (Yellow):** `#D69E2E` 

---

## 2. Typography System

High readability is paramount. We will use a highly legible, classic sans-serif combination. 

**Headings Font:** `Inter` or `Roboto` (Weights: SemiBold 600, Bold 700)
**Body Font:** `Inter` or `Roboto` (Weights: Regular 400, Medium 500)

*Note: Avoid highly stylized or overly rounded fonts. The tone should be clinical and direct.*

### Hierarchy
- **H1 (Page Titles):** 36px (2.25rem) / Line-height: 1.2 / Weight: 700 / Color: Primary Navy
- **H2 (Section Titles):** 24px (1.5rem) / Line-height: 1.3 / Weight: 600 / Color: Primary Navy
- **H3 (Card Titles, Modals):** 20px (1.25rem) / Line-height: 1.4 / Weight: 600 / Color: Primary Navy
- **H4 (Subsections):** 16px (1rem) / Line-height: 1.5 / Weight: 600 / Color: Primary Navy
- **Body 1 (Main Text):** 16px (1rem) / Line-height: 1.6 / Weight: 400 / Color: Body Text Gray
- **Body 2 (Secondary Text):** 14px (0.875rem) / Line-height: 1.5 / Weight: 400 / Color: Body Text Gray
- **Caption/Small:** 12px (0.75rem) / Line-height: 1.4 / Weight: 400 / Color: Muted Text

---

## 3. Spacing & Layout System

We use a strict **8px baseline grid** to ensure mathematical rhythm, consistency, and a highly structured, organized feel.

- **Micro (Sub-element spacing):** 4px (0.25rem)
- **Small (Items in a list, icon + text):** 8px (0.5rem)
- **Medium (Form fields, inner card padding):** 16px (1rem) / 24px (1.5rem)
- **Large (Section spacing, page padding):** 32px (2rem) / 48px (3rem)
- **X-Large (Major page sections):** 64px (4rem) / 96px (6rem)

*Layout Constraints:* Maximum content width should be capped at `1280px` to prevent text lines from becoming too long and unreadable on ultrawide monitors.

---

## 4. Button Styles

Buttons must look clickable, prominent, but unflashy. Keep border-radius minimal (4px to 6px) to maintain a structured, institutional feel—no pill-shaped buttons.

- **Primary Button (Booking, Main Actions):**
  - Background: Primary Blue (`#2B6CB0`)
  - Text: White, Medium weight
  - Border Radius: 6px
  - Hover: Darker Blue (`#2C5282`)
  - No drop shadows, except a very subtle 0px 2px 4px rgba(0,0,0,0.05) to lift it.

- **Secondary Button (Cancel, Go Back):**
  - Background: White (`#FFFFFF`) or Off-White (`#F7FAFC`)
  - Text: Primary Navy (`#1A365D`)
  - Border: 1px solid Divider Gray (`#E2E8F0`)
  - Border Radius: 6px
  - Hover: Light Gray Background (`#EDF2F7`)

- **Outline/Ghost Button (Non-intrusive actions):**
  - Background: Transparent
  - Text: Primary Blue (`#2B6CB0`)
  - Border: 1px solid Primary Blue
  - Hover: Muted light blue background (`#EBF8FF`)

---

## 5. Card Design Style

Cards will be used for Dashboards, Patient Records, and Appointments. They must look like physical, clinical documents.

- **Background:** Pure White (`#FFFFFF`)
- **Border:** 1px solid Divider Gray (`#E2E8F0`). *Do not use heavy box shadows.*
- **Shadow (Optional/Subtle):** `0 1px 3px rgba(0, 0, 0, 0.05)` (Provides clean separation from the off-white background).
- **Border Radius:** 8px.
- **Padding:** 24px internal padding for comfortable breathing room.
- **Headers inside cards:** Should have a subtle bottom border or divider line to separate the title from the data.

---

## 6. Form Field Design

Forms (Login, Booking, Profile) must prioritize clarity, accessibility, and error prevention. 

- **Labels:** 14px, Medium weight, Primary Navy. Always placed *above* the input field (not placeholder-only).
- **Input Background:** White (`#FFFFFF`).
- **Input Border:** 1px solid Divider Gray (`#E2E8F0`).
- **Border Radius:** 6px.
- **Padding:** 12px (vertical), 16px (horizontal).
- **Focus State:** 2px solid Primary Blue (`#2B6CB0`), no fuzzy glow.
- **Error State:** 1px solid Error Red (`#C53030`). Error messages displayed below the field in 12px red text with a tiny alert icon.
- **Disabled State:** Background `#F7FAFC`, Text `#A0AEC0`, cursor not-allowed.

---

## 7. Navbar & Footer Styling Rules

### Navbar (Header)
- **Style:** Clean, stark white (`#FFFFFF`) background with a structural bottom border (`1px solid #E2E8F0`).
- **Height:** 72px (allows for clear, uncrowded branding).
- **Logo:** Keep it professional. Only text or a minimalist cross/shield icon in Primary Navy.
- **Navigation Links:** Body 1 size (16px), Primary Navy color. 
  - *Active State:* A solid 2px line beneath the active tab or a subtle background change. 
  - *Hover:* Primary Blue (`#2B6CB0`).
- **Call to Action (e.g., Book Appointment/Login):** Primary Button style in the top right.

### Footer
- **Style:** Deep Primary Navy (`#1A365D`) background to anchor the page. Text in White and Light Gray (`#E2E8F0`).
- **Layout:** Standard multi-column layout.
  - Column 1: Hospital Logo, Address, Emergency Contact (bold, large).
  - Column 2: Quick Links (Patient Portal, Departments).
  - Column 3: Legal & Compliance (Privacy Policy, HIPAA guidelines, Terms of Service).
- **Spacing:** Generous padding (at least 64px top and bottom).
- **Typography downscale:** Links and text in the footer should be 14px (Body 2).

---

## 8. Animations & Transitions

- **Rule:** Animations should be virtually invisible, providing utility rather than flair. 
- **Transitions:** Use quick, linear speed (150ms - 200ms) for hover states, modal openings, and tab switching. 
- **Avoid:** Bouncy effects, long cross-fades, elements sliding in from off-screen, or parallax scrolling. The interface should feel rock-solid and responsive immediately.

---
*End of Design System Specification.*
