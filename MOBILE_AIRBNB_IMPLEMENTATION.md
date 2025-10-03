# Mobile Airbnb-Style Implementation

## ✅ Completed
1. ✅ `LocationSearch` component created with Google Places Autocomplete
2. ✅ `DraggableSheet` component created for bottom sheet UI
3. ✅ Mobile map initialization updated to be always-on with bounds-based fetching
4. ✅ `filteredProperties` updated to use `mobileBounds` for mobile filtering
5. ✅ Removed old mobile toggle logic (isMobileMapView)

## 🚧 Remaining Mobile UI Changes

### 1. Remove Mobile Filter Buttons Section
**Location**: Lines ~1019-1095 (Glass Morphism Mobile Filters)
**Action**: DELETE - City buttons and property type filters at top
**Reason**: Search bar will replace city buttons

### 2. Replace Mobile View with New Airbnb UI
**Location**: Lines ~1028-1154
**Replace With**:

```tsx
{/* Mobile: Map-first with draggable bottom sheet (Airbnb) */}
<div className="xl:hidden fixed inset-0 z-10">
  {/* Full screen map */}
  <div ref={mobileMapRef} className="w-full h-full" />
  
  {/* Top overlay bar with search + filters */}
  <div className="absolute top-4 left-4 right-4 z-40 space-y-3">
    {/* Search bar */}
    <LocationSearch
      placeholder="Search Sofia, Plovdiv, Varna..."
      onPlaceSelected={(place) => {
        if (place.geometry?.location && mobileGoogleMapRef.current) {
          mobileGoogleMapRef.current.panTo(place.geometry.location)
          mobileGoogleMapRef.current.setZoom(13)
        }
      }}
    />
    
    {/* Property type filter */}
    <div className="flex gap-2">
      <button
        onClick={() => setPropertyTypeFilter('all')}
        className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all ${
          propertyTypeFilter === 'all'
            ? 'bg-white text-gray-900 shadow-lg'
            : 'bg-white/80 text-gray-700'
        }`}
      >
        {dict.listings.filters.all}
      </button>
      <button
        onClick={() => setPropertyTypeFilter('apartments')}
        className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
          propertyTypeFilter === 'apartments'
            ? 'bg-white text-gray-900 shadow-lg'
            : 'bg-white/80 text-gray-700'
        }`}
      >
        <Building className="w-4 h-4" />
        <span className="hidden sm:inline">{dict.listings.filters.apartments}</span>
      </button>
      <button
        onClick={() => setPropertyTypeFilter('houses')}
        className={`flex-1 py-2 px-4 rounded-full text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
          propertyTypeFilter === 'houses'
            ? 'bg-white text-gray-900 shadow-lg'
            : 'bg-white/80 text-gray-700'
        }`}
      >
        <Home className="w-4 h-4" />
        <span className="hidden sm:inline">{dict.listings.filters.houses}</span>
      </button>
    </div>
  </div>
  
  {/* Draggable bottom sheet with listings */}
  <DraggableSheet 
    snapPoints={[30, 70, 95]}
    initialSnap={0}
    onSnapChange={setMobileSheetSnap}
  >
    <div className="px-4 py-2">
      {/* Sheet header */}
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          {filteredProperties.length} {dict.listings.propertiesFound.replace('{{count}}', '')}
        </h2>
        <p className="text-sm text-gray-600">
          {propertyTypeFilter === 'all' ? dict.listings.allProperties : 
           propertyTypeFilter === 'apartments' ? dict.listings.filters.apartments : dict.listings.filters.houses}
        </p>
      </div>
      
      {/* Listings grid */}
      {shouldShowLoading ? (
        <ListingCardSkeletonGrid count={6} />
      ) : showEmpty ? (
        <div className="py-12 text-center">
          <Building className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {dict.listings.noPropertiesAvailable}
          </h3>
          <p className="text-gray-600 text-sm">
            {dict.listings.tryDifferentLocation}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 pb-20">
          {filteredProperties.map((property, index) => (
            <ListingCard
              key={property.id}
              listing={propertyToListing(property)}
              isActive={selectedPropertyId === property.id}
              onCardClick={() => {
                setSelectedPropertyId(property.id)
                setMobileSheetSnap(2) // Expand sheet to show property card
              }}
              onCardHover={() => {}}
              priority={index < 4}
            />
          ))}
        </div>
      )}
    </div>
  </DraggableSheet>
  
  {/* Selected property card (when marker tapped) */}
  {selectedProperty && (
    <div className="absolute bottom-0 left-0 right-0 h-[50vh] z-50">
      <PropertyMapCard
        property={transformToPropertyMapData(selectedProperty)}
        onClose={() => setSelectedPropertyId(null)}
        position={{ bottom: 0, left: 0, right: 0 }}
        floating={true}
        forceMobile={true}
      />
    </div>
  )}
</div>
```

### 3. Remove Old Mobile Map Button
**Location**: Lines ~1351-1397 (Sticky Map Button/Pagination)
**Action**: DELETE - No longer needed (map is always visible)

### 4. Remove Mobile City Fetch Function
**Location**: Lines ~221-278 (`fetchMobileCityData`)
**Action**: DELETE - Mobile now uses same bounds-based fetch as desktop

### 5. Remove Mobile City Fetch useEffect
**Location**: Lines ~283-289
**Action**: DELETE - No longer calling `fetchMobileCityData`

## 📱 How New Mobile Flow Works

1. **App opens** → Mobile map initializes at Sofia (or user's geolocation)
2. **Map idle** → Fetches properties in viewport bounds
3. **Bottom sheet shows** → Displays filtered properties (30% height)
4. **User searches** → Google Places → Map pans → New bounds fetch
5. **User pans/zooms** → Map idle → New bounds fetch → Sheet updates
6. **User drags sheet** → Expands to 70% or 95%
7. **User taps marker** → Property card slides up (50vh overlay)
8. **User taps listing** → Property card slides up + sheet expands

## 🎯 Benefits

- ✅ Consistent with desktop (bounds-based)
- ✅ No sync issues between map and list
- ✅ Discoverable (can explore any area)
- ✅ Search replaces city buttons
- ✅ Industry standard UX (Airbnb, Booking.com)
- ✅ Visual feedback for all actions
- ✅ Scalable to any number of cities

## ⚠️ Breaking Changes

- ❌ City buttons removed on mobile
- ❌ Toggle between map/list removed
- ✅ Search bar added (Google Places API)
- ✅ Always-on map with bottom sheet
- ✅ Bounds-based filtering only


