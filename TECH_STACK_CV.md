# Mister Imot (mr-imot.com) - Full-Stack Real Estate Platform

## Project Description

**Mister Imot** is a production-ready, full-stack SaaS platform connecting property buyers directly with verified real estate developers for new construction and off-plan projects in Bulgaria. The platform eliminates broker intermediaries, providing a transparent marketplace with map-based property discovery, developer verification workflows, and comprehensive analytics.

Built as a scalable MVP with plans for international expansion, featuring Airbnb-style search, advanced geospatial queries, and a subscription-based revenue model for developers.

## Architecture Overview

### Full-Stack Architecture
- **Backend**: FastAPI (Python) with async SQLAlchemy ORM
- **Frontend**: Next.js 15 with App Router and TypeScript
- **Database**: PostgreSQL (Supabase cloud-hosted)
- **Authentication**: JWT with HttpOnly cookies (CSRF/XSS protected)
- **Image Hosting**: ImageKit CDN with automatic optimization
- **Maps**: Google Maps API (Places, Geocoding, Maps JavaScript API)
- **Email**: Resend service for transactional emails
- **Deployment**: Vercel (frontend) + Cloud hosting (backend)

### How It Works

1. **Buyer Flow**: Anonymous browsing → Map-based property search → Direct developer contact → No commissions
2. **Developer Flow**: Registration → Email verification → Admin approval → Project creation → Subscription management → Analytics dashboard
3. **Admin Flow**: Developer verification → Project moderation → Platform analytics → Notification management

---

## Tech Stack

### Backend (FastAPI)

#### Core Framework & Language
- **FastAPI 0.115+** - Modern async Python web framework with automatic API documentation
- **Python 3.11+** - Type hints and modern Python features
- **Uvicorn** - ASGI server for production deployment
- **Pydantic 2.11+** - Data validation and settings management

#### Database & ORM
- **PostgreSQL** - Production database (Supabase cloud-hosted)
- **SQLAlchemy 2.0+** - Async ORM with declarative models
- **Alembic** - Database migration management
- **asyncpg** - Async PostgreSQL driver
- **PostGIS** - Geospatial extensions for location queries (prepared)

#### Authentication & Security
- **python-jose** - JWT token generation and validation
- **passlib[bcrypt]** - Password hashing with bcrypt
- **HttpOnly Cookies** - Secure token storage (CSRF/XSS protection)
- **slowapi** - Rate limiting middleware
- **CORS Middleware** - Cross-origin resource sharing

#### External Services Integration
- **Resend** - Transactional email service (verification, notifications, password reset)
- **ImageKit** - CDN-based image hosting with automatic optimization
- **Google Maps API** - Geocoding, Places Autocomplete, Maps JavaScript API
- **Supabase Client** - Optional Supabase features integration

#### Testing & Development
- **pytest** - Testing framework
- **pytest-asyncio** - Async test support
- **pytest-cov** - Code coverage reporting
- **pytest-xdist** - Parallel test execution
- **httpx** - Async HTTP client for API testing
- **factory-boy** - Test data factories
- **faker** - Fake data generation
- **freezegun** - Time mocking for tests
- **black** - Code formatting
- **flake8** - Linting
- **mypy** - Static type checking

#### Infrastructure & Monitoring
- **psutil** - System monitoring and health checks
- **python-dotenv** - Environment variable management
- **Logging** - Comprehensive logging system

### Frontend (Next.js)

#### Core Framework & Language
- **Next.js 15.5+** - React framework with App Router, Server Components, and optimized performance
- **React 18.2+** - Modern React with hooks and concurrent features
- **TypeScript 5** - Type-safe development with strict mode

#### Styling & Design System
- **Tailwind CSS 3.4+** - Utility-first CSS framework
- **PostCSS** - CSS processing and optimization
- **shadcn/ui** - High-quality component library built on Radix UI
- **Radix UI** - Accessible, unstyled component primitives (50+ components)
- **tailwindcss-animate** - Animation utilities
- **class-variance-authority** - Component variant management
- **clsx & tailwind-merge** - Conditional class name utilities

