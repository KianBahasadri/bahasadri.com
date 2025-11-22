# Calculator - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the calculator utility. The frontend provides a button-based calculator interface that mimics a physical calculator, with power on/off functionality, number input, operator selection, and calculation execution. All calculations are performed by the backend API.

## Code Location

`frontend/src/pages/calculator/`

## API Contract Reference

See `docs/features/calculator/API_CONTRACT.md` for the API contract this frontend consumes.

## Pages/Routes

### `/calculator`

**Component**: `Calculator.tsx`

**Description**: Main page for calculator utility with button-based interface

**Route Configuration**:

```typescript
<Route path="/calculator" element={<Calculator />} />
```

## Components

### Calculator (Main Page)

**Location**: `Calculator.tsx`

**Purpose**: Main calculator component that manages calculator state and orchestrates button interactions

**State**:

-   Server state: TanStack Query mutation for calculation API calls
-   Local state:
    -   `isOn: boolean` - Calculator power state
    -   `display: string` - Current display value
    -   `currentInput: string` - Current number being entered
    -   `operator: string | null` - Selected operator (+, -, \*, /)
    -   `previousValue: number | null` - First operand for calculation
    -   `waitingForOperand: boolean` - Whether waiting for new number input

**Layout**:

-   Calculator container with display at top
-   Button grid below display
-   Power button (top-left or separate area)
-   Number buttons (0-9) and decimal point
-   Operator buttons (+, -, ×, ÷)
-   Equals button (=)
-   Clear button (C or AC)

### Display

**Location**: `components/Display/Display.tsx`

**Purpose**: Shows the current calculator display value

**Props**:

```typescript
interface DisplayProps {
    value: string;
    isOn: boolean;
}
```

**State**:

-   None (presentational component)

**Interactions**:

-   None (display only)

**Styling**:

-   CSS Modules: `Display.module.css`
-   Display should show "0" or blank when calculator is off
-   Right-aligned text for numbers
-   Monospace font for consistent digit width

### ButtonGrid

**Location**: `components/ButtonGrid/ButtonGrid.tsx`

**Purpose**: Container for calculator buttons in a grid layout

**Props**:

```typescript
interface ButtonGridProps {
    isOn: boolean;
    onNumberClick: (digit: string) => void;
    onOperatorClick: (operator: string) => void;
    onEqualsClick: () => void;
    onClearClick: () => void;
    onDecimalClick: () => void;
}
```

**State**:

-   None (presentational component)

**Interactions**:

-   Button clicks trigger parent callbacks

**Styling**:

-   CSS Modules: `ButtonGrid.module.css`
-   Grid layout (typically 4 columns)
-   Buttons disabled when calculator is off

### CalculatorButton

**Location**: `components/CalculatorButton/CalculatorButton.tsx`

**Purpose**: Individual calculator button component

**Props**:

```typescript
interface CalculatorButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    variant?: "number" | "operator" | "equals" | "clear" | "power";
    className?: string;
}
```

**State**:

-   None (presentational component)

**Interactions**:

-   Click handler triggers parent callback
-   Visual feedback on click (pressed state)

**Styling**:

-   CSS Modules: `CalculatorButton.module.css`
-   Different styles for number, operator, equals, clear, and power buttons
-   Hover and active states
-   Disabled state styling

## State Management

### Server State (TanStack Query)

```typescript
// Mutation for calculation
const calculateMutation = useMutation({
    mutationFn: calculateExpression,
    onSuccess: (data) => {
        // Update display with result
        setDisplay(data.result.toString());
        setPreviousValue(null);
        setOperator(null);
        setWaitingForOperand(true);
    },
    onError: (error) => {
        // Show error on display
        setDisplay("Error");
        // Reset calculator state
        setPreviousValue(null);
        setOperator(null);
        setWaitingForOperand(true);
    },
});
```

### Local State (React)

```typescript
// Calculator power state
const [isOn, setIsOn] = useState<boolean>(false);

// Display value
const [display, setDisplay] = useState<string>("0");

// Current input being entered
const [currentInput, setCurrentInput] = useState<string>("");

// Selected operator
const [operator, setOperator] = useState<string | null>(null);

// First operand for calculation
const [previousValue, setPreviousValue] = useState<number | null>(null);

// Whether waiting for new operand input
const [waitingForOperand, setWaitingForOperand] = useState<boolean>(false);
```

## API Integration

### API Client Functions

**Location**: `lib/api.ts`

```typescript
// Calculate expression
export const calculateExpression = async (
    expression: string
): Promise<CalculateResponse> => {
    const response = await fetch("/api/calculator/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Calculation failed");
    }

    return response.json();
};
```

### Error Handling

-   Use TanStack Query mutation error handling
-   Display error message on calculator display (e.g., "Error" or specific error message)
-   Handle specific error codes from API:
    -   `INVALID_INPUT`: Show "Invalid input" on display
    -   `DIVISION_BY_ZERO`: Show "Cannot divide by zero" on display
    -   `INTERNAL_ERROR`: Show "Error" on display
-   Reset calculator state after error (clear operator, previous value)
-   Allow user to continue after error (clear button or new input)

## User Interactions

### Primary Actions

-   **Power On/Off**:

    -   Trigger: Click power button
    -   Flow: Toggle `isOn` state, reset all calculator state, set display to "0" or blank
    -   Error handling: N/A

-   **Number Input**:

    -   Trigger: Click number button (0-9)
    -   Flow: Append digit to current input, update display. If waiting for operand, start new input.
    -   Error handling: N/A

