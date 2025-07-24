import { DSButton } from "./ds-button"
import { DSCard, DSCardContent, DSCardDescription, DSCardHeader, DSCardTitle } from "./ds-card"
import { DSInput } from "./ds-input"
import { DSLabel } from "./ds-label"
import { DSTypography } from "./ds-typography"

export function DesignSystemShowcase() {
  return (
    <div className="min-h-screen bg-ds-neutral-50 p-ds-4">
      <div className="max-w-6xl mx-auto space-y-ds-8">
        {/* Header */}
        <div className="text-center space-y-ds-3">
          <DSTypography as="h1" variant="2xl" weight="bold" color="neutral-900">
            Real Estate Design System
          </DSTypography>
          <DSTypography variant="lg" color="neutral-600">
            Modern, consistent, and accessible components for real estate platforms
          </DSTypography>
        </div>

        {/* Color Palette */}
        <DSCard elevation="md" padding="lg">
          <DSCardHeader>
            <DSCardTitle>Color Palette</DSCardTitle>
            <DSCardDescription>Primary deep blue, accent emerald, and neutral grays</DSCardDescription>
          </DSCardHeader>
          <DSCardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-ds-4">
              {/* Primary Colors */}
              <div>
                <DSTypography variant="base" weight="semibold" className="mb-ds-2">
                  Primary Blue
                </DSTypography>
                <div className="space-y-ds-1">
                  <div className="flex items-center space-x-ds-2">
                    <div className="w-8 h-8 rounded-ds bg-ds-primary-600 border border-ds-neutral-200"></div>
                    <DSTypography variant="sm" color="neutral-700">
                      #1e40af
                    </DSTypography>
                  </div>
                </div>
              </div>

              {/* Accent Colors */}
              <div>
                <DSTypography variant="base" weight="semibold" className="mb-ds-2">
                  Accent Emerald
                </DSTypography>
                <div className="space-y-ds-1">
                  <div className="flex items-center space-x-ds-2">
                    <div className="w-8 h-8 rounded-ds bg-ds-accent-500 border border-ds-neutral-200"></div>
                    <DSTypography variant="sm" color="neutral-700">
                      #10b981
                    </DSTypography>
                  </div>
                </div>
              </div>

              {/* Neutral Colors */}
              <div>
                <DSTypography variant="base" weight="semibold" className="mb-ds-2">
                  Neutral Grays
                </DSTypography>
                <div className="space-y-ds-1">
                  <div className="flex items-center space-x-ds-2">
                    <div className="w-8 h-8 rounded-ds bg-ds-neutral-50 border border-ds-neutral-200"></div>
                    <DSTypography variant="sm" color="neutral-700">
                      #f8fafc
                    </DSTypography>
                  </div>
                  <div className="flex items-center space-x-ds-2">
                    <div className="w-8 h-8 rounded-ds bg-ds-neutral-500 border border-ds-neutral-200"></div>
                    <DSTypography variant="sm" color="neutral-700">
                      #64748b
                    </DSTypography>
                  </div>
                  <div className="flex items-center space-x-ds-2">
                    <div className="w-8 h-8 rounded-ds bg-ds-neutral-800 border border-ds-neutral-200"></div>
                    <DSTypography variant="sm" color="neutral-700">
                      #1e293b
                    </DSTypography>
                  </div>
                </div>
              </div>
            </div>
          </DSCardContent>
        </DSCard>

        {/* Typography Scale */}
        <DSCard elevation="md" padding="lg">
          <DSCardHeader>
            <DSCardTitle>Typography Scale</DSCardTitle>
            <DSCardDescription>Inter font family with 6-step scale (14px - 48px)</DSCardDescription>
          </DSCardHeader>
          <DSCardContent>
            <div className="space-y-ds-3">
              <DSTypography variant="2xl" weight="bold">
                Heading 2XL (48px)
              </DSTypography>
              <DSTypography variant="xl" weight="bold">
                Heading XL (32px)
              </DSTypography>
              <DSTypography variant="lg" weight="semibold">
                Heading LG (24px)
              </DSTypography>
              <DSTypography variant="base" weight="medium">
                Body Base (20px)
              </DSTypography>
              <DSTypography variant="sm">Body Small (16px)</DSTypography>
              <DSTypography variant="xs" color="neutral-600">
                Caption XS (14px)
              </DSTypography>
            </div>
          </DSCardContent>
        </DSCard>

        {/* Spacing System */}
        <DSCard elevation="md" padding="lg">
          <DSCardHeader>
            <DSCardTitle>Spacing System</DSCardTitle>
            <DSCardDescription>7-step spacing scale (8px - 96px)</DSCardDescription>
          </DSCardHeader>
          <DSCardContent>
            <div className="space-y-ds-2">
              <div className="flex items-center space-x-ds-3">
                <div className="w-ds-1 h-4 bg-ds-primary-600 rounded-ds"></div>
                <DSTypography variant="sm">ds-1 (8px)</DSTypography>
              </div>
              <div className="flex items-center space-x-ds-3">
                <div className="w-ds-2 h-4 bg-ds-primary-600 rounded-ds"></div>
                <DSTypography variant="sm">ds-2 (16px)</DSTypography>
              </div>
              <div className="flex items-center space-x-ds-3">
                <div className="w-ds-3 h-4 bg-ds-primary-600 rounded-ds"></div>
                <DSTypography variant="sm">ds-3 (24px)</DSTypography>
              </div>
              <div className="flex items-center space-x-ds-3">
                <div className="w-ds-4 h-4 bg-ds-primary-600 rounded-ds"></div>
                <DSTypography variant="sm">ds-4 (32px)</DSTypography>
              </div>
              <div className="flex items-center space-x-ds-3">
                <div className="w-ds-6 h-4 bg-ds-primary-600 rounded-ds"></div>
                <DSTypography variant="sm">ds-6 (48px)</DSTypography>
              </div>
              <div className="flex items-center space-x-ds-3">
                <div className="w-ds-8 h-4 bg-ds-primary-600 rounded-ds"></div>
                <DSTypography variant="sm">ds-8 (64px)</DSTypography>
              </div>
              <div className="flex items-center space-x-ds-3">
                <div className="w-ds-12 h-4 bg-ds-primary-600 rounded-ds"></div>
                <DSTypography variant="sm">ds-12 (96px)</DSTypography>
              </div>
            </div>
          </DSCardContent>
        </DSCard>

        {/* Buttons */}
        <DSCard elevation="md" padding="lg">
          <DSCardHeader>
            <DSCardTitle>Button Components</DSCardTitle>
            <DSCardDescription>Primary, secondary, and accent button variants with multiple sizes</DSCardDescription>
          </DSCardHeader>
          <DSCardContent>
            <div className="space-y-ds-4">
              {/* Button Variants */}
              <div>
                <DSTypography variant="base" weight="semibold" className="mb-ds-2">
                  Variants
                </DSTypography>
                <div className="flex flex-wrap gap-ds-2">
                  <DSButton variant="primary">Primary Button</DSButton>
                  <DSButton variant="secondary">Secondary Button</DSButton>
                  <DSButton variant="accent">Accent Button</DSButton>
                  <DSButton variant="outline">Outline Button</DSButton>
                  <DSButton variant="ghost">Ghost Button</DSButton>
                </div>
              </div>

              {/* Button Sizes */}
              <div>
                <DSTypography variant="base" weight="semibold" className="mb-ds-2">
                  Sizes
                </DSTypography>
                <div className="flex flex-wrap items-center gap-ds-2">
                  <DSButton size="sm">Small</DSButton>
                  <DSButton size="default">Default</DSButton>
                  <DSButton size="lg">Large</DSButton>
                  <DSButton size="xl">Extra Large</DSButton>
                </div>
              </div>
            </div>
          </DSCardContent>
        </DSCard>

        {/* Cards */}
        <DSCard elevation="md" padding="lg">
          <DSCardHeader>
            <DSCardTitle>Card Components</DSCardTitle>
            <DSCardDescription>Elevated cards with consistent shadows and 8px border radius</DSCardDescription>
          </DSCardHeader>
          <DSCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-ds-4">
              <DSCard elevation="sm" padding="default">
                <DSCardHeader>
                  <DSCardTitle>Small Elevation</DSCardTitle>
                  <DSCardDescription>Subtle shadow for minimal elevation</DSCardDescription>
                </DSCardHeader>
                <DSCardContent>
                  <DSTypography variant="sm" color="neutral-600">
                    Perfect for list items and secondary content.
                  </DSTypography>
                </DSCardContent>
              </DSCard>

              <DSCard elevation="md" padding="default">
                <DSCardHeader>
                  <DSCardTitle>Medium Elevation</DSCardTitle>
                  <DSCardDescription>Moderate shadow for primary content</DSCardDescription>
                </DSCardHeader>
                <DSCardContent>
                  <DSTypography variant="sm" color="neutral-600">
                    Ideal for main content cards and feature highlights.
                  </DSTypography>
                </DSCardContent>
              </DSCard>

              <DSCard elevation="lg" padding="default">
                <DSCardHeader>
                  <DSCardTitle>Large Elevation</DSCardTitle>
                  <DSCardDescription>Strong shadow for important content</DSCardDescription>
                </DSCardHeader>
                <DSCardContent>
                  <DSTypography variant="sm" color="neutral-600">
                    Great for modals, overlays, and key information.
                  </DSTypography>
                </DSCardContent>
              </DSCard>
            </div>
          </DSCardContent>
        </DSCard>

        {/* Form Elements */}
        <DSCard elevation="md" padding="lg">
          <DSCardHeader>
            <DSCardTitle>Form Elements</DSCardTitle>
            <DSCardDescription>Consistent form inputs with labels and validation states</DSCardDescription>
          </DSCardHeader>
          <DSCardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-ds-6">
              <div className="space-y-ds-3">
                <div>
                  <DSLabel variant="required">Property Name</DSLabel>
                  <DSInput placeholder="Enter property name" />
                </div>
                <div>
                  <DSLabel variant="default">Location</DSLabel>
                  <DSInput placeholder="Enter location" helperText="City, state, or address" />
                </div>
                <div>
                  <DSLabel variant="optional">Description</DSLabel>
                  <DSInput placeholder="Optional description" />
                </div>
              </div>
              <div className="space-y-ds-3">
                <div>
                  <DSLabel variant="required">Price</DSLabel>
                  <DSInput type="number" placeholder="0" helperText="Enter price in USD" />
                </div>
                <div>
                  <DSLabel variant="default">Email</DSLabel>
                  <DSInput
                    type="email"
                    placeholder="invalid-email"
                    error={true}
                    helperText="Please enter a valid email address"
                  />
                </div>
                <div className="pt-ds-2">
                  <DSButton variant="primary" size="lg" className="w-full">
                    Submit Property
                  </DSButton>
                </div>
              </div>
            </div>
          </DSCardContent>
        </DSCard>
      </div>
    </div>
  )
}