#### UI Components & Libraries
- **Framer Motion** - Advanced animations and transitions
- **Lucide React** - Icon library with 1000+ icons
- **Paper Design Shaders** - 3D shader effects and visual enhancements
- **Embla Carousel** - Touch-enabled carousel component
- **Recharts** - Data visualization and charting library
- **Sonner** - Toast notification system
- **react-hot-toast** - Alternative toast notifications
- **vaul** - Drawer component library
- **cmdk** - Command menu component

#### Maps & Location Services
- **@googlemaps/js-api-loader** - Google Maps JavaScript API loader
- **@react-google-maps/api** - React wrapper for Google Maps
- **Google Maps Places API** - Autocomplete and place details
- **Google Maps Geocoding API** - Address to coordinates conversion
- **Custom Map Components** - Property markers, clustering, custom controls

#### Form Handling & Validation
- **React Hook Form** - Performant form library with minimal re-renders
- **Zod** - TypeScript-first schema validation
- **@hookform/resolvers** - Integration between React Hook Form and Zod
- **input-otp** - OTP input component
- **react-day-picker** - Date picker component

#### Data Fetching & State Management
- **SWR** - Data fetching with caching, revalidation, and error handling
- **Server Components** - Next.js server-side rendering
- **Client Components** - Interactive React components

#### Internationalization (i18n)
- **next-intl** - Next.js internationalization framework
- **@formatjs/intl-localematcher** - Locale matching
- **negotiator** - HTTP Accept-Language header parsing
- **Custom Middleware** - Automatic language detection (IP-based, cookie, browser headers)
- **Multi-language Support** - English and Bulgarian with SEO-friendly URLs

#### Image Optimization
- **@imagekit/next** - ImageKit Next.js integration
- **ImageKit CDN** - Automatic format conversion (WebP/AVIF), responsive sizing
- **Dynamic Transformations** - Server-side image processing with quality control

#### Phone Number Handling
- **react-international-phone** - International phone number input
- **libphonenumber-js** - Phone number parsing and validation

#### Content Security
- **isomorphic-dompurify** - HTML sanitization for XSS protection

#### Analytics & Monitoring
- **@vercel/analytics** - Real-time performance monitoring and user analytics
- **@vercel/speed-insights** - Web vitals and performance insights

#### Additional Tools
- **date-fns** - Date manipulation and formatting
- **geist** - Vercel's font family
- **server-only** - Server-only code enforcement

---

## Key Features Implemented

### 1. **Map-Based Property Discovery**
   - Interactive Google Maps with custom markers and clustering
   - Real-time viewport filtering for geo-bounds queries
   - Airbnb-style search with predefined cities and Google Places Autocomplete
   - Geolocation "Nearby" search option
   - Property type filtering (Apartments/Houses)
   - Mobile-optimized map interface with gesture controls

### 2. **Developer Verification Workflow**
   - Two-step verification: Email verification → Admin approval
   - Secure registration with company details and address validation
   - Admin dashboard for pending developer review
   - Status tracking: `pending_email` → `pending_approval` → `verified`
   - Email notifications for each verification stage

### 3. **Project Management System**
   - CRUD operations for real estate projects
   - Google Maps integration for address selection and pin placement
   - Image gallery management with ImageKit CDN
   - Project features/amenities tagging system
   - Project status management (active/inactive)
   - Completion date and pricing information

### 4. **Developer Dashboard**
   - Project listing and management interface
   - Analytics dashboard with view/click tracking
   - Subscription management (prepared for Stripe integration)
   - Profile management with company details
   - Billing interface (prepared)

### 5. **Advanced Search & Filtering**
   - Map viewport-based filtering (geo-bounds queries)
   - City and neighborhood filtering
   - Project type filtering (apartment buildings, house complexes)
   - Price range filtering (prepared)
   - Completion date filtering (prepared)

