# Overview

Altevia is a comprehensive SaaS platform designed to improve digital visibility for local businesses. The platform combines AI-powered SEO content generation with intelligent review management to help businesses enhance their online presence. It offers tools for generating local SEO content, managing customer reviews, competitor analysis, and business analytics - all integrated into a unified dashboard interface.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The application uses a modern React-based frontend with TypeScript, built on Vite for fast development and production builds. The UI is constructed using shadcn/ui components built on top of Radix UI primitives, providing accessible and customizable interface elements. The design system follows a dark-mode-first approach with comprehensive theming capabilities using CSS custom properties and Tailwind CSS for styling.

## Routing and Navigation
Client-side routing is handled by Wouter, a lightweight routing library. The application features a sidebar-based navigation system with dedicated routes for different modules including the dashboard, SEO generator, review manager, analytics, AI suggestions, billing, team management, and settings.

## State Management and Data Fetching
TanStack Query (React Query) manages server state, caching, and API interactions. The application uses a custom API request utility that handles authentication via cookies and provides centralized error handling for HTTP requests.

## Backend Architecture
The server is built with Express.js and uses a modular route structure. API endpoints are organized by functionality, with dedicated routes for SEO content generation, review response management, and competitor analysis. The backend integrates with OpenAI's GPT-5 model for AI-powered content generation.

## Database Layer
The application uses Drizzle ORM with PostgreSQL via Neon Database for data persistence. The database schema includes user management tables and is designed to be extended for additional business data storage needs. Database migrations are managed through Drizzle Kit.

## Development Environment
The project is configured for full-stack development with hot module replacement in development mode. Vite handles the frontend build process while the backend uses tsx for TypeScript execution in development. The application includes Replit-specific integrations for development banner display and cartographer debugging tools.

## Component Architecture
The UI follows a modular component structure with reusable components organized in a dedicated UI library. Each major feature (SEO Generation, Review Management, Analytics, etc.) is implemented as a self-contained component with its own state management and API interactions.

# External Dependencies

## AI Services
- **OpenAI API**: Powers the AI content generation capabilities for SEO content creation and automated review responses using GPT-5 model

## Database Services  
- **Neon Database**: PostgreSQL-compatible serverless database providing data persistence with WebSocket support for real-time capabilities

## UI and Styling
- **Radix UI**: Provides accessible, unstyled UI primitives for complex components like dialogs, dropdowns, and navigation
- **Tailwind CSS**: Utility-first CSS framework for responsive design and theming
- **shadcn/ui**: Pre-built component library built on Radix UI with consistent design patterns

## Development Tools
- **Vite**: Modern build tool providing fast development server and optimized production builds
- **TypeScript**: Type safety and enhanced developer experience across the full stack
- **Drizzle ORM**: Type-safe database ORM with PostgreSQL support and migration management

## Fonts and Assets
- **Google Fonts**: Inter font family for typography and JetBrains Mono for code/metrics display
- **Lucide React**: Icon library providing consistent iconography throughout the application