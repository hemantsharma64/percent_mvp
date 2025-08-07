# Daily Growth Tracker (1% App)

## Overview

A full-stack journaling and personal development application that helps users achieve continuous improvement through daily reflection and AI-powered task generation. Users write daily journal entries, set personal goals, and receive AI-generated tasks based on their journal content to facilitate 1% daily improvement.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, built using Vite for fast development and optimized builds
- **UI Library**: Shadcn/ui components built on top of Radix UI primitives for accessible, customizable components
- **Styling**: Tailwind CSS with CSS custom properties for theming support (light/dark modes)
- **State Management**: TanStack Query (React Query) for server state management with optimistic updates and caching
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation resolvers for type-safe form management

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with consistent error handling and response formatting
- **Authentication**: Replit's OIDC (OpenID Connect) integration with Passport.js strategy
- **Session Management**: Express sessions with PostgreSQL storage via connect-pg-simple
- **Middleware**: Request logging, JSON parsing, and CORS handling built into Express pipeline

### Data Storage
- **Database**: PostgreSQL with Neon serverless driver for connection pooling and edge compatibility
- **ORM**: Drizzle ORM with type-safe schema definitions and migrations
- **Schema Design**: 
  - Users table for authentication and profile data
  - Journals table for daily entries with content and metadata
  - Goals table for user objectives with progress tracking
  - Tasks table for AI-generated daily actions
  - Dashboard content table for daily quotes and focus areas
  - Sessions table for authentication state persistence

### Authentication & Authorization
- **Provider**: Replit's built-in OIDC authentication system
- **Flow**: Standard OpenID Connect authorization code flow with PKCE
- **Session Storage**: PostgreSQL-backed sessions with configurable TTL
- **Security**: HTTP-only cookies, CSRF protection, and secure session configuration
- **User Management**: Automatic user creation and profile updates from OIDC claims

### AI Integration
- **Service**: OpenRouter API integration for accessing multiple AI models
- **Primary Model**: GPT-3.5 Turbo for task generation and content analysis
- **Task Generation Logic**: 
  - Analyzes recent, medium, and older journal entries with weighted importance
  - Considers user goals and progress when generating personalized tasks
  - Creates daily quotes and focus areas for motivation
  - Schedules automatic task generation at midnight daily
- **Prompt Engineering**: Structured prompts that combine journal analysis with goal-oriented task creation

### Development & Deployment
- **Build System**: Vite for frontend bundling, esbuild for backend compilation
- **Development**: Hot module replacement with Vite dev server and tsx for backend watching
- **Environment**: Replit-optimized with environment variable configuration
- **Database Migrations**: Drizzle Kit for schema migrations and database management

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database with connection pooling
- **Authentication**: Replit OIDC service for user authentication and session management
- **AI Services**: OpenRouter API for accessing GPT models and task generation

### Key Libraries
- **Frontend**: React ecosystem (React Query, React Hook Form, Wouter)
- **UI Components**: Radix UI primitives with Shadcn/ui component library
- **Backend**: Express.js with Passport authentication and session management
- **Database**: Drizzle ORM with PostgreSQL driver and session storage
- **Validation**: Zod for runtime type validation and schema parsing
- **Styling**: Tailwind CSS with class-variance-authority for component variants
- **Development**: Vite build tooling with TypeScript support and hot reloading