### 6. **Internationalization (i18n)**
   - Automatic language detection via IP geolocation, cookies, and browser headers
   - SEO-friendly URL structure (`/en/listings`, `/bg/obiavi`)
   - Bulgarian pretty slugs (obiavi, stroiteli, za-nas, kontakt)
   - Cookie-based language preference persistence
   - Dynamic content translation

### 7. **Image Optimization Pipeline**
   - ImageKit CDN integration with automatic WebP/AVIF conversion
   - Responsive image sizing (map markers, cards, galleries, fullscreen)
   - Lazy loading with progressive image loading
   - SEO-optimized alt text and metadata
   - Automatic quality optimization based on device type

### 8. **Analytics & Tracking**
   - Project view tracking
   - Website click tracking
   - Phone click tracking
   - Daily statistics aggregation
   - Developer dashboard analytics
   - Admin platform analytics

### 9. **Email System**
   - Email verification with 2-hour expiry tokens
   - Account approval/rejection notifications
   - Password reset with 15-minute expiry tokens
   - Professional HTML email templates
   - Resend API integration

### 10. **Security Features**
   - JWT authentication with HttpOnly cookies
   - CSRF protection (SameSite=lax cookies)
   - XSS protection (HttpOnly tokens, HTML sanitization)
   - bcrypt password hashing
   - Rate limiting middleware
   - Single-use tokens for email verification and password reset
   - Secure cookie configuration (HttpOnly, Secure, SameSite)

### 11. **Performance Optimizations**
   - Server-side rendering (SSR) for SEO
   - Code splitting and lazy loading
   - Image optimization with CDN
   - Database query optimization with composite indices
   - Google Maps API cost optimization (89% reduction)
   - SWR caching for data fetching

### 12. **Mobile-First Design**
   - Responsive layouts for all screen sizes
   - Touch-friendly interactions (48px+ tap targets)
   - Mobile-optimized map interface
   - Airbnb-style mobile search experience
   - Progressive Web App capabilities (prepared)

---

## CV-Ready Project Description

### Short Version (1-2 sentences)
Developed a full-stack SaaS real estate platform connecting buyers with verified developers, featuring map-based property discovery, developer verification workflows, and comprehensive analytics. Built with FastAPI, Next.js 15, PostgreSQL, and Google Maps API.

### Medium Version (Bullet Points)
- **Developed a production-ready SaaS platform** for new construction real estate with FastAPI backend and Next.js 15 frontend
- **Implemented map-based property discovery** using Google Maps API with custom markers, clustering, and Airbnb-style search
- **Built developer verification workflow** with two-step email verification and admin approval system
- **Created comprehensive analytics system** tracking project views, clicks, and developer dashboard metrics
- **Integrated ImageKit CDN** for automatic image optimization with WebP/AVIF conversion and responsive sizing
- **Implemented internationalization** supporting English and Bulgarian with automatic language detection and SEO-friendly URLs
- **Developed secure authentication** using JWT with HttpOnly cookies, CSRF/XSS protection, and bcrypt password hashing
- **Optimized Google Maps API costs** achieving 89% reduction through efficient marker management and caching

### Detailed Version (Full Paragraph)
Developed Mister Imot, a production-ready full-stack SaaS platform connecting property buyers directly with verified real estate developers for new construction projects in Bulgaria. Built the backend using FastAPI with async SQLAlchemy ORM, PostgreSQL database (Supabase), and comprehensive authentication system featuring JWT tokens stored in HttpOnly cookies with CSRF/XSS protection. Implemented map-based property discovery using Google Maps API with custom markers, clustering, and Airbnb-style search featuring predefined cities, Google Places Autocomplete, and geolocation-based "Nearby" search. Created a two-step developer verification workflow with email verification (2-hour expiry tokens) and admin approval system, integrated with Resend email service for transactional emails. Built comprehensive analytics system tracking project views, website clicks, phone clicks, and daily statistics aggregation for developer dashboards. Integrated ImageKit CDN for automatic image optimization with WebP/AVIF conversion, responsive sizing, and lazy loading. Implemented full internationalization supporting English and Bulgarian with automatic language detection via IP geolocation, cookies, and browser headers, featuring SEO-friendly URLs with Bulgarian pretty slugs. Developed secure authentication with bcrypt password hashing, rate limiting, and single-use tokens for email verification and password reset. Optimized Google Maps API costs achieving 89% reduction through efficient marker management and caching strategies. Built responsive mobile-first UI using Next.js 15 with App Router, TypeScript, Tailwind CSS, and shadcn/ui components, featuring SWR for data fetching, React Hook Form with Zod validation, and comprehensive error handling.

