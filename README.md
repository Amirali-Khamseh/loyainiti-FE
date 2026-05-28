# loyainiti-FE

Frontend monorepo for [`loyainiti-BE`](https://github.com/Amirali-Khamseh/loyainiti-BE). Two independent applications share a single design system:

- **`web/`** — Vite + React + TypeScript. Browser app for both customers and business owners.
- **`mobile/`** — Expo (React Native) + TypeScript. iOS/Android app with native QR scanner.
- **`design-system/`** — Canonical CSS tokens, TS tokens, SVG assets, and HTML component previews. Both apps duplicate from here.

## Setup

```bash
# Web
cd web
npm install
cp .env.example .env       # point VITE_API_URL at the BE
npm run dev                # http://localhost:5173

# Mobile (Expo)
cd mobile
npm install
cp .env.example .env       # EXPO_PUBLIC_API_URL
npx expo start             # scan QR with Expo Go
```

The backend defaults to `http://localhost:3000`. Start it from the `loyainiti-BE` repo:

```bash
docker compose up -d postgres
npm run db:migrate
npm run dev
```

## Stack

| Concern | Web | Mobile |
| --- | --- | --- |
| Framework | Vite 5 + React 18 + TS strict | Expo SDK 52 + Expo Router 4 + TS strict |
| Routing | React Router 6 | Expo Router (file-based) |
| Data | TanStack Query 5 | TanStack Query 5 |
| Auth | `better-auth/react` (session cookies) | `better-auth/react` + `@better-auth/expo` |
| Styling | CSS Modules + `tokens.css` | RN `StyleSheet` + `tokens.ts` |
| Forms | `react-hook-form` + `zod` | same |
| Icons | `lucide-react` | `lucide-react-native` |
| Charts | `recharts` | `victory-native` |
| QR scan | manual entry (camera follow-up) | `expo-camera` |

## Pages

Both apps implement nine page categories:

1. Auth — sign in / sign up / forgot password
2. **(Customer)** Explore — all shops + my shops
3. **(Customer)** Shop view — public menu / member menu / reward path
4. **(Customer)** Visits + past rewards
5. **(Customer)** My QR + user_id
6. **(Business)** Stats dashboard — KPIs, daily visits, top customers
7. **(Business)** Scan — QR camera (mobile) / manual entry (web)
8. **(Business)** Menu admin — public + member menus + reward program
9. **(Business)** Business profile — name, description, hours, logo, cover

Role-based routing: a customer-only user sees pages 2–5; a `business_owner` or `staff` user sees 6–9 (plus customer pages for businesses they're a member of).

See [`design-system/README.md`](./design-system/README.md) for visual identity, fonts, and component previews.
