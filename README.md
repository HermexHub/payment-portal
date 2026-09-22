<div align="center">

# 💳 HermexPay Hosted Checkout
### Isolated Microfrontend, EMV Payment Card & Saga Lab

[ **English** ] &nbsp;•&nbsp; [ [Українська](README.ua.md) ] &nbsp;•&nbsp; [ [System Overview](../overview/README.md) ]

<p align="center">
  Next.js 14.2 (:3001) &bull; Stripe-Style Isolated Ingress &bull; PCI-DSS Ready &bull; Saga Simulator
</p>

</div>

> **HermexPay Hosted Checkout** is an isolated payment gateway microfrontend (modeled after Stripe Checkout and Apple Pay).  
> It delivers secure payment details entry outside the primary consumer storefront, features a realistic 3D EMV payment card, a persistent 15-minute reservation timer, and a collapsible developer Saga Test Lab.

---

## 📸 Visual Showcase & UI Gallery

Detailed screen descriptions and visual walkthroughs:  
👉 **[Hermex Frontend Showcase](../overview/frontend-showcase.md)**

---

## 🏛️ Application Structure

```text
src/
├── app/
│   ├── layout.tsx             # Root fintech light theme layout
│   ├── page.tsx               # Secure root redirect to storefront (No Public Root)
│   ├── globals.css            # Light styles & antialiasing
│   └── pay/[id]/
│       └── page.tsx           # Contextual order payment page
├── components/
│   ├── payment-card-visualizer.tsx # 3D EMV card with metallic chip and CVV flip
│   ├── saga-scenario-selector.tsx  # Collapsible Saga developer drawer
│   └── processing-animation.tsx    # 3D-Secure modal & stepper
└── lib/
    └── utils.ts               # Formatting utilities
```

---

## ✨ Key Features

### 1. Stripe-Grade Fintech Light Theme
- Clean, airy aesthetic (`bg-slate-50` / `bg-white`), subtle borders, and high contrast typography.
- Eliminated security theater clutter. Replaced with an authentic, credible trust statement:  
  *“Secure checkout. Hermex never stores raw payment card data.”*

### 2. Session-Bound Contextual Access (No Public Root)
- Root `/` route does not allow arbitrary UUID input: automatically redirects to the storefront.
- Access is restricted exclusively to authenticated, session-bound `/pay/[id]` routes.

### 3. Interactive 3D Payment Card (`PaymentCardVisualizer`)
- Photorealistic metallic EMV microchip with gold circuit contacts.
- Natural compact 4-digit block spacing: `4242 4242 4242 4242`.
- Smooth 3D flip animation displaying the magnetic stripe and CVV field on focus.

### 4. Non-Resetting 15-Minute Reservation Timer
- Computed from authoritative server creation timestamp (`createdAt` + 15 minutes).
- Synchronized with wall-clock time (`Date.now()`) and persisted in `localStorage`.
- Pressing **F5**, refreshing the page, or opening in a new tab **does not reset** the timer to 15:00.
- Order line items and amounts remain cached and visible without flickering.

### 5. Collapsible Saga Developer Test Lab
- Clean collapsible drawer: `[ 🧪 Saga Test Lab (Developer Mode) ]`.
- 1-click test simulation for all distributed transaction paths:
  - `[ ✅ Success ]` ➔ `4242...4242` (`payment.succeeded` ➔ order confirmed).
  - `[ ❌ Insufficient Funds ]` ➔ `4000...0002` (`payment.failed` ➔ inventory restocked ➔ order cancelled).
  - `[ 🚫 Card Expired ]` ➔ `4000...0003`.
  - `[ 🛑 Issuer Declined ]` ➔ `4000...0004`.
  - `[ ⏱️ Timeout ]` ➔ `4000...0005`.

### 6. Processing & 3D-Secure Modal
- Step-by-step authorization animation (Session validation ➔ Issuer 3D-Secure ➔ Transaction capture).
- Automatic return redirect to the storefront Live Order Tracker.

---

## ⚙️ Environment Variables (`.env.local`)

| Variable | Type | Default | Description |
| :--- | :---: | :---: | :--- |
| `NEXT_PUBLIC_API_URL` | string | `http://localhost:4000` | API Gateway base URL |
| `NEXT_PUBLIC_WEBSITE_URL`| string | `http://localhost:3000` | Storefront base URL |

---

## 🛠️ Run & Deployment

```bash
# Install dependencies
bun install

# Start development server on port 3001
bun dev

# Build production bundle
bun run build

# Start production server
bun start
```
