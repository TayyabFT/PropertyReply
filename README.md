# PropertyReply — BMV Marketplace

A Next.js (App Router) port of the original single-file `main.html` design for
PropertyReply, the UK below-market-value property marketplace. The visual
design is preserved exactly; the markup has been split into modular, reusable
components.

## Tech stack

- [Next.js 14](https://nextjs.org/) (App Router)
- React 18 + TypeScript
- Plain CSS (the original stylesheet, ported verbatim into `globals.css`)

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Other scripts

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint
```

## Project structure

The codebase is organised so that every UI module lives in its own folder under
`src/components`, and every reusable SVG lives in its own file under
`src/components/icons`.

```
src/
├─ app/
│  ├─ globals.css        # full design system / stylesheet (ported verbatim)
│  ├─ layout.tsx         # root layout + Google Fonts
│  └─ page.tsx           # composes all sections into the page
└─ components/
   ├─ icons/             # one file per SVG
   │  ├─ LockIcon.tsx
   │  └─ GoogleIcon.tsx
   ├─ Navbar/            # top navigation
   ├─ JumpNav/           # section jump navigation
   ├─ Hero/              # hero + search widget
   ├─ Listings/          # property listings (+ PropertyCard, data)
   ├─ DealAnalysis/      # deal analysis breakdown
   ├─ Membership/        # membership plans (+ PlanCard, data)
   ├─ SubmitListing/     # submit-a-deal form
   ├─ Dashboard/         # member dashboard
   ├─ Profile/           # profile & settings
   ├─ Affiliate/         # affiliate programme
   ├─ AdminPanel/        # admin panel
   ├─ Kyc/               # KYC / compliance
   ├─ Notifications/     # notifications feed
   ├─ Auth/              # sign in / register / reset
   ├─ Trust/             # trust, compliance & legal
   └─ Footer/            # site footer
```

Each module is a self-contained component. Repeated UI (property cards,
membership plans, tables, lists) is driven by small typed data arrays kept
beside the component, so the rendered markup matches the original design
exactly while staying DRY.

## Design fidelity

The stylesheet from `main.html` was extracted verbatim into
`src/app/globals.css`, and the same Google Fonts (Syne, Inter, JetBrains Mono)
are loaded in `layout.tsx`. No visual changes were made during the port.
