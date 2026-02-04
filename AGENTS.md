# Afthuliftme Agent Brief

Afthuliftme is a mobile-first platform that connects stranded drivers with the right help, whether they need a tow truck, in-garage repair, roadside assistance, luxury concierge service, EV support, or spare parts. The Expo app delivers the customer experience while operators (tow trucks, garages, parts sellers) run their business flows through dedicated dashboards. A Node/Prisma backend orchestrates bookings, chat, payments, and real-time updates over Socket.IO.

---

## Product Surface At A Glance
- **Roadside Assistance (Car/Bike)** – Map-driven booking flow (`app/services/roadsidecar-service.tsx`, `roadsidebike-service.tsx`) powered by `BookingContext`. Customers pin their location, select a vehicle, and confirm payment while providers receive sockets updates to accept, navigate, and complete jobs.
- **Home Service** – Same stage manager with in-home garage visits (`app/services/homeservice.tsx`) filtered by `ServiceCategory.HOME_SERVICE`.
- **Luxury Concierge** – Premium garages/services (`app/services/luxury-service.tsx`) emphasise curated options and card-on-file flows.
- **Electric Vehicle Support** – EV-specific roadside help (`app/services/electric-vehicleservice.tsx`) plus nearby charging overlays.
- **Towing & Tow-To-Garage Flow** – `app/services/towing_service.tsx` and `components/TowMap.tsx` cover pickup/destination selection, truck dispatch, and payments. Tow truck owners manage availability and live tracking under `app/(root)/(tabs)/settings/add-business/businesssetup/towtruck-setup/*`. Once a vehicle reaches a garage, `garage-dashboard.tsx` handles inspection, quotes, final pricing, and completion.
- **Garage Discovery** – `app/services/garages.tsx` with `components/GarageMap` list nearby providers, surfaces services, and deep-links into booking with preselected providers. Garages monitor work through the business dashboard.
- **Spare Parts Marketplace** – Customers browse nearby parts (`app/services/spareparts.tsx`, `sparepart-detail.tsx`). Sellers list inventory through `add-spare-part.tsx` and `location-picker.tsx`, backed by `api/spareparts.ts`. Orders ride the booking pipeline so they appear in the unified history.
- **Conversations** – Booking-scoped chats (`api/chat.ts`) hydrate the conversation list and threads under `app/(root)/(tabs)/conversation/*`, using Socket.IO for live messaging. Threads can now be deleted from the conversation index.
- **Cross-Cutting Utilities** – Map components (`components/Map`, `GarageMap`, `TowMap`), location utilities, and `api/bookings.ts` for server-side ETA/distance calculations keep experiences consistent. Clerk handles auth (`useAuth`, `useUser`), Prisma models capture state, and Socket.IO propagates booking events.

Refer to `SERVICES.md` for a service-by-service deep dive and screen references.

---

## Repository & Codebase Guide

### Structure
- `app/` – Expo Router route groups for auth, tabs, and service flows.
- `components/` – Shared UI primitives and map widgets; `components/ui/` wraps NativeWind tokens.
- `context/`, `store/`, `hooks/` – Clerk/Zustand state and booking/towing contexts.
- `api/` – Express handlers, Prisma schema (`api/prisma/schema.prisma`), generated client (`api/app/generated`), and Socket.IO wiring.
- `scripts/` – Maintenance scripts (e.g., `scripts/reset-project.js`).
- `types/`, `assets/` – Domain types, icons, fonts.

### Key Commands
- `npm run start` – Expo bundler (`--clear` to reset Metro cache).
- Platform targets: `npm run android`, `npm run ios`, `npm run web`.
- `npm run lint` – Run ESLint (`npm run lint -- --fix` to autofix).
- Backend maintenance: `npm run api:generate`, `npm run api:db:push`.
- Reset routine: `npm run reset-project`.

### Coding & Collaboration
- TypeScript everywhere; components in PascalCase, utilities/hooks in camelCase.
- Two-space indentation, early returns preferred.
- Compose styles via NativeWind class strings; share tokens in `constants/` or `tailwind.config.js`.
- ESLint handles formatting; avoid alternate tooling.

### Testing & QA
- Jest wiring pending—co-locate tests as `*.test.ts(x)` when adding coverage, mocking Expo APIs via `@testing-library/react-native`.
- Validate Prisma changes with disposable databases (`npm run api:db:push -- --force`).
- Manual QA: run sign-in, booking (all stages), chat, map flows before shipping.

### Git & Reviews
- Commit messages: short, imperative (≈65 chars, no trailing periods).
- Reference issues in commit/PR bodies; include platform test notes and media for UI updates.

### Security & Configuration
- Secrets in `.env` / `api/.env`. Review `app/index.tsx:16` for keystore context.
- Rotate Clerk, Stripe, Google Maps keys after previews; scrub sensitive logs.
- Update `expo-env.d.ts` whenever environment variables change to maintain type safety.

Use this brief to onboard quickly, understand the product surface, and locate the right modules when extending Afthuliftme. For granular service behaviour, see `SERVICES.md`; for troubleshooting or feature-specific flows, check the corresponding route/component duo noted above.
