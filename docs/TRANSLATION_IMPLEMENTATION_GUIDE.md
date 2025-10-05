# Next.js App Router Translation Implementation Guide

## Overview
This document outlines the established pattern for implementing translations in our Next.js App Router application using the `[lang]` dynamic route structure.

## Established Pattern

### 1. File Structure
```
app/[lang]/
├── page.tsx                    # Server component wrapper
├── localized-homepage.tsx      # Client component with UI
├── login/
│   ├── page.tsx               # Server component wrapper
│   └── login-client.tsx        # Client component with UI
├── developer/
│   ├── dashboard/
│   │   ├── page.tsx           # Server component wrapper
│   │   └── dashboard-client.tsx # Client component with UI
│   └── analytics/
│       ├── page.tsx           # Server component wrapper
│       └── analytics-client.tsx # Client component with UI
└── dictionaries.ts            # Dictionary loader
```

### 2. Server Component Pattern (`page.tsx`)
```typescript
import { getDictionary } from '@/app/[lang]/dictionaries'
import ComponentClient from './component-client'

interface ComponentPageProps {
  params: Promise<{
    lang: 'en' | 'bg'
  }>
}

export default async function ComponentPage({ params }: ComponentPageProps) {
  const { lang } = await params
  const dict = await getDictionary(lang)

  return <ComponentClient dict={dict} lang={lang} />
}
```

### 3. Client Component Pattern (`*-client.tsx`)
```typescript
"use client"

interface ComponentClientProps {
  dict: any
  lang: 'en' | 'bg'
}

export default function ComponentClient({ dict, lang }: ComponentClientProps) {
  // All UI logic, state, hooks go here
  // Use dict.namespace?.key || "Fallback Text" for translations
  
  return (
    <div>
      <h1>{dict.developer?.analytics?.title || "Analytics"}</h1>
      <p>{dict.developer?.analytics?.description || "Description"}</p>
    </div>
  )
}
```

## Implementation Steps

### Step 1: Edit Existing Page
1. Take the existing `page.tsx` file
2. Add `dict` and `lang` props to the component
3. Replace all hardcoded strings with translation keys:
   ```typescript
   // Before
   <h1>Analytics</h1>
   
   // After
   <h1>{dict.developer?.analytics?.title || "Analytics"}</h1>
   ```

### Step 2: Rename to Client Component
1. Rename `page.tsx` → `*-client.tsx`
2. Add `"use client"` directive at the top
3. Update component name to `*Client`

### Step 3: Create New Server Component
1. Create new `page.tsx` with server component pattern
2. Import and render the client component
3. Pass `dict` and `lang` props

## Translation Dictionary Structure

### English (`dictionaries/en.json`)
```json
{
  "developer": {
    "analytics": {
      "title": "Analytics",
      "description": "Detailed insights into your property performance",
      "totalViews": "Total Views",
      "websiteClicks": "Website Clicks",
      "phoneClicks": "Phone Clicks",
      "refresh": "Refresh",
      "export": "Export",
      "performanceTrends": "Performance Trends"
    }
  }
}
```

### Bulgarian (`dictionaries/bg.json`)
```json
{
  "developer": {
    "analytics": {
      "title": "Аналитика",
      "description": "Подробни данни за производителността на вашите имоти",
      "totalViews": "Общо Прегледи",
      "websiteClicks": "Кликове на Уебсайт",
      "phoneClicks": "Кликове на Телефон",
      "refresh": "Обнови",
      "export": "Експорт",
      "performanceTrends": "Тенденции в Производителността"
    }
  }
}
```

## Best Practices

### 1. Translation Key Naming
- Use descriptive, hierarchical keys: `developer.analytics.totalViews`
- Keep keys consistent across languages
- Use camelCase for multi-word keys

### 2. Fallback Strategy
- Always provide English fallback: `dict.developer?.analytics?.title || "Analytics"`
- Use optional chaining (`?.`) to prevent errors
- Fallbacks should be the same as English dictionary values

### 3. Component Organization
- Server components: Data fetching, dictionary loading
- Client components: UI logic, state management, user interactions
- Keep server components minimal (just wrapper + data fetching)

### 4. Error Handling
- Use optional chaining for nested dictionary access
- Provide meaningful fallbacks
- Test with missing translation keys

## Common Patterns

### Dynamic Content
```typescript
// For dynamic content that needs translation
const statusText = dict.developer?.properties?.status?.[property.status] || property.status
```

### Pluralization
```typescript
// For plural forms
const countText = count === 1 
  ? dict.developer?.analytics?.singleView || "1 view"
  : dict.developer?.analytics?.multipleViews || `${count} views`
```

### Date/Time Formatting
```typescript
// Use locale-aware formatting
const formattedDate = new Intl.DateTimeFormat(lang === 'bg' ? 'bg-BG' : 'en-US').format(date)
```

## Migration Checklist

When converting an existing page to use translations:

- [ ] Edit existing `page.tsx` to add translations
- [ ] Replace all hardcoded strings with `dict.namespace?.key || "Fallback"`
- [ ] Add `dict` and `lang` props to component
- [ ] Rename file to `*-client.tsx`
- [ ] Add `"use client"` directive
- [ ] Create new `page.tsx` with server component pattern
- [ ] Add translation keys to `en.json` and `bg.json`
- [ ] Test both English and Bulgarian versions
- [ ] Verify fallbacks work when keys are missing

## Examples

### Before (Hardcoded)
```typescript
export default function AnalyticsPage() {
  return (
    <div>
      <h1>Analytics</h1>
      <p>Detailed insights into your property performance</p>
      <button>Refresh</button>
    </div>
  )
}
```

### After (Translated)
```typescript
// page.tsx (Server Component)
import { getDictionary } from '@/app/[lang]/dictionaries'
import AnalyticsClient from './analytics-client'

export default async function AnalyticsPage({ params }) {
  const { lang } = await params
  const dict = await getDictionary(lang)
  return <AnalyticsClient dict={dict} lang={lang} />
}

// analytics-client.tsx (Client Component)
"use client"

export default function AnalyticsClient({ dict, lang }) {
  return (
    <div>
      <h1>{dict.developer?.analytics?.title || "Analytics"}</h1>
      <p>{dict.developer?.analytics?.description || "Detailed insights into your property performance"}</p>
      <button>{dict.developer?.analytics?.refresh || "Refresh"}</button>
    </div>
  )
}
```

This pattern ensures consistency, maintainability, and follows Next.js App Router best practices for internationalization.
