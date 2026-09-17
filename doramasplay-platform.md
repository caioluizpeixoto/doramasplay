# Plan: DoramasPlay — Premium Streaming Platform

## Overview
DoramasPlay is an original, commercial-grade, cinematic streaming platform specializing in Doramas, Movies, Series, Novelas, Novelinhas, and 18+ content. It features a dark cinematic design system, Supabase backend metadata and auth, Bunny Stream video integration with progress saving and auto-next countdown, responsive navigation (with mobile bottom bar), and an advanced admin mass importer with legacy URL matching.

## Project Type
WEB (React 18/19, TypeScript, Tailwind CSS, Supabase, Bunny Stream)

## Success Criteria
- [ ] Complete Supabase SQL schema with 10 tables (`categories`, `contents`, `episodes`, `profiles`, `favorites`, `watch_history`, `plans`, `subscriptions`, `banners`, `featured_content`), RLS policies, and rich seed data.
- [ ] Original cinematic design without purple/violet accents (using Obsidian Dark `#08090c` + Crimson Red `#e50938` + Amber Gold `#e5a93b`).
- [ ] Desktop navigation with scroll blur & Mobile bottom navigation bar.
- [ ] Hero Banner with auto carousel, action buttons, rating, year, and classification.
- [ ] Content carousels (Continue Watching, Trending, Categories, Top Rated, Recommended).
- [ ] Interactive Content Card with hover zoom, quick play, and favorite action.
- [ ] Content Detail Page (`/content/:slug`) with season selector and episode list.
- [ ] Bunny Stream Player with resume prompt ("Continuar de onde parou?"), progress auto-saving to watch history, and 10s auto-advance countdown.
- [ ] Instant search page (`/buscar`) and category pages (`/doramas`, `/filmes`, `/series`, `/novelas`, `/novelinhas`).
- [ ] My List (`/minha-lista`) and Watch History (`/historico`).
- [ ] Plans & Subscriptions page (`/planos`) with Monthly, Quarterly, and Annual tiers.
- [ ] Admin Dashboard (`/admin`) with KPIs, Contents CRUD, and Mass Importer (`/admin/import`) with JSON/CSV cross-matching.
- [ ] Hybrid data layer: full Supabase client support + fallback mock database for instant offline/demo development.

## Tech Stack
- Frontend: React + TypeScript + Vite + Tailwind CSS + Lucide Icons + React Router DOM
- Backend & Auth: Supabase (PostgreSQL, Supabase Auth, RLS)
- Video Provider: Bunny Stream (Direct Embed / HLS / Player API)
- Styling: Tailwind CSS with custom design tokens

## Task Breakdown
- [x] Task 1: Project setup (Vite, TypeScript, Tailwind CSS, dependencies, structure)
- [x] Task 2: Supabase Schema DDL (`supabase/schema.sql`) with 10 tables, RLS, triggers, and seed data
- [x] Task 3: Types, Supabase client, Mock data repository & services (Hybrid Data Layer)
- [x] Task 4: Design system, layout components (Navbar with scroll blur, MobileNav, Footer, Buttons, Badges)
- [x] Task 5: Home page (Hero banner carousel, horizontal content carousels, continue watching)
- [x] Task 6: Content detail page (`/content/:slug`), season & episode selectors
- [x] Task 7: Bunny Stream Player (`/watch/:slug`) with resume prompt & 10s auto-next countdown
- [x] Task 8: Search page (`/buscar`), Category pages (`/doramas`, `/filmes`, etc.), My List & History
- [x] Task 9: Plans page (`/planos`) & Subscription paywall modal
- [x] Task 10: Admin Dashboard & Content CRUD
- [x] Task 11: Admin Mass Importer (`/admin/import`) with JSON/CSV parsing & legacy matching
- [x] Task 12: Production build, TypeScript validation, and full end-to-end verification

## ✅ PHASE X COMPLETE
- Lint & Types: ✅ Pass (`npx tsc --noEmit` & `npm run build` exit code 0)
- Build: ✅ Success (dist/assets generated cleanly)
- Runtime & E2E: ✅ Verified in browser subagent (Home, Details, Player, Plans, Admin)
- Design Standard: ✅ High contrast cinematic obsidian, zero purple/violet (Purple Ban respected)
- Database: ✅ `supabase/schema.sql` with all 10 tables, RLS, triggers, and seed data

## Verification Criteria
INPUT: Clean workspace
OUTPUT: Working, production-ready DoramasPlay application with all features functional
VERIFY: TypeScript passes (`npx tsc --noEmit`), Vite build succeeds (`npm run build`), dev server runs smoothly.
