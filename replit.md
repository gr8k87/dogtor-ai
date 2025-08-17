# Overview

Dogtor AI is a veterinary triage platform that provides AI-powered preliminary analysis of dog health concerns, specifically focusing on stool analysis. The system uses computer vision to analyze uploaded images and generates follow-up questions to help pet owners understand potential health issues. The platform emphasizes that it's "not a vet, just your first step" and serves as an informational tool before professional veterinary consultation.

The application is designed as a portable MVP with strict separation between frontend and backend components, supporting both local development and cloud deployment scenarios.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Technology Stack**: React with Vite build tool, Tailwind CSS for styling
- **PWA Support**: Progressive Web App with service worker for offline functionality, manifest.json for installability
- **Responsive Design**: Mobile-first approach using Tailwind CSS utilities
- **State Management**: Component-level state management without external libraries
- **Offline Capabilities**: Local storage for case data when offline, service worker for static resource caching

## Backend Architecture
- **Framework**: FastAPI (Python) providing REST API endpoints
- **Database Layer**: SQLAlchemy ORM with support for both SQLite (development) and PostgreSQL (production)
- **AI Integration**: Dual AI system using Gemini Vision for image analysis and OpenAI GPT-4o for triage recommendations
- **Image Processing**: PIL for image resizing and optimization before storage
- **CORS Configuration**: Configurable cross-origin support for frontend-backend communication

## Data Storage Strategy
- **Development**: SQLite database with local file system storage for images
- **Production**: Supabase PostgreSQL database with Supabase Storage for images and CDN delivery
- **Image Handling**: Automatic resizing for images larger than 5MB, support for standard image formats
- **Data Models**: JSON storage for flexible observation data and user responses

## Authentication & Security
- **Current State**: No authentication system implemented (MVP phase)
- **Image Validation**: File type and size validation on upload
- **Error Handling**: Structured error responses with standardized format
- **CORS Protection**: Configurable allowed origins for API access

## AI Processing Pipeline
- **Image Analysis**: Gemini Vision API analyzes stool images to extract observations (consistency, color, blood, etc.)
- **Question Generation**: Dynamic follow-up questions based on image analysis results
- **Triage Assessment**: OpenAI GPT-4o processes observations and user answers to provide triage summary
- **Fallback Handling**: Graceful degradation when AI services are unavailable with default question sets

# External Dependencies

## AI Services
- **Google Gemini Vision API**: Primary image analysis using Gemini 1.5 Pro for extracting medical observations from stool images
- **OpenAI GPT-4o**: Secondary AI for generating triage summaries and recommendations based on observations and user responses
- **Timeout Configuration**: 12-second timeout with single retry for both AI services

## Database & Storage
- **Supabase**: Production PostgreSQL database and file storage with CDN capabilities
- **SQLite**: Local development database
- **PIL (Pillow)**: Python image processing library for resizing and optimization

## Frontend Libraries
- **Tailwind CSS**: Utility-first CSS framework via CDN
- **Feather Icons**: Icon library for UI elements
- **Vite**: Build tool and development server for React application

## Infrastructure
- **Deployment Targets**: 
  - Backend: Google Cloud Run (containerized FastAPI)
  - Frontend: Vercel (static React build)
- **Environment Configuration**: Environment-based configuration using .env files
- **Docker Support**: Containerization for consistent deployment across environments

## HTTP Client Libraries
- **aiohttp**: Async HTTP client for AI service communication and image downloading
- **FastAPI Dependencies**: Built-in request handling and validation
- **Fetch API**: Frontend HTTP client for API communication