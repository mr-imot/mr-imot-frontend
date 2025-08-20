# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **Mr imot**, a Next.js 15 real estate development directory platform that connects buyers directly with real estate developers. The platform eliminates broker intermediaries and provides a comprehensive solution for property development listings and management.

## Development Commands

### Core Commands
- `npm run dev` - Start development server
- `npm run build` - Build production application
- `npm run start` - Start production server
- `npm run lint` - Run ESLint linting

### Authentication & API
The application uses JWT-based authentication with tokens stored in localStorage. API calls are proxied through Next.js rewrites to `https://api.mrimot.com/api/v1/*` in production.

## Architecture Overview

### App Structure (Next.js App Router)
- **Multi-Role Architecture**: Supports developers, buyers, and admin users with role-specific dashboards
- **Route-based Organization**: 
  - `/app/developer/*` - Developer dashboard and property management
  - `/app/admin/*` - Admin dashboard with system monitoring
  - `/app/buyer/*` - Buyer interface
  - Public pages for listings, registration, login

### Key Technical Stack
- **Frontend**: Next.js 15 with App Router, React 18, TypeScript
- **UI Framework**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system (ds-* classes)
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Context (AuthProvider, UnifiedAuthProvider)
- **API Client**: Custom ApiClient class with retry logic and error handling
- **Maps**: Google Maps integration for property locations
- **Theme**: Dark/light mode support with next-themes

### Authentication Flow
- **Dual Auth Providers**: `AuthProvider` for developer auth, `UnifiedAuthProvider` for unified auth
- **Role Validation**: Developer login validates `user_type: 'developer'`
- **Token Management**: JWT tokens with expiration tracking and automatic renewal
- **Protected Routes**: Route protection via auth context and protected route components

### API Integration
- **Base URL**: Development uses Next.js rewrites, production uses direct API calls
- **Retry Logic**: Network-aware retry with exponential backoff via `network-utils.ts`
- **Error Handling**: Comprehensive error handling with fallback mechanisms
- **Type Safety**: Full TypeScript interfaces for all API responses

### Component Architecture
- **UI Components**: Reusable shadcn/ui components in `/components/ui/`
- **Feature Components**: Domain-specific components organized by feature
- **Admin Components**: Comprehensive admin dashboard components in `/components/admin/`
- **Design System**: Custom design system components in `/components/ds/`

### Styling System
- **Custom Design System**: `ds-*` prefixed classes for colors, typography, spacing
- **Theme Variables**: CSS custom properties for light/dark theme support
- **Responsive Design**: Mobile-first approach with custom breakpoints
- **Component Styling**: Tailwind utility classes with design system tokens

## Development Guidelines

### File Organization
- Components are organized by feature/domain in the `/components` directory
- API-related code lives in `/lib` with dedicated files for different concerns
- Hooks are centralized in `/hooks` directory
- Type definitions are co-located with their respective modules

### Authentication Patterns
- Always use the appropriate auth context for the user type
- Validate user roles before rendering role-specific UI
- Handle token expiration gracefully with automatic logout
- Use protected route components for authenticated pages

### API Patterns
- Use the centralized `ApiClient` for all API calls
- Implement proper error handling with user-friendly messages
- Utilize retry logic for network-sensitive operations
- Type all API responses with TypeScript interfaces

### State Management
- Use React Context for global state (auth, theme)
- Local component state for UI-specific state
- Custom hooks for reusable stateful logic
- No external state management library required

### Form Handling
- Use React Hook Form with Zod schemas for validation
- Implement proper error display and loading states
- Use shadcn/ui form components for consistent UI
- Handle API errors and display appropriate feedback

### UI Development
- Follow shadcn/ui patterns for component structure
- Use the custom design system classes (ds-*) for consistent styling
- Implement proper loading states and error boundaries
- Ensure responsive design across all breakpoints

## Key Features

### Developer Dashboard
- Property creation and management with image uploads
- Google Places autocomplete for addresses
- Status filtering (All/Active/Draft/Paused)
- Analytics and statistics tracking

### Admin Dashboard
- Comprehensive system health monitoring
- Developer verification and management
- Activity logs and audit trails
- Email notification system
- Real-time metrics and performance monitoring

### Property Management
- Full CRUD operations for properties
- Image gallery management with upload/delete
- Location-based search with map integration
- Advanced filtering and sorting capabilities

## Configuration

### Environment Variables
- `NEXT_PUBLIC_API_URL` - API base URL (optional, defaults to proxy in dev)
- Google Maps API key for location features
- Various API endpoint configurations

### Next.js Configuration
- API rewrites proxy `/api/v1/*` to backend
- TypeScript and ESLint errors are ignored during builds (configured for rapid development)
- Image optimization is disabled for flexibility

### Tailwind Configuration
- Custom design system colors and utilities
- Extended spacing, typography, and animation scales
- Dark mode support with class strategy
- Custom animations for enhanced UX

## Maintenance & Monitoring

### Health Monitoring
The admin dashboard includes comprehensive system health monitoring with:
- Real-time database connectivity status
- Memory usage tracking with alert thresholds
- API response time monitoring
- Service status indicators
- Automatic alerting for critical issues

### Security Features
- JWT-based authentication with secure token storage
- Role-based access control
- Audit logging for admin actions
- Session timeout warnings
- Input validation and sanitization

### Performance Considerations
- Optimized API calls with caching and retry logic
- Lazy loading for images and components
- Responsive design for mobile performance
- Network-aware error handling and fallbacks