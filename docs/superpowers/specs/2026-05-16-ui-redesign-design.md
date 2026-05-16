# UI Redesign — Premium Design System

**Date:** 2026-05-16  
**Status:** Approved  
**Scope:** Full visual overhaul of the Nivarro chat app — typography, color, icons, logo, buttons, theme toggle

---

## Summary

Replace the current design with a premium, editorial aesthetic inspired by Rolex/Notion quality. Deep navy dark mode + clean white light mode, Cormorant Garamond serif for names/headings, Plus Jakarta Sans for body/UI, Notion-quality SVG icons, Nivarro crown logo, satisfying gradient buttons with glow.

---

## 1. Color Palette

CSS custom properties replacing all current color values in `ThemeContext.jsx`:

### Dark mode
```css
--bg:        #030609;   /* page background */
--rail:      #04080f;   /* icon rail */
--panel:     #060d1a;   /* thread list panel */
--mid:       #0a1628;   /* inputs, elevated surfaces */
--border:    #0e2038;   /* subtle borders */
--hover:     #0c1c34;   /* hover state */
--active:    #0f2240;   /* active/selected state */
--blue:      #1060d8;   /* primary cobalt accent — NO purple */
--blue-hi:   #2878f0;   /* lighter cobalt for text on dark */
--blue-glow: rgba(16,96,216,0.45);
--blue-deep: #0a3ea0;   /* gradient start for buttons/bubbles */
--gold:      #c49010;   /* premium/upgrade actions */
--t1: #ccdaf5;   /* primary text */
--t2: #6a88b0;   /* secondary text */
--t3: #2a3e58;   /* muted text */
--t4: #152030;   /* very muted / placeholders */
```

### Light mode
The light mode keeps the icon rail dark navy (`#081830`) — same as dark. Panel/main switch to white/light grey. Search bar and panel background use deep navy tints (`#0c1e3c`, `#102240`). Main content area uses white (`#fff`) with `#eef3fa` messages background.

---

## 2. Typography

### Font imports — add to `client/index.html` `<head>`
```html
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

### Usage rules
| Element | Font | Weight | Size |
|---------|------|--------|------|
| Page/section headings | Cormorant Garamond | 400 | 20–36px |
| Person names (thread list) | Cormorant Garamond | 500 | 15px |
| Chat window contact name (header) | Cormorant Garamond | 400 | 20px |
| Body text, UI labels, buttons | Plus Jakarta Sans | 400–700 | 11–13px |
| Message preview text | Plus Jakarta Sans | 400 | 11px |
| Message bubble text | Plus Jakarta Sans | 400 | 12px |
| Placeholder text | Plus Jakarta Sans | 400 | 11.5–12px |

**Critical rule:** Person/contact names always use `font-family: 'Cormorant Garamond', serif`. This is the defining aesthetic choice of the redesign.

---

## 3. Icon Rail (`IconRail.jsx`)

### Nivarro Crown Logo
Three-diamond SVG — tall vertical kite center + two wide angled wing rhombuses, each with inner bevel cutout:

```jsx
<svg viewBox="0 0 130 95" fill="none" style={{width:'36px',height:'36px'}}>
  {/* Left wing */}
  <polygon points="4,38 42,20 52,44 20,56" fill="white" opacity="0.92"/>
  <polygon points="12,39 40,24 49,43 22,52" fill="var(--rail)"/>
  <polygon points="12,39 40,24 49,43 22,52" fill="none" stroke="white" strokeWidth="1" opacity="0.45"/>
  {/* Right wing */}
  <polygon points="126,38 88,20 78,44 110,56" fill="white" opacity="0.92"/>
  <polygon points="118,39 90,24 81,43 108,52" fill="var(--rail)"/>
  <polygon points="118,39 90,24 81,43 108,52" fill="none" stroke="white" strokeWidth="1" opacity="0.45"/>
  {/* Center tall diamond */}
  <polygon points="65,2 79,46 65,62 51,46" fill="white" opacity="0.97"/>
  <polygon points="65,11 76,45 65,56 54,45" fill="var(--rail)"/>
  <polygon points="65,11 76,45 65,56 54,45" fill="none" stroke="white" strokeWidth="1" opacity="0.5"/>
