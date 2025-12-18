# Christmas Snowfall Effect

This folder contains the Christmas snowfall effect component for the website.

## Features

- **Optimized for white backgrounds**: Snowflakes are designed to be visible on white/light backgrounds with:
  - Subtle blue tint for better contrast
  - Shadow effects for depth
  - Larger size range (5-14px)
  - Higher opacity (60-100%)
- **Performance optimized**: Uses canvas rendering with requestAnimationFrame
- **Customizable**: Adjustable count, size, speed, and opacity
- **Non-intrusive**: Doesn't interfere with user interactions (pointer-events: none)

## How to Remove

To remove the Christmas effect after the holidays:

1. **Remove the import** from `app/[lang]/layout.tsx`:
   ```tsx
   // Remove this line:
   import { Snowfall } from "@/components/christmas"
   ```

2. **Remove the component** from both return statements in `app/[lang]/layout.tsx`:
   ```tsx
   // Remove these lines:
   <Snowfall 
     count={150}
     minSize={5}
     maxSize={14}
     minSpeed={0.5}
     maxSpeed={2.5}
     enabled={true}
   />
   ```

3. **Delete this folder**: `components/christmas/`

That's it! The Christmas effect will be completely removed.

## Customization

You can adjust the snowfall effect by modifying the props in `app/[lang]/layout.tsx`:

- `count`: Number of snowflakes (default: 150)
- `minSize` / `maxSize`: Size range in pixels (default: 5-14)
- `minSpeed` / `maxSpeed`: Fall speed range (default: 0.5-2.5)
- `enabled`: Toggle on/off (default: true)

## Technical Details

- Uses HTML5 Canvas for efficient rendering
- Automatically handles window resize
- Snowflakes have realistic physics (drift, rotation, swaying)
- Responsive to all screen sizes
- Z-index: 9999 (appears above most content but below modals)
