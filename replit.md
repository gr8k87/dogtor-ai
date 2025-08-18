# Dogtor AI - Pet Health Assessment Application

## Overview

Dogtor AI is a mobile-first pet health assessment application that helps pet owners evaluate their pets' symptoms and connect with veterinary services. The application provides preliminary health assessments while emphasizing it's "not a vet, just your first step" in pet healthcare. Built as a full-stack monorepo with Express.js backend and React frontend, it features a clean, intuitive interface designed for mobile use.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **UI Framework**: Tailwind CSS with shadcn/ui component library for consistent design
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Mobile-First Design**: Bottom tab navigation with three main sections (Diagnose, History, Connect)

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured endpoints for pets, assessments, and vet clinics
- **Request Logging**: Custom middleware for API request/response logging
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

### Data Storage Solutions
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Database**: PostgreSQL (configured via Neon serverless)
- **Schema Management**: Shared schema definitions between client and server
- **Development Storage**: In-memory storage implementation for development/testing
- **Migration**: Drizzle Kit for database migrations

### Authentication and Authorization
- **Session Management**: Express sessions with PostgreSQL session store (connect-pg-simple)
- **Current Implementation**: Basic session-based authentication foundation
- **User Management**: User schema defined but not fully implemented in current codebase

### Application Structure
- **Monorepo Layout**: Organized into `/client`, `/server`, and `/shared` directories
- **Shared Types**: Common TypeScript types and schemas in `/shared` for type safety
- **Build Process**: Vite builds client to `/dist/public`, esbuild bundles server to `/dist`
- **Development Mode**: Vite dev server with HMR integration

### Key Features
- **Pet Management**: Create and manage pet profiles with breed, age, and weight information
- **Health Assessments**: Symptom input and preliminary health status evaluation
- **Vet Clinic Directory**: Location-based veterinary clinic listings with contact information
- **Assessment History**: Timeline of previous health assessments and recommendations
- **Emergency Services**: Quick access to emergency veterinary contacts

## External Dependencies

### Core Framework Dependencies
- **@neondatabase/serverless**: Serverless PostgreSQL connection for Neon database
- **drizzle-orm**: TypeScript ORM for database operations
- **express**: Web application framework for Node.js
- **@tanstack/react-query**: Data fetching and caching library
- **wouter**: Lightweight React router

### UI and Styling
- **@radix-ui/react-***: Comprehensive set of accessible UI primitives
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library for consistent iconography
- **class-variance-authority**: Utility for creating variant-based component APIs

### Development and Build Tools
- **vite**: Frontend build tool with fast HMR
- **esbuild**: Fast JavaScript bundler for server-side code
- **drizzle-kit**: Database migration and introspection tool
- **tsx**: TypeScript execution environment for development

### Form and Validation
- **react-hook-form**: Form handling with TypeScript support
- **@hookform/resolvers**: Validation resolvers for react-hook-form
- **zod**: TypeScript-first schema validation
- **drizzle-zod**: Integration between Drizzle ORM and Zod validation

### Additional Libraries
- **date-fns**: Date utility library for formatting and manipulation
- **nanoid**: Unique ID generator for database records
- **embla-carousel-react**: Carousel component for UI interactions