</svg>
```

The inner bevel polygons use `var(--rail)` for fill so they always match the rail background in both dark and light mode (rail stays dark in both modes).

### Nav icons
All icons: `18px × 18px`, `stroke-width: 1.55`, `stroke-linecap: round`, `stroke-linejoin: round`, `fill: none`.

| Icon | SVG path |
|------|----------|
| Messages | `<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>` |
| Contacts | `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>` |
| Search | `<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>` |
| Grid/Apps | `<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>` |
| Edit/Compose | `<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>` |

### Icon button states
```
default (inactive): stroke color var(--t4), bg transparent
hover:              stroke var(--t3), bg var(--hover)
active/on:          stroke var(--blue-hi), bg var(--active)
```
Container: `40px × 40px`, `border-radius: 10px`.

### Theme toggle button
Compact pill at bottom of rail: `36px × 36px`, `border-radius: 10px`, `background: var(--mid)`.
- Dark mode shows moon SVG icon
- Light mode shows sun SVG icon (8-ray burst)

### Avatar
`32px` circle, `border-radius: 50%`, gold gradient `linear-gradient(140deg,#b07808,#d8a820)`, double ring: `box-shadow: 0 0 0 2px var(--rail), 0 0 0 3.5px rgba(200,140,20,0.35)`.

---

## 4. Thread List (`ThreadList.jsx`)

### Search bar — fixed icon overlap
Two-part layout: icon container left + input right. Icon NEVER overlaps placeholder text.

```
[sr wrapper: flex, border-radius 10px, overflow hidden]
  [si: 36px wide, flex-shrink 0, centered icon 13×13]
  [input: flex:1, padding 9px 10px 9px 0, no left padding]
```

### Thread row
- Height: natural (padding `9px 14px`)
- Active state: `background: var(--active)`, `border-left: 2.5px solid var(--blue)`, compensated left padding (`11.5px`)
- Avatar: `30px` circle, initials in Plus Jakarta Sans 800 weight

### Person names
```css
font-family: 'Cormorant Garamond', serif;
font-size: 15px;
font-weight: 500;
letter-spacing: 0.1px;
line-height: 1.2;
color: #b8d2f0; /* dark */ / #cce0ff; /* light */
```

### Preview text
Plus Jakarta Sans, 11px, muted color, truncate with ellipsis, max-width ~134px.

---

## 5. Chat Window (`ChatWindow.jsx`, `MessageBubble.jsx`)

### Chat header
Contact name: Cormorant Garamond 400, 20px, `letter-spacing: -0.3px`.

### Message bubbles
```
Received: bg var(--active), color #a8c4e8, border-radius 13 13 13 3, border 1px solid #162840
Sent:     bg linear-gradient(135deg, var(--blue-deep), var(--blue)), color #fff,
          border-radius 13 13 3 13, box-shadow 0 4px 16px var(--blue-glow)
```
Font: Plus Jakarta Sans 12px, line-height 1.55.

### Message input
`border-radius: 10px`, `background: var(--mid)`, `border: 1px solid var(--border)`.

### Send button
`36px × 36px`, `border-radius: 10px`, `background: linear-gradient(135deg, var(--blue-deep), var(--blue))`, `box-shadow: 0 4px 16px var(--blue-glow)`. Hover: scale(1.05) + stronger glow.

---

## 6. Button System

All buttons: Plus Jakarta Sans, 13px, 700 weight.

| Variant | Class | Style |
|---------|-------|-------|
| Primary | `.bp` | `padding 11px 26px`, `border-radius 10px`, gradient `#0a3ea0 → #1060d8`, glow shadow, inset highlight |
| Outline | `.bo` | Transparent bg, `border: 1.5px solid #183a6a`, hover: blue tint fill |
| Pill | `.bpill` | Primary gradient, `border-radius: 30px` |
| Ghost | `.bgh` | Near-black bg, dark border, very muted color |
| Gold | `.bgold` | `#8a6006 → #c49010 → #a87808`, warm glow |
| Danger | `.bdng` | `#820e18 → #b81e2a`, red glow |

Hover behavior: all interactive buttons lift `translateY(-1px)` + glow intensifies.

### Theme toggle (pill switch)
```
[pill wrapper: bg #050b18, border 1px solid #0e2038, border-radius 28px, padding 4px]
  [Dark button: SVG moon + text, active: bg #0c1e38, color var(--blue-hi)]
  [Light button: SVG sun + text, inactive: color var(--t4)]
```

---

## 7. Files to Modify

| File | Changes |
|------|---------|
| `client/index.html` | Add Google Fonts link (Cormorant Garamond + Plus Jakarta Sans) |
| `client/src/context/ThemeContext.jsx` | Replace all CSS custom properties with new palette |
| `client/src/components/IconRail.jsx` | Crown logo SVG, new nav icons, theme toggle pill, avatar ring |
| `client/src/components/ThreadList.jsx` | Cormorant Garamond person names, search bar icon fix |
| `client/src/components/SearchPanel.jsx` | Search icon layout fix (icon container + input, no overlap) |
| `client/src/components/ChatWindow.jsx` | Header contact name serif, new message input/send button |
| `client/src/components/MessageBubble.jsx` | Sent/received bubble gradients and borders |
| `client/src/pages/AuthPage.jsx` | New color palette + button styles |
| `client/src/pages/ProfileSetupPage.jsx` | New color palette + button styles |

No new files. No structural changes — purely styling within existing component boundaries.

---

## 8. Out of Scope

- Routing, data, or API changes
- New components or pages
- Animation beyond existing hover transitions
- Mobile/responsive layout changes
