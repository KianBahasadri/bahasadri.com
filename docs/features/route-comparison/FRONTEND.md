# Route Comparison - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the Route Comparison utility. The frontend provides a user interface for entering origin and destination, selecting APIs to query, and displaying side-by-side comparison of routes from different navigation services.

## Code Location

`frontend/src/pages/route-comparison/`

## API Contract Reference

See `docs/features/route-comparison/API_CONTRACT.yml` for the API contract this frontend consumes.

## Pages/Routes

### `/route-comparison`

**Component**: `RouteComparison.tsx`

**Description**: Main page for route comparison utility

**Route Configuration**:

```typescript
<Route path="/route-comparison" element={<RouteComparison />} />
```

## Components

### RouteComparison (Main Page)

**Location**: `RouteComparison.tsx`

**Purpose**: Main container component that handles route comparison workflow

**State**:

- Server state: Route comparison query (TanStack Query)
- Local state: Origin input, destination input, selected APIs, selected route for details

**Layout**:

- Header with title
- Input form (origin, destination, API selection)
- Comparison results display (side-by-side route cards)
- Route details modal/section (when a route is selected)

### RouteInputForm

**Location**: `components/RouteInputForm/RouteInputForm.tsx`

**Purpose**: Form for entering origin, destination, and selecting APIs

**Props**:

```typescript
interface RouteInputFormProps {
    onSubmit: (data: { origin: string; destination: string; apis?: string[] }) => void;
    isLoading: boolean;
}
```

**State**:

- Form state: origin, destination, selected APIs

**Interactions**:

- User enters origin and destination
- User selects which APIs to query (checkboxes, default: all)
- User submits form to trigger route comparison

**Styling**:

- CSS Modules: `RouteInputForm.module.css`
- Form layout with input fields and checkboxes
- Submit button with loading state

### RouteComparisonResults

**Location**: `components/RouteComparisonResults/RouteComparisonResults.tsx`

**Purpose**: Display side-by-side comparison of routes from different APIs

**Props**:

```typescript
interface RouteComparisonResultsProps {
    routes: RouteResult[];
    origin: string;
    destination: string;
    onRouteSelect: (route: RouteResult) => void;
}
```

**State**:

- Selected route for details view

**Interactions**:

- Display route cards in a grid or list
- Each card shows API name, distance, duration, and key metrics
- User clicks a route card to view detailed directions
- User can sort/filter routes by distance or duration

**Styling**:

- CSS Modules: `RouteComparisonResults.module.css`
- Grid or flex layout for route cards
- Highlight selected route
- Visual indicators for route metrics

### RouteCard

**Location**: `components/RouteCard/RouteCard.tsx`

**Purpose**: Individual route card displaying metrics from one API

**Props**:

```typescript
interface RouteCardProps {
    route: RouteResult;
    isSelected: boolean;
    onClick: () => void;
}
```

**State**:

- None (presentational component)

**Interactions**:

- Click to select and view details
- Display error state if API failed

**Styling**:

- CSS Modules: `RouteCard.module.css`
- Card design with metrics display
- Error state styling
- Selected state highlighting

### RouteDetails

**Location**: `components/RouteDetails/RouteDetails.tsx`

**Purpose**: Detailed view of a selected route with turn-by-turn directions

**Props**:

```typescript
interface RouteDetailsProps {
    route: RouteResult;
    origin: string;
    destination: string;
    onClose: () => void;
}
```

**State**:

- None (receives route data as props)

**Interactions**:

- Display full turn-by-turn directions list
- Show route visualization (if polyline available)
- Close button to return to comparison view

**Styling**:

- CSS Modules: `RouteDetails.module.css`
- Modal or expandable section
- Scrollable directions list
- Map visualization (if integrated)

## State Management

### Server State (TanStack Query)

```typescript
// Query keys
const queryKeys = {
    compareRoutes: (origin: string, destination: string, apis?: string[]) =>
        ["route-comparison", "compare", origin, destination, apis] as const,
};

// TanStack Query hook
const useCompareRoutes = (
    origin: string,
    destination: string,
    apis?: string[]
) => {
    return useQuery({
        queryKey: queryKeys.compareRoutes(origin, destination, apis),
        queryFn: () => compareRoutes({ origin, destination, apis }),
        enabled: false, // Only run when manually triggered
    });
};
```

