# Google Maps Style Configuration Guide

## Problem
When using `mapId` with Google Maps (required for `AdvancedMarkerElement`), the `styles` property in code is **completely ignored**. Styles must be configured in Google Cloud Console.

## Solution: Configure Styles in Google Cloud Console

### Step 1: Access Google Cloud Console
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Maps** > **Map Styles** or **Map Management**

### Step 2: Create/Edit Map Style
1. Click **"Create Map Style"** or edit existing style
2. Use the **Map Style Wizard** or **JSON Editor**

### Step 3: Apply Airbnb-Style Configuration

**Option A: Use the helper function (Recommended)**
1. In your browser console on the app, run:
   ```javascript
   import { getAirbnbStyleMapConfigJSON } from '@/lib/google-maps'
   console.log(getAirbnbStyleMapConfigJSON())
   ```
2. Copy the output JSON
3. Paste it into the JSON editor in Cloud Console

**Option B: Manual copy**
Copy the JSON configuration from `lib/google-maps.ts` function `getAirbnbStyleMapConfig()` and paste it into the JSON editor in Cloud Console.

The configuration includes:
- Hidden POI labels (points of interest)
- Hidden transit labels
- Muted, desaturated colors
- Lightened water bodies
- Softened road colors
- Lightened landscape features

### Step 4: Associate with Map ID
1. Associate the style with Map ID: **`DEMO_MAP_ID`**
2. **Publish** the style (not just save as draft)
3. Wait 2-4 hours for changes to propagate

### Step 5: Verify
After propagation, refresh your application and the styles should appear automatically.

## Alternative: Remove mapId (Not Recommended)
If you remove `mapId` from map initialization:
- ✅ Styles will work via code
- ❌ `AdvancedMarkerElement` will break
- ⚠️ You'll need to refactor to use regular `google.maps.Marker` instead

## Current Map ID
- **Map ID**: `DEMO_MAP_ID`
- **Location in code**: `app/[lang]/listings/localized-listings-page.tsx`
- **Used for**: Desktop and mobile map instances

## Reference
- [Google Maps Cloud-Based Styling](https://developers.google.com/maps/documentation/maps-static/cloud-customization)
- [Troubleshooting Map Styles](https://developers.google.com/maps/documentation/maps-static/cloud-customization/troubleshoot)