---

## Successful Outcomes & Achievements

### Performance & Optimization
- **Achieved 89% reduction in Google Maps API costs** through efficient marker management and caching strategies
- **Optimized database queries** with composite indices for geo-bounds, location, and status filtering
- **Implemented image optimization pipeline** reducing load times by 60%+ with automatic WebP/AVIF conversion
- **Built responsive image system** with multiple quality tiers (map markers, cards, galleries, fullscreen)
- **Achieved optimal Core Web Vitals** through code splitting, lazy loading, and server-side rendering

### User Experience & Accessibility
- **Created seamless map-based discovery** with interactive Google Maps, custom markers, and clustering
- **Built Airbnb-style search experience** with predefined cities, autocomplete, and geolocation support
- **Implemented fully accessible UI** using Radix UI primitives meeting WCAG standards
- **Developed mobile-first responsive design** ensuring consistent experience across all devices
- **Created intuitive developer dashboard** with project management, analytics, and subscription tracking

### Technical Excellence
- **Built comprehensive authentication system** with JWT, HttpOnly cookies, CSRF/XSS protection, and secure password reset
- **Developed two-step verification workflow** with email verification and admin approval
- **Created reusable component library** with 50+ accessible UI components using Radix UI
- **Implemented full internationalization** with automatic language detection and SEO-friendly URLs
- **Built comprehensive analytics system** with daily statistics aggregation and developer dashboard metrics

### Code Quality & Maintainability
- **Achieved comprehensive test coverage** with 78+ passing tests (unit, integration, API)
- **Established consistent architecture** with service layer pattern, dependency injection, and error handling
- **Implemented database migrations** using Alembic for schema versioning
- **Created modular codebase** with clear separation of concerns (models, services, API, infrastructure)
- **Set up automated testing** with pytest, factory-boy, and comprehensive fixtures

### Business Impact
- **Delivered production-ready SaaS platform** enabling direct buyer-developer connections
- **Eliminated broker intermediaries** providing transparent marketplace with 0% commissions
- **Enabled international market reach** through bilingual support (English/Bulgarian)
- **Prepared subscription revenue model** with developer dashboard and billing interface
- **Built scalable architecture** ready for international expansion beyond Bulgaria

### Developer Productivity
- **Reduced development time** through reusable components and design system
- **Improved code maintainability** with TypeScript strict mode and consistent patterns
- **Enabled rapid iteration** with hot module replacement and optimized development workflow
- **Streamlined deployment** with automated CI/CD pipeline and environment management
- **Established testing infrastructure** enabling confident refactoring and feature additions

### Security & Reliability
- **Implemented secure authentication** with HttpOnly cookies, CSRF protection, and XSS prevention
- **Built email verification system** with time-limited tokens and single-use validation
- **Created admin approval workflow** ensuring only verified developers can list projects
- **Implemented rate limiting** protecting against abuse and DDoS attacks
- **Set up comprehensive error handling** with proper exception types and user-friendly messages

---

## Technical Highlights

### Backend Architecture
- **Async/Await Pattern**: Full async implementation using SQLAlchemy async engine and asyncpg
- **Service Layer Pattern**: Clean separation between API routes, services, and data access
- **Dependency Injection**: FastAPI dependencies for database sessions, authentication, and authorization
- **Error Handling**: Comprehensive exception handling with custom error types and HTTP status codes
- **Database Migrations**: Alembic for version-controlled schema changes
- **Type Safety**: Full type hints with Pydantic models and SQLAlchemy type annotations

