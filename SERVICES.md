in my# Services Overview

This document captures what each user-facing service in the Afthuliftme app does, which screens orchestrate it, and the backend touchpoints that power the flow. Use it as the quick index when you need to reason about features or locate the code that drives a specific behaviour.

---

## Roadside Assistance (Car & Bike)
**Entry points**  
- Customer UI: `app/services/roadsidecar-service.tsx`, `app/services/roadsidebike-service.tsx`  
- Shared state: `context/BookingContext.tsx`  
- Maps & cards: `components/Map`, `components/ServiceOption`

**Customer flow**  
- Pick a vehicle from garage history (`GET /api/vehicles`).  
- Pin pickup location on the map; `BookingContext` stores `pickupLocation` and address metadata.  
- Browse recommended providers and see ETA/distance once a garage/tow partner accepts.  
- Choose payment method (saved card or cash) and confirm.  
- Track the provider in real time until completion; cancellations and OTP verification happen inside the same context.  

**Backend interactions**  
- `POST /api/bookings/request-service` starts the search window and seeds candidate providers.  
- WebSocket updates (see `api/socket.ts`) broadcast provider acceptance, progress, and completion.  
- `POST /api/bookings/:id/confirm-payment` or `confirm-cash` finalise payment state.

---

## Home Service
**Entry point**: `app/services/homeservice.tsx` (shares most scaffolding with roadside flows).  
**Flow**: identical stage manager with `BookingContext`, but service discovery is restricted to garages that advertise in-home repair (`ServiceCategory.HOME_SERVICE`). The customer schedules a slot, confirms pricing, and tracks an assigned technician.  
**APIs**: same booking endpoints with category filters; homeservice adds address & scheduling notes in the payload.

---

## Luxury Concierge Service
**Entry point**: `app/services/luxury-service.tsx`.  
**Flow**: premium-only garages/providers are surfaced. The UI emphasises curated service options and may require card-on-file before dispatch.  
**Distinct bits**: Additional UI for chauffeur / premium add-ons, but still driven by `BookingContext`.  
**APIs**: `GET /api/services?categories=LUXURY` for catalog, then standard booking lifecycle.

---

## Electric Vehicle Support
**Entry point**: `app/services/electric-vehicleservice.tsx`.  
**Flow**: mirrors roadside booking yet highlights EV-capable providers (battery swap, charging van, etc.). The service selection sheet filters `ServiceCategory.ELECTRIC_VEHICLE`.  
**APIs**: identical booking endpoints with EV category; map pins include EV tooling metadata provided by `/api/services`.

---

## Towing Service
**Primary screens**  
- Customer map: `app/services/towing_service.tsx` + `components/TowMap.tsx`  
- Flow state: `context/TowingBookingContext.tsx`  
- Provider tooling: `app/services/towtruck/*`, `app/(root)/(tabs)/settings/add-business/businesssetup/towtruck-setup/*`

**Customer flow**  
1. Pick vehicle → set pickup & destination pins.  
2. Start tow search (`POST /api/bookings/request-towing`) which emits through Socket.IO to nearby trucks.  
3. Watch countdown / truck ETA while `useTowingBooking` polls `/api/bookings/active`.  
4. Confirm payment method (card cash). For tow-to-garage requests the flow splits after drop-off:
   - Garage receives vehicle; `garage-dashboard.tsx` handles inspection.  
   - Garage submits initial quote → customer approves (`POST /bookings/:id/confirm-garage-payment`).  
   - Garage performs work, then submits final price (`POST /bookings/:id/submit-final-quote`).  
   - Customer confirms and pays final amount; profile history shows both towing fare and garage final price.

**Provider flow (tow truck owner)**  
- Configure availability via tow truck setup wizard, set live location (`set-tow-truck-location.tsx`) and track jobs in `tow-truck-live-tracking.tsx`.  
- Accept or decline bookings pushed via socket; confirm completion once vehicle delivered.

**Backend**  
- Heavy lifting in `api/bookings.ts` (`request-towing`, tow-to-garage sub-status transitions, payment intent orchestration).  
- Tow truck CRUD lives in `api/services/towtruck.ts`.

---

## Garage Discovery & In-Garage Services
**Customer surface**: `app/services/garages.tsx` + `components/GarageMap`.  
**Flow**  
- Customer grants location; map centres and lists garages filtered by `ServiceCategory`.  
- Bottom sheet surfaces distance, services offered, call/directions shortcuts, and “Request Service” entry points that deep-link into the booking flow with preselected provider/service.  
- Garage map feeds populate from `/api/garages` and `/api/services`.

**Provider dashboard**: `app/(root)/(tabs)/settings/add-business/garage-dashboard.tsx`.  
- Garages manage pending, current, and history jobs.  
- Handles quote submission, final pricing, chat, and payment status updates.  
- Uses endpoints in `api/bookings.ts` (`/garage/bookings`, `/bookings/:id/submit-quote`, final quote/approval routes).

---

## Spare Parts Marketplace
**Customer**  
- Listings grid: `app/services/spareparts.tsx`. Fetches nearby stock using the customer’s location (new optimisation caches the last known location for faster load).  
- Detail page & purchase: `app/services/sparepart-detail.tsx` → `POST /api/bookings/request-spare-part`.  
- Orders appear within the standard bookings history and sockets relay acceptance / completion.

**Seller**  
- Wizard: `app/(root)/(tabs)/settings/add-business/businesssetup/add-spare-part.tsx` (details + media) → `location-picker.tsx` (Geo pin). State stored in `store/sparePartStore.ts`.  
- API: `api/spareparts.ts` creates/upserts the seller’s `SparePartStore`, persists inventory, returns lists for dashboards, and supports deletion.  
- Fulfilment: spare part routes inside `api/bookings.ts` manage order acceptance, Stripe intents or cash fallback, inventory decrement, and completion.

---

## Other Service Routes
- **Service Map** (`app/services/service-map` route): placeholder in router for aggregated map views. When implemented it should reuse `GarageMap` / `TowMap` components to overlay mixed services.  
- **Dynamic spare part routes** (`app/services/[partId].tsx`): legacy detail screen retained for deep links; now superseded by `sparepart-detail.tsx`.

---

## Cross-Cutting Utilities
- **Maps & ETA**: `components/Map`, `components/TowMap`, `components/GarageMap`, plus helper functions in `utils/locationUtils.ts` and server-side Google Directions requests in `api/bookings.ts`.  
- **Real-time updates**: Socket.IO wiring in `api/socket.ts` and contexts (`useBooking`, `useTowingBooking`) keep UI reactive.  
- **Authentication**: All service APIs sit behind Clerk (`ClerkExpressWithAuth`), relying on `useAuth` / `useUser` in the Expo app.

Use this document as the table of contents when onboarding new contributors or mapping requirements to code. Update it whenever you add a new service or significantly change a flow.
