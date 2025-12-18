# Housing Market Data - Free API Alternatives

This document lists free alternatives for housing market data after removing NSI integration.

## Recommended Free APIs

### 1. Eurostat API (Recommended)

**URL**: https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/  
**Documentation**: https://ec.europa.eu/eurostat/web/main/data/database  
**Status**: ✅ Free, no API key required

**Available Data**:
- House Price Index (HPI) for Bulgaria
- Regional price statistics
- Historical data
- Quarterly and annual updates

**API Format**:
```
GET https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/PRC_HPI_Q
```

**Example Response**: JSON format with structured data

**Implementation Notes**:
- Well-documented REST API
- Includes Bulgaria (BG) data
- Regular updates
- JSON format easy to parse

---

### 2. OECD via Opendatasoft

**URL**: https://public.opendatasoft.com/explore/dataset/analytical-house-prices-indicators/  
**Status**: ✅ Free, no API key required

**Available Data**:
- Analytical house price indicators
- International comparisons
- Historical trends

**API Format**:
```
GET https://public.opendatasoft.com/api/records/1.0/search/?dataset=analytical-house-prices-indicators
```

**Implementation Notes**:
- RESTful API
- JSON responses
- Good for international comparisons
- May need filtering for Bulgaria-specific data

---

### 3. Bulgarian National Bank (BNB) API

**URL**: https://www.bnb.bg/Statistics/StExternalSector/StExchangeRates/index.htm  
**Status**: ⚠️ Check availability - may require registration

**Available Data**:
- Exchange rates (already implemented via Frankfurter)
- Interest rates (for mortgage rates)
- Financial statistics

**Implementation Notes**:
- May have API endpoints for interest rates
- Check official documentation
- Could be source for mortgage rate data

---

### 4. World Bank Open Data API

**URL**: https://data.worldbank.org/  
**API**: https://api.worldbank.org/v2/  
**Status**: ✅ Free, no API key required

**Available Data**:
- Housing price indices
- Economic indicators
- Country-specific data

**API Format**:
```
GET https://api.worldbank.org/v2/country/BGR/indicator/SP.POP.TOTL?format=json
```

**Implementation Notes**:
- Comprehensive economic data
- Includes Bulgaria
- XML and JSON formats
- May need to find specific housing indicators

---

### 5. FRED (Federal Reserve Economic Data) API

**URL**: https://fred.stlouisfed.org/  
**API**: https://fred.stlouisfed.org/docs/api/fred/  
**Status**: ✅ Free, API key required (free registration)

**Available Data**:
- Economic indicators
- Housing data
- International data

**Implementation Notes**:
- Requires free API key registration
- Well-documented
- May have Bulgaria-specific data
- Good for historical trends

---

## Implementation Priority

1. **Eurostat API** - Best option for Bulgaria-specific HPI data
2. **OECD Opendatasoft** - Good for international comparisons
3. **BNB API** - For mortgage rates if available
4. **World Bank API** - Comprehensive but may need data filtering
5. **FRED API** - Good backup option with free API key

## Quick Start: Eurostat Integration

### Step 1: Find the Dataset Code

Visit: https://ec.europa.eu/eurostat/web/main/data/database  
Search for "house price index" or "HPI"  
Note the dataset code (e.g., `PRC_HPI_Q`)

### Step 2: Test the API

```bash
curl "https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/PRC_HPI_Q?format=JSON&geo=BG"
```

### Step 3: Parse Response

Eurostat returns data in a specific format - you'll need to:
1. Extract the dataset structure
2. Find Bulgaria (BG) data
3. Get latest values
4. Calculate changes

### Step 4: Implement in Code

Add to `lib/housing-data.ts`:
```typescript
async function fetchEurostatData(): Promise<Partial<HousingMarketData> | null> {
  // Implementation here
}
```

## Notes

- All APIs listed are free (some require free registration)
- Eurostat is the most reliable for Bulgaria-specific data
- Consider caching responses (24 hours recommended)
- Implement graceful fallbacks if APIs fail
- Test API availability before full implementation
