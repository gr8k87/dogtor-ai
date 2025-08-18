# Dogtor AI - Minimal Scaffold

## Overview

Dogtor AI is a minimal veterinary application scaffold with the tagline "Not a vet, just your first step." Built as a monorepo with Express.js backend serving a React frontend through a single port.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Monorepo Structure
- `/server` - Express.js backend with static file serving
- `/client` - React frontend with Vite build system  
- Single exposed port (5000) for both backend API and frontend serving

### Backend Architecture
- **Runtime**: Node.js with Express.js server (ESM modules)
- **File**: `/server/app.js` - Main server file
- **Package**: `/server/package.json` - Contains only Express dependency
- **Endpoints**: 
  - `/health` - Returns `{ "ok": true }`
  - `/*` - Serves React build from `/server/static`
- **Port**: Listens on `process.env.PORT` (defaults to 3000, configured as 5000)

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as build tool
- **Styling**: Tailwind CSS for styling
- **Build Output**: `/server/static` (served by Express)
- **PWA**: vite-plugin-pwa with autoUpdate service worker
- **Structure**: 
  - Splash screen (`/client/src/Splash.tsx`) - shows on first visit
  - Main App component with three placeholder tabs (Diagnose, History, Connect)
  - Offline badge component for network status
  - localStorage persistence for "hasStarted" state

### Build Process
- **Client Build**: `cd client && npx vite build` → outputs to `/server/static`
- **Server Start**: `cd server && node app.js`
- **Workflow**: Uses existing `npm run dev` which runs `tsx server/index.ts` → imports `app.js`

### Key Features (Minimal)
- Header displaying "Dogtor AI"
- Three-tab bottom navigation (Diagnose, History, Connect)
- Responsive tab switching with active state styling
- Health check endpoint for monitoring
- PWA support with service worker for offline functionality
- Splash screen with localStorage persistence
- Offline indicator badge

## Current State

The project has been reset to a minimal scaffold with:
- ✓ Express server serving React build from single port
- ✓ Basic three-tab React interface with placeholder content
- ✓ Tailwind CSS styling setup
- ✓ Working health endpoint
- ✓ Proper monorepo structure
- ✓ PWA support with manifest and service worker
- ✓ Splash screen with localStorage persistence
- ✓ Offline detection and indicator badge

## Next Steps

Ready for feature development:
- Database schema and storage
- Authentication system
- Diagnostic assessment logic
- Veterinary clinic integration
- Pet health history tracking

## Recent Changes

**Date: 2025-01-18**
- Reset complex application to minimal scaffold
- Removed database schemas, authentication, and complex UI components
- Created simple Express server in `/server/app.js`
- Built minimal React app with three placeholder tabs
- Configured Vite to build into `/server/static`
- Added PWA support with vite-plugin-pwa
- Created splash screen with "Get started" flow
- Added offline detection badge
- Configured PWA manifest with 192px and 512px icons
- Verified single-port deployment working correctly