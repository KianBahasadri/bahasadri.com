# Rideshare Price Comparison - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the Rideshare Price Comparison utility. The frontend provides a form for users to enter ride details and displays a comparison table of prices from multiple rideshare services.

## Code Location

`frontend/src/pages/rideshare-comparison/`

## API Contract Reference

See `docs/features/rideshare-comparison/API_CONTRACT.yml` for the API contract this frontend consumes.

## Pages/Routes

### `/rideshare-comparison`

**Component**: `RideshareComparison.tsx`

**Description**: Main page for rideshare price comparison tool

**Route Configuration**:

```typescript
<Route path="/rideshare-comparison" element={<RideshareComparison />} />
```

## Components

### RideshareComparison (Main Page)

**Location**: `RideshareComparison.tsx`

**Purpose**: Main page component that contains the ride input form and price comparison display

**State**:

-   Server state: TanStack Query for price comparison data
-   Local state: Form inputs (origin, destination, scheduledTime), loading state, error state

**Layout**:

-   Header with page title
-   Input form section (origin, destination, date/time picker)
-   Comparison results section (table or card layout)
-   Loading and error states

### RideInputForm

**Location**: `components/RideInputForm/RideInputForm.tsx`

**Purpose**: Form component for entering ride details

**Props**:

```typescript
interface RideInputFormProps {
    onSubmit: (data: ComparePricesRequest) => void;
    isLoading?: boolean;
}
```

**State**:

-   Form state for origin, destination, scheduledTime
-   Form validation state

**Interactions**:

-   User enters origin address
-   User enters destination address
-   User optionally selects date and time
-   User submits form to trigger price comparison

**Styling**:

-   CSS Modules: `RideInputForm.module.css`
-   Form layout with labeled inputs
-   Date/time picker styling

### PriceComparisonTable

**Location**: `components/PriceComparisonTable/PriceComparisonTable.tsx`

**Purpose**: Displays price comparison results in a table format

**Props**:

```typescript
interface PriceComparisonTableProps {
    data: ComparePricesResponse;
    isLoading?: boolean;
}
```

**State**:

-   None (presentational component)

**Interactions**:

-   Display prices in sortable table
-   Highlight cheapest options
-   Show vehicle type details

**Styling**:

-   CSS Modules: `PriceComparisonTable.module.css`
-   Responsive table design
-   Highlighting for best prices

## State Management

### Server State (TanStack Query)

```typescript
// Query keys
const queryKeys = {
    comparePrices: (request: ComparePricesRequest) =>
        ["rideshare-comparison", "compare", request] as const,
};

// TanStack Query mutation (POST request)
const useComparePrices = () => {
    return useMutation({
        mutationFn: (request: ComparePricesRequest) => comparePrices(request),
        onError: (error) => {
            // Handle error
        },
    });
};
```

### Local State (React)

```typescript
// Form state
const [origin, setOrigin] = useState<string>("");
const [destination, setDestination] = useState<string>("");
const [scheduledTime, setScheduledTime] = useState<string | undefined>(undefined);

// UI state
const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
```

## API Integration

### API Client Functions

**Location**: `lib/api.ts`

```typescript
// Compare prices
export const comparePrices = async (
    request: ComparePricesRequest
): Promise<ComparePricesResponse> => {
    const response = await fetch("/api/rideshare-comparison/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to compare prices");
    }

    return response.json();
};
```

### Error Handling

-   Display error messages from API responses
-   Handle network errors gracefully
-   Show user-friendly error messages for different error codes:
    -   `INVALID_INPUT`: "Please check your input and try again"
    -   `LOCATION_NOT_FOUND`: "Could not find the location. Please check the addresses."
    -   `SERVICE_UNAVAILABLE`: "Some rideshare services are currently unavailable. Please try again later."
    -   `INTERNAL_ERROR`: "An error occurred. Please try again."

## User Interactions

### Primary Actions

-   **Compare Prices**:
    -   Trigger: User clicks "Compare Prices" button after filling form
    -   Flow: Validate form → Call API → Display results
    -   Error handling: Show error message if request fails

-   **Clear Form**:
    -   Trigger: User clicks "Clear" or "Reset" button
    -   Flow: Reset all form fields to initial state

### Form Handling

-   Form validation:
    -   Origin and destination are required
    -   Scheduled time must be valid date-time if provided
    -   Show validation errors inline
-   Address autocomplete (optional enhancement):
    -   Use geocoding API for address suggestions
    -   Improve user experience with autocomplete dropdown

## UI/UX Requirements

### Layout

-   Centered form layout on desktop
-   Full-width form on mobile
-   Comparison table below form
-   Responsive design for mobile and desktop

### Visual Design

-   Clear form labels and input fields
-   Prominent "Compare Prices" button
-   Comparison table with:
    -   Service names as rows or columns
    -   Vehicle types and prices clearly displayed
    -   Visual highlighting for cheapest options
    -   Estimated times displayed
-   Loading spinner or skeleton while fetching
-   Empty state when no comparison has been made

### User Feedback

-   Loading states: Show spinner or skeleton loader while fetching prices
-   Error messages: Display error messages in a prominent location (e.g., alert banner)
-   Success feedback: Show comparison results immediately when loaded
-   Empty states: Show helpful message prompting user to enter ride details
-   Partial results: If some services fail, show available results with error indicators

## Implementation Checklist

### Components

-   [ ] RideshareComparison page component
-   [ ] RideInputForm component
-   [ ] PriceComparisonTable component
-   [ ] CSS Modules for all components

### Pages

-   [ ] Main page route configuration

### State Management

-   [ ] TanStack Query mutation setup
-   [ ] API client functions
-   [ ] Error handling
-   [ ] Loading states
-   [ ] Form state management

### Styling

-   [ ] CSS Modules for components
-   [ ] Responsive design
-   [ ] Loading/error states
-   [ ] Empty states
-   [ ] Table/card layout for price comparison

### Integration

-   [ ] Connect to backend API (per API_CONTRACT.yml)
-   [ ] Handle errors gracefully
-   [ ] Display partial results if some services fail

## Dependencies

### React Libraries

-   `react-router-dom`: Routing
-   `@tanstack/react-query`: Data fetching
-   Standard React hooks

### UI Libraries (Optional)

-   Date/time picker library (e.g., `react-datepicker`)
-   Address autocomplete library (optional enhancement)

## Performance Considerations

-   Debounce address input if implementing autocomplete
-   Cache comparison results in React Query
-   Optimize table rendering for large result sets
-   Lazy load components if needed

## Accessibility

-   Semantic HTML: Use proper form elements (`<form>`, `<input>`, `<label>`)
-   ARIA labels: Label all inputs and buttons
-   Keyboard navigation: Support tab navigation through form
-   Screen reader support: Announce loading states and errors
-   Table accessibility: Use proper table markup with headers for comparison table

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.yml couples frontend and backend.

