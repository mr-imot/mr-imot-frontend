# Brand Colors Usage Examples

Here are practical examples of how to use the Mr. Imot brand colors in your components.

## 1. Using TypeScript Imports

```tsx
import { brandColors, brandCombinations } from '@/lib/brand-colors'

// Hero Section Example
export function CustomHero() {
  return (
    <section style={{ backgroundColor: brandColors.glass.primary }}>
      <h1 style={{ color: brandColors.text.primary }}>
        Your Real Estate Dreams
      </h1>
      <p style={{ color: brandColors.text.secondary }}>
        Direct from developers
      </p>
      
      <div style={{
        backgroundColor: brandColors.badges.default.background,
        color: brandColors.badges.default.text,
        border: `1px solid ${brandColors.badges.default.border}`,
        padding: '8px 16px',
        borderRadius: '9999px'
      }}>
        New Feature
      </div>
    </section>
  )
}
```

## 2. Using CSS Custom Properties

```tsx
// Recommended approach for Tailwind compatibility
export function StyledCard() {
  return (
    <div className="p-6 rounded-lg" style={{ 
      backgroundColor: 'var(--brand-glass-light)',
      borderColor: 'var(--brand-gray-200)' 
    }}>
      <h3 style={{ color: 'var(--brand-text-primary)' }}>
        Property Title
      </h3>
      <p style={{ color: 'var(--brand-text-secondary)' }}>
        Property description
      </p>
      
      <button style={{
        backgroundColor: 'var(--brand-btn-primary-bg)',
        color: 'var(--brand-btn-primary-text)',
        padding: '12px 32px',
        borderRadius: '9999px',
        border: 'none',
        fontWeight: '600'
      }}>
        View Details
      </button>
    </div>
  )
}
```

## 3. Using the Brand Button Component

```tsx
import { BrandButton } from '@/components/ui/brand-button'

export function ActionSection() {
  return (
    <div className="flex gap-4">
      <BrandButton variant="primary" size="lg">
        List Your Property
      </BrandButton>
      
      <BrandButton variant="secondary" size="lg">
        Browse Properties
      </BrandButton>
      
      <BrandButton variant="login" size="sm">
        Login
      </BrandButton>
    </div>
  )
}
```

## 4. Navigation Menu Example

```tsx
import { brandColors } from '@/lib/brand-colors'

export function BrandNavigation() {
  return (
    <nav className="flex items-center space-x-4">
      {['Listings', 'Developers', 'About'].map((item) => (
        <a
          key={item}
          href={`/${item.toLowerCase()}`}
          className="px-4 py-2 rounded-full transition-all duration-200"
          style={{
            color: brandColors.navigation.text,
            ':hover': {
              color: brandColors.navigation.textHover,
              backgroundColor: brandColors.navigation.backgroundHover
            }
          }}
        >
          {item}
        </a>
      ))}
    </nav>
  )
}
```

## 5. Status Badges

```tsx
import { brandColors } from '@/lib/brand-colors'

export function StatusBadge({ status, children }: { 
  status: 'success' | 'warning' | 'error' | 'info'
  children: React.ReactNode 
}) {
  const statusColors = {
    success: brandColors.status.success,
    warning: brandColors.status.warning,
    error: brandColors.status.error,
    info: brandColors.status.info
  }

  return (
    <span
      className="px-3 py-1 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: statusColors[status] }}
    >
      {children}
    </span>
  )
}

// Usage
<StatusBadge status="success">Available</StatusBadge>
<StatusBadge status="warning">Limited</StatusBadge>
<StatusBadge status="error">Sold Out</StatusBadge>
```

## 6. Form Inputs with Brand Colors

```tsx
export function BrandInput({ label, ...props }: { 
  label: string 
  [key: string]: any 
}) {
  return (
    <div className="space-y-2">
      <label style={{ color: 'var(--brand-text-primary)' }} className="font-medium">
        {label}
      </label>
      <input
        className="w-full px-4 py-3 rounded-lg transition-colors focus:outline-none focus:ring-2"
        style={{
          backgroundColor: 'var(--brand-glass-lighter)',
          borderColor: 'var(--brand-gray-200)',
          color: 'var(--brand-text-primary)',
          focusRingColor: 'var(--brand-gray-500)'
        }}
        {...props}
      />
    </div>
  )
}
```

## 7. Card Component with Brand Styling

```tsx
export function PropertyCard({ property }: { property: any }) {
  return (
    <div 
      className="p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
      style={{ 
        backgroundColor: 'var(--brand-glass-light)',
        border: '1px solid var(--brand-gray-200)'
      }}
    >
      <h3 style={{ color: 'var(--brand-text-primary)' }} className="text-xl font-semibold mb-2">
        {property.title}
      </h3>
      
      <p style={{ color: 'var(--brand-text-secondary)' }} className="mb-4">
        {property.description}
      </p>
      
      <div className="flex justify-between items-center">
        <span 
          style={{ color: 'var(--brand-text-primary)' }} 
          className="text-2xl font-bold"
        >
          ${property.price}
        </span>
        
        <BrandButton variant="secondary" size="sm">
          View Details
        </BrandButton>
      </div>
    </div>
  )
}
```

## 8. Responsive Background Colors

```tsx
export function ResponsiveSection() {
  return (
    <section 
      className="py-16 px-4"
      style={{
        background: `linear-gradient(135deg, 
          var(--brand-glass-lighter) 0%, 
          var(--brand-glass-light) 50%, 
          var(--brand-glass-primary) 100%
        )`
      }}
    >
      <div className="max-w-4xl mx-auto text-center">
        <h2 style={{ color: 'var(--brand-text-primary)' }} className="text-4xl font-bold mb-4">
          Why Choose Mr. Imot?
        </h2>
        <p style={{ color: 'var(--brand-text-secondary)' }} className="text-lg">
          Connect directly with developers, no middlemen
        </p>
      </div>
    </section>
  )
}
```

## Tips for Implementation

1. **Prefer CSS Custom Properties**: Use `var(--brand-*)` for better performance and easier theming
2. **Use TypeScript imports**: For dynamic color selection and better IDE support
3. **Maintain consistency**: Always use the brand colors instead of arbitrary values
4. **Test accessibility**: Ensure sufficient contrast ratios for all text
5. **Document usage**: When creating new components, document which brand colors are used

## Migration from Hardcoded Colors

Replace existing hardcoded colors with brand colors:

```tsx
// Before
<button className="bg-gray-900 text-white hover:bg-gray-800">

// After  
<button style={{
  backgroundColor: 'var(--brand-btn-primary-bg)',
  color: 'var(--brand-btn-primary-text)'
}} className="hover:bg-[var(--brand-btn-primary-bg-hover)]">

// Or better yet
<BrandButton variant="primary">
```

This ensures consistency with the hero section and navigation styling across your entire application.