-   **Operator Selection**:

    -   Trigger: Click operator button (+, -, ×, ÷)
    -   Flow: If previous calculation exists, calculate it first. Store current value as previousValue, set operator, set waitingForOperand to true.
    -   Error handling: N/A

-   **Calculate (Equals)**:

    -   Trigger: Click equals button (=)
    -   Flow: Build expression string from previousValue, operator, and currentInput. Call API mutation. Display result on success.
    -   Error handling: Show error on display, reset operator and previousValue

-   **Clear**:

    -   Trigger: Click clear button (C or AC)
    -   Flow: Reset current input, display, operator, and previousValue. Set display to "0".
    -   Error handling: N/A

-   **Decimal Point**:

    -   Trigger: Click decimal button (.)
    -   Flow: Append decimal point to current input if not already present. Update display.
    -   Error handling: Prevent multiple decimal points in same number

### Form Handling

-   No form elements - all input via button clicks
-   Input validation handled by backend API
-   Frontend prevents invalid states (e.g., multiple decimal points, operator without operand)

## UI/UX Requirements

### Layout

-   Calculator container centered on page or in appropriate layout
-   Display at top (full width of calculator)
-   Button grid below display (typically 4 columns)
-   Power button positioned separately (top-left or top-right)
-   Responsive design for mobile and desktop

### Visual Design

-   Calculator-like appearance (rectangular, button-based interface)
-   Display should look like a calculator screen (LCD-style or similar)
-   Buttons should have clear visual distinction:
    -   Number buttons: Standard style
    -   Operator buttons: Different color (e.g., orange/blue)
    -   Equals button: Prominent style (e.g., larger or different color)
    -   Clear button: Distinct style
    -   Power button: Distinct style (e.g., red/green)
-   Buttons should have hover and active states for feedback
-   Disabled state when calculator is off (grayed out buttons)

### User Feedback

-   Loading states: Show loading indicator or disable equals button while calculation is in progress
-   Error messages: Display error message on calculator display (e.g., "Error", "Cannot divide by zero")
-   Success feedback: Display result immediately on display after calculation
-   Empty states: Display "0" when calculator is on but no input entered
-   Button press feedback: Visual feedback when buttons are clicked (pressed state)

## Implementation Checklist

### Components

-   [ ] Calculator page component
-   [ ] Display component
-   [ ] ButtonGrid component
-   [ ] CalculatorButton component
-   [ ] CSS Modules for all components
-   [ ] Component tests

### Pages

-   [ ] Main page route configuration (`/calculator`)
-   [ ] Page tests

### State Management

-   [ ] TanStack Query mutation setup for calculation
-   [ ] API client function (`calculateExpression`)
-   [ ] Calculator state management (isOn, display, currentInput, operator, previousValue, waitingForOperand)
-   [ ] Error handling (all error codes from API_CONTRACT.md)
-   [ ] Loading states (disable equals button during calculation)

### Styling

-   [ ] CSS Modules for Calculator component
-   [ ] CSS Modules for Display component
-   [ ] CSS Modules for ButtonGrid component
-   [ ] CSS Modules for CalculatorButton component
-   [ ] Responsive design (mobile and desktop)
-   [ ] Loading/error states styling
-   [ ] Button hover/active states
-   [ ] Disabled state styling (when calculator is off)

### Integration

-   [ ] Connect to backend API (per API_CONTRACT.md)
-   [ ] Test API calls (all operations: +, -, \*, /)
-   [ ] Handle errors gracefully (all error codes)
-   [ ] Test error scenarios (division by zero, invalid input)
-   [ ] Test power on/off functionality
-   [ ] Test button interactions (numbers, operators, equals, clear, decimal)

## Testing Considerations

### Unit Tests

-   Component rendering
-   User interactions
-   State management
-   API client functions
-   Error handling

### Integration Tests

-   API integration (test calculation API calls)
-   Full calculation flow (number → operator → number → equals)
-   Error scenarios (division by zero, API errors)
-   Loading states (button disabled during calculation)
-   Power on/off flow
-   Multiple operations chaining

## Dependencies

### React Libraries

-   `react-router-dom`: Routing
-   `@tanstack/react-query`: Data fetching
-   Standard React hooks

## Performance Considerations

-   Calculations are fast - no need for debouncing
-   Button clicks should be responsive (immediate visual feedback)
-   API calls are lightweight - no need for caching
-   Component re-renders should be minimal (use React.memo for button components if needed)

## Accessibility

-   Semantic HTML: Use `<button>` elements for all calculator buttons
-   ARIA labels: Label all buttons with descriptive text (e.g., "Number 5", "Add", "Calculate", "Clear")
-   Keyboard navigation: Support keyboard shortcuts (optional enhancement):
    -   Number keys (0-9) for number input
    -   +, -, \*, / for operators
    -   Enter or = for equals
    -   Escape or C for clear
    -   Power key for power on/off
-   Screen reader support: Announce display value changes, announce calculation results, announce errors
-   Focus management: Maintain focus on calculator container, allow tab navigation between buttons

## Future Enhancements

-   Keyboard input support (type numbers and operators)
-   Calculation history (show previous calculations)
-   Memory functions (M+, M-, MR, MC)
-   Scientific calculator functions (sin, cos, tan, log, etc.)
-   Theme customization (different calculator styles)
-   Sound effects for button clicks (optional)
-   Support for parentheses and complex expressions
-   Undo/redo functionality

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend.