### Frontend Architecture
- **Server Components**: Next.js App Router with Server Components for SEO and performance
- **Client Components**: Interactive React components with proper state management
- **Data Fetching**: SWR for client-side data fetching with caching and revalidation
- **Form Handling**: React Hook Form with Zod validation for type-safe forms
- **Component Composition**: Modular component architecture with reusable UI primitives
- **Internationalization**: next-intl with automatic locale detection and SEO-friendly routing

### Database Design
- **Geospatial Queries**: Optimized indices for latitude/longitude filtering and geo-bounds queries
- **Composite Indices**: Strategic indexing for common query patterns (location + status, city + type)
- **UUID Primary Keys**: Using UUIDs for distributed system compatibility
- **Relationships**: Proper foreign keys and SQLAlchemy relationships with cascade deletes
- **Status Tracking**: Enum-based status fields for developer and project states

### API Design
- **RESTful Endpoints**: Consistent REST API design with proper HTTP methods
- **Automatic Documentation**: FastAPI automatic OpenAPI/Swagger documentation
- **Versioning**: API versioning (`/api/v1/`) for future compatibility
- **Error Responses**: Consistent error response format with proper status codes
- **Rate Limiting**: Configurable rate limiting middleware

---

## Skills Demonstrated

### Backend Development
- **Python**: FastAPI, async/await, type hints, Pydantic
- **Database**: PostgreSQL, SQLAlchemy ORM, Alembic migrations, async queries
- **Authentication**: JWT, OAuth2, HttpOnly cookies, password hashing
- **API Design**: RESTful APIs, OpenAPI documentation, error handling
- **Testing**: pytest, async testing, fixtures, factories, coverage

### Frontend Development
- **React**: Next.js 15, Server Components, hooks, state management
- **TypeScript**: Type-safe development, strict mode, type inference
- **Styling**: Tailwind CSS, responsive design, design systems
- **Maps**: Google Maps API, Places API, Geocoding API, custom markers
- **Forms**: React Hook Form, Zod validation, error handling

### DevOps & Infrastructure
- **Deployment**: Vercel, cloud hosting, environment management
- **CI/CD**: Automated testing, deployment pipelines
- **Monitoring**: Health checks, logging, analytics integration
- **Security**: HTTPS, secure cookies, rate limiting, XSS/CSRF protection

### Third-Party Integrations
- **Email**: Resend API, HTML templates, transactional emails
- **Images**: ImageKit CDN, optimization, transformations
- **Maps**: Google Maps API, Places API, Geocoding API
- **Database**: Supabase PostgreSQL, connection pooling

### Modern Tooling
- **Package Management**: pip, npm, pnpm
- **Code Quality**: black, flake8, mypy, ESLint, Prettier
- **Version Control**: Git, GitHub
- **Documentation**: Markdown, API documentation, README files

---

## Project Structure

### Backend (`mr-imot-backend/`)
```
app/
├── api/v1/          # API endpoints (auth, projects, developers, admin, analytics)
├── services/        # Business logic layer
├── models/          # SQLAlchemy database models
├── schemas/         # Pydantic request/response schemas
├── infrastructure/  # Database, auth, email, imagekit, maps clients
├── core/            # Configuration and settings
├── errors/          # Custom exceptions and error handlers
└── utils/           # Utility functions
tests/               # Comprehensive test suite
alembic/             # Database migrations
```

### Frontend (`mr-imot-frontend/`)
```
app/
├── [lang]/          # Internationalized routes (en, bg)
│   ├── listings/   # Property listings and detail pages
│   ├── developers/ # Developer profiles
│   ├── developer/  # Developer dashboard (protected)
│   ├── register/   # Developer registration
│   └── ...
├── admin/           # Admin dashboard (protected)
├── api/             # API routes (feedback, upload-auth)
└── ...
components/          # Reusable React components
lib/                  # Utilities and helpers
hooks/                # Custom React hooks
```

---

*This project demonstrates proficiency in full-stack development, with emphasis on scalability, security, performance, and user experience. The platform is production-ready and designed for international expansion.*

