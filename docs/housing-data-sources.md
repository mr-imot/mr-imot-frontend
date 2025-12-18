# Housing Market Data Sources

This document describes the housing market data sources integrated into the news ticker banner.

## Overview

The news page banner (`/news`) now displays real-time housing market data from multiple sources. The system automatically falls back to static data if API sources are unavailable.

## Data Sources

Currently using static fallback data. See `HOUSING_DATA_ALTERNATIVES.md` for free API options.

## Implementation Details

### Files Modified

1. **`lib/housing-data.ts`**
   - Contains only formatting utilities: `formatPricePerSqm()`, `formatChange()`
   - No API integrations - all data is static/mock

2. **`components/news/ticker.tsx`**
   - Uses static mock data from `FALLBACK_TICKER_DATA`
   - Fetches real currency exchange rates from Frankfurter API
   - Supports all languages (bg, en, ru, gr)

3. **`app/[lang]/news/page.tsx`**
   - Fetches currency exchange rates server-side
   - Passes rates to `NewsTicker` component

### Data Flow

```
News Page (Server Component)
  ↓
getExchangeRates() (Frankfurter API)
  ↓
NewsTicker Component
  ↓
Static Mock Data + Real Currency Rates
  ↓
Display in Banner
```

### Data Sources

- **Housing Market Data**: Static mock data (Sofia, Plovdiv, Varna prices, mortgage rates)
- **Exchange Rates**: Real-time data from Frankfurter API (EUR/BGN, USD/BGN, GBP/BGN)
- If currency API fails, shows fallback EUR/BGN rate

## Displayed Data

The ticker banner shows:

1. **City Average Prices** (when available):
   - Sofia average price per sqm
   - Plovdiv average price per sqm
   - Varna average price per sqm
   - Price change percentage (with color coding)

2. **House Price Index** (when available):
   - Current index value
   - Change percentage

3. **Mortgage Rate** (when available):
   - Current mortgage interest rate
   - Change percentage (lower is better)

4. **Exchange Rates** (always shown):
   - EUR/BGN
   - USD/BGN
   - GBP/BGN

## Language Support

All data labels are translated:
- **Bulgarian (bg)**: София, Пловдив, Варна, Ипотечен лихва
- **English (en)**: Sofia, Plovdiv, Varna, Mortgage Rate
- **Russian (ru)**: София, Пловдив, Варна, Ипотечная ставка
- **Greek (gr)**: Σόφια, Πλόβντιβ, Βάρνα, Επιτόκιο υποθήκης

## Caching

- **Exchange Rates**: 1 hour (3600 seconds)

## Error Handling

- All API calls are wrapped in try-catch blocks
- Failed API calls return `null` and don't break the page
- System gracefully falls back to static data
- Errors are logged to console for debugging

## Future Enhancements

1. **Additional Metrics**:
   - Rental yields
   - Days on market
   - Inventory levels
   - Price per square meter trends

4. **Data Visualization**:
   - Add charts/graphs for historical trends
   - Compare multiple cities
   - Show seasonal patterns

## Testing

To test the implementation:

1. **Currency Rates**:
   - Currency rates are fetched from Frankfurter API (no API key required)
   - If API fails, fallback EUR/BGN rate is shown
   - Check browser console for any API errors

2. **Static Data**:
   - Housing market data is always static/mock
   - All languages supported (bg, en, ru, gr)

## Notes

- All housing market data is static/mock - no API integrations
- Only currency exchange rates are fetched from external API (Frankfurter)
- Frankfurter API is free and requires no authentication