### Local State (React)

```typescript
// Form inputs
const [origin, setOrigin] = useState<string>("");
const [destination, setDestination] = useState<string>("");
const [selectedApis, setSelectedApis] = useState<string[]>([]);

// Comparison results
const [selectedRoute, setSelectedRoute] = useState<RouteResult | null>(null);
const [showDetails, setShowDetails] = useState<boolean>(false);
```

## API Integration

### API Client Functions

**Location**: `lib/api.ts`

```typescript
// Compare routes from multiple APIs
export const compareRoutes = async (
    data: CompareRoutesRequest
): Promise<CompareRoutesResponse> => {
    const response = await fetch("/api/route-comparison/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to compare routes");
    }

    return response.json();
};
```

### Error Handling

- Display error messages for API failures
- Show individual API errors in route cards
- Handle network errors gracefully
- Show loading states during API calls

## User Interactions

### Primary Actions

- **Compare Routes**:
    - Trigger: User submits form with origin and destination
    - Flow: Validate inputs → Call API → Display results
    - Error handling: Show error message if request fails

- **View Route Details**:
    - Trigger: User clicks on a route card
    - Flow: Set selected route → Show details modal/section
    - Error handling: N/A (data already loaded)

- **Close Details**:
    - Trigger: User clicks close button or outside modal
    - Flow: Clear selected route → Return to comparison view

### Form Handling

- Validate that origin and destination are not empty
- Provide autocomplete suggestions for addresses (optional enhancement)
- Allow coordinate input in "lat,lng" format
- Default to all APIs selected if none specified

## UI/UX Requirements

### Layout

- Responsive design: Stack on mobile, side-by-side on desktop
- Clear visual hierarchy: Input form at top, results below
- Route cards arranged in a grid or list for easy comparison

### Visual Design

- Use consistent card design for route comparison
- Color-code routes by API (optional)
- Highlight best route (shortest distance or fastest time)
- Show loading skeletons while fetching routes
- Display error states clearly in route cards

### User Feedback

- Loading states: Show loading spinner/skeleton while fetching routes
- Error messages: Display errors prominently, with retry option
- Success feedback: Smooth transition to results display
- Empty states: Show message if no routes found
- Partial success: Show successful routes even if some APIs fail

## Implementation Checklist

### Components

- [ ] RouteComparison page component
- [ ] RouteInputForm component
- [ ] RouteComparisonResults component
- [ ] RouteCard component
- [ ] RouteDetails component
- [ ] CSS Modules for all components

### Pages

- [ ] Main page route configuration

### State Management

- [ ] TanStack Query setup
- [ ] API client functions
- [ ] Error handling
- [ ] Loading states

### Styling

- [ ] CSS Modules for components
- [ ] Responsive design
- [ ] Loading/error states
- [ ] Empty states
- [ ] Route card designs
- [ ] Details modal/section

### Integration

- [ ] Connect to backend API (per API_CONTRACT.yml)
- [ ] Handle errors gracefully
- [ ] Display route metrics correctly
- [ ] Show turn-by-turn directions
- [ ] Optional: Map visualization for routes

## Dependencies

### React Libraries

- `react-router-dom`: Routing
- `@tanstack/react-query`: Data fetching
- Standard React hooks

### Optional Dependencies

- Map library (e.g., `react-map-gl`, `@react-google-maps/api`) for route visualization
- Autocomplete library for address input suggestions

## Performance Considerations

- Debounce form inputs if implementing autocomplete
- Lazy load route details (only fetch when selected)
- Optimize re-renders with React.memo for route cards
- Virtualize long direction lists if needed

## Accessibility

- Semantic HTML: Use proper form elements and labels
- ARIA labels: Label inputs, buttons, and route cards
- Keyboard navigation: Support tab navigation and Enter to submit
- Screen reader support: Announce route comparison results, provide alt text for visualizations
- Focus management: Manage focus when opening/closing details modal

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.yml couples frontend and backend.

