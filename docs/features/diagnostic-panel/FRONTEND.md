# Diagnostic Panel - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the Diagnostic Panel global component. The diagnostic panel is a pullout menu on the left side of the screen that provides diagnostic logging, JavaScript console execution, and custom slash commands with a hacker terminal UI matching the site's cyberpunk theme.

## Code Location

`frontend/src/components/DiagnosticPanel/`

## API Contract Reference

N/A - This is a pure frontend component with no backend API requirements.

## Pages/Routes

### Global Component

**Component**: `DiagnosticPanel.tsx`

**Description**: Global diagnostic panel component rendered in `App.tsx` that appears on all routes

**Route Configuration**:

The component is rendered at the app root level in `App.tsx`:

```typescript
<>
    <DiagnosticPanel />
    <HomeButton />
    <Routes>
        {/* routes */}
    </Routes>
</>
```

## Components

### DiagnosticPanel (Main Component)

**Location**: `components/DiagnosticPanel/DiagnosticPanel.tsx`

**Purpose**: Main container for the diagnostic panel with pullout menu functionality

**Props**: None (uses internal state and global logging system)

**State**:

-   Panel visibility: `isOpen` (boolean, default: false)
-   Log entries: Array of log entry objects
-   Verbosity filter: Array of enabled verbosity levels
-   Command history: Array of previous commands
-   Command history index: Current position in history (for arrow key navigation)

**Layout**:

-   Fixed position on left side of screen
-   Collapsible: Slides in/out from left edge
-   Width: ~400px when open (adjustable)
-   Full viewport height
-   High z-index: Above page content but below modals
-   Terminal-style UI with dark background

**Interactions**:

-   Toggle button: Show/hide panel (keyboard shortcut or button)
-   Slide animation: Smooth slide in/out from left
-   Log filtering: Filter by verbosity level
-   Clear logs: Remove all log entries
-   Scroll: Auto-scroll to latest log entry

**Styling**:

-   CSS Modules: `DiagnosticPanel.module.css`
-   Terminal/cyberpunk aesthetic:
    -   Dark background (`--dark-void`, `--dark-surface`)
    -   Terminal green/cyan text (`--terminal-green`, `--terminal-cyan`)
    -   Pink accents (`--pink-hot`)
    -   Monospace font
    -   Scanline effects
    -   Glowing text shadows

### LogOutput

**Location**: `components/DiagnosticPanel/LogOutput.tsx`

**Purpose**: Displays log entries in a terminal-style output area

**Props**:

```typescript
interface LogOutputProps {
    logs: LogEntry[];
    verbosityFilter: VerbosityLevel[];
}
```

**State**:

-   Scroll position: Auto-scroll to bottom when new logs arrive
-   Virtual scrolling: For performance with many log entries (optional)

**Layout**:

-   Scrollable container
-   Monospace font
-   Color-coded log entries by verbosity level
-   Timestamp prefix for each entry
-   Verbosity level indicator (e.g., `[DEBUG]`, `[INFO]`, `[ERROR]`)

**Interactions**:

-   Auto-scroll: Scroll to bottom when new log arrives
-   Manual scroll: User can scroll up to view history
-   Click to copy: Click on log entry to copy to clipboard (optional)

**Styling**:

-   Terminal-style output
-   Color coding:
    -   Debug: Cyan (`--terminal-cyan`)
    -   Info: Green (`--terminal-green`)
    -   Warn: Yellow (`--warning-yellow`)
    -   Error: Red (`--error-red` or `--blood-red`)
-   Timestamp: Dimmed/muted color
-   Text shadows for glow effect

### ConsoleInput

**Location**: `components/DiagnosticPanel/ConsoleInput.tsx`

**Purpose**: Input field for JavaScript code execution and slash commands

**Props**:

```typescript
interface ConsoleInputProps {
    onExecute: (input: string) => void;
    onCommandHistory: (direction: 'up' | 'down') => void;
    commandHistory: string[];
    historyIndex: number;
}
```

**State**:

-   Input value: Current text in input field
-   Multi-line support: Handle multi-line code input
-   Command history navigation: Arrow keys to navigate history

**Layout**:

-   Input field at bottom of panel
-   Terminal-style prompt indicator (e.g., `> ` or `$ `)
-   Monospace font
-   Auto-focus when panel opens

**Interactions**:

-   Enter: Execute code or command
-   Shift+Enter: New line (for multi-line code)
-   Arrow Up: Previous command in history
-   Arrow Down: Next command in history
-   Tab: Autocomplete (optional)

**Styling**:

-   Terminal-style input
-   Blinking cursor
-   Pink/cyan accent colors
-   Focus outline matching theme

### VerbosityFilter

**Location**: `components/DiagnosticPanel/VerbosityFilter.tsx`

**Purpose**: Controls for filtering logs by verbosity level

**Props**:

```typescript
interface VerbosityFilterProps {
    enabledLevels: VerbosityLevel[];
    onToggle: (level: VerbosityLevel) => void;
}
```

**State**:

-   Enabled verbosity levels: Array of selected levels

**Layout**:

-   Checkbox or toggle buttons for each verbosity level
-   Compact layout (horizontal or vertical)
-   Terminal-style UI

**Interactions**:

-   Click to toggle verbosity level
-   Update filter immediately
-   Filter persists while panel is open

**Styling**:

-   Terminal-style controls
-   Color-coded by verbosity level
-   Glowing effects on active filters

## Logging System

### Logging Functions

**Location**: `lib/diagnostic-logger.ts`

**Purpose**: Importable logging functions for use throughout the application

**Exports**:

```typescript
// Logging functions
export const logDebug = (message: string, data?: unknown): void;
export const logInfo = (message: string, data?: unknown): void;
export const logWarn = (message: string, data?: unknown): void;
export const logError = (message: string, error?: Error | unknown): void;
export const logTrace = (message: string, stack?: string): void;

// Verbosity level enum
export enum VerbosityLevel {
    DEBUG = 'debug',
    INFO = 'info',
    WARN = 'warn',
    ERROR = 'error',
    TRACE = 'trace',
}

// Log entry type
export interface LogEntry {
    id: string;
    timestamp: number;
    level: VerbosityLevel;
    message: string;
    data?: unknown;
    stack?: string;
}
```

**Usage Example**:

```typescript
import { logDebug, logInfo, logError } from '@/lib/diagnostic-logger';

// In component or utility
logDebug('Component mounted', { props });
logInfo('User action performed', { action: 'click' });
logError('API request failed', error);
```

**Implementation**:

-   Functions send log entries to a global log store
-   Log store is managed by DiagnosticPanel component
-   Entries are timestamped and assigned unique IDs
-   Data is serialized for display (JSON.stringify for objects)

### Log Store

**Location**: `lib/diagnostic-logger.ts` or `components/DiagnosticPanel/logStore.ts`

**Purpose**: Centralized store for log entries

**Implementation**:

-   Singleton pattern or React Context
-   Event emitter pattern for notifying panel of new logs
-   Maximum log entries limit (e.g., 1000 entries, then oldest removed)
-   Circular buffer for performance

## Command System

### Slash Commands

**Location**: `components/DiagnosticPanel/commands.ts`

**Purpose**: Custom slash command handlers

**Command Structure**:

```typescript
interface Command {
    name: string;
    description: string;
    usage: string;
    handler: (args: string[]) => void | Promise<void>;
}
```

**Built-in Commands**:

-   `/help` - Display available commands
-   `/clear` - Clear all log entries
-   `/filter <levels...>` - Set verbosity filter (e.g., `/filter debug info`)
-   `/reset` - Reset filter to show all levels
-   `/history` - Show command history
-   `/version` - Show panel version

**Command Execution**:

-   Parse input starting with `/`
-   Extract command name and arguments
-   Look up command handler
-   Execute handler
-   Display result or error in output

**Extensibility**:

-   Command registry pattern
-   Easy to add new commands
-   Commands can interact with panel state

## JavaScript Console Execution

### Code Execution

**Location**: `components/DiagnosticPanel/consoleExecutor.ts`

**Purpose**: Execute JavaScript code safely

**Implementation**:

-   Use `eval()` or `Function` constructor for code execution
-   Wrap in try-catch for error handling
-   Capture console output (override console methods temporarily)
-   Display results in output area
-   Handle async code (Promises)

**Security Considerations**:

-   Code executes in same context as application
-   Full access to browser APIs and globals
-   No sandboxing (as requested by user)

**Error Handling**:

-   Catch and display errors with stack traces
-   Format errors in terminal style
-   Color-code errors (red)

**Result Display**:

-   Display return value
-   Display console.log output
-   Display errors
-   Format objects/arrays nicely (JSON.stringify with indentation)

## State Management

### Panel State

```typescript
const [isOpen, setIsOpen] = useState<boolean>(false);
const [logs, setLogs] = useState<LogEntry[]>([]);
const [verbosityFilter, setVerbosityFilter] = useState<VerbosityLevel[]>([
    VerbosityLevel.DEBUG,
    VerbosityLevel.INFO,
    VerbosityLevel.WARN,
    VerbosityLevel.ERROR,
]);
const [commandHistory, setCommandHistory] = useState<string[]>([]);
const [historyIndex, setHistoryIndex] = useState<number>(-1);
```

### Log Store Integration

-   Logging functions add entries to global store
-   DiagnosticPanel subscribes to log store
-   New logs trigger re-render with filtered view
-   Maximum log limit enforced

## User Interactions

### Primary Actions

-   **Toggle Panel**:
    -   Trigger: Keyboard shortcut (e.g., `Ctrl+` or `` Ctrl+` ``) or toggle button
    -   Flow: Slide panel in/out from left
    -   Error handling: N/A (local state)

-   **Execute Code/Command**:
    -   Trigger: Press Enter in console input
    -   Flow:
        1. Parse input (check for slash command)
        2. Execute command or JavaScript code
        3. Display result in output area
        4. Add to command history
    -   Error handling: Catch and display errors

-   **Filter Logs**:
    -   Trigger: Toggle verbosity filter or use `/filter` command
    -   Flow: Update filter state, re-render filtered logs
    -   Error handling: N/A (local state)

-   **Clear Logs**:
    -   Trigger: `/clear` command or clear button
    -   Flow: Clear log entries array
    -   Error handling: N/A (local state)

-   **Navigate History**:
    -   Trigger: Arrow Up/Down in console input
    -   Flow: Navigate through command history
    -   Error handling: N/A (local state)

## UI/UX Requirements

### Layout

-   Fixed position on left side
-   Slides in/out with smooth animation (300-500ms)
-   Width: ~400px (adjustable via CSS variable)
-   Full viewport height
-   Doesn't overlap with page content (pushes content or overlays)

### Visual Design

-   Terminal/cyberpunk aesthetic:
    -   Dark background: `var(--dark-void)` or `var(--dark-surface)`
    -   Terminal green text: `var(--terminal-green)` (#00ff00 or #00ff88)
    -   Terminal cyan accents: `var(--terminal-cyan)` (#00ffff)
    -   Pink accents: `var(--pink-hot)` (#ff69b4)
    -   Monospace font: `"Courier New", monospace` or similar
    -   Scanline effects (optional overlay)
    -   Glowing text shadows
    -   Border glow effects

### Animations

-   **Panel slide**: 300-500ms ease-in-out
-   **Log entry appearance**: Fade in (200ms)
-   **Cursor blink**: Continuous animation
-   **Text glow**: Subtle pulsing (optional)
-   Respect `prefers-reduced-motion`

### User Feedback

-   Loading states: N/A (all local operations)
-   Error messages: Display in output area with red color
-   Success feedback: Command results displayed immediately
-   Empty states: Show "No logs" or "Ready" message when empty

## Implementation Checklist

### Components

-   [ ] DiagnosticPanel main component
-   [ ] LogOutput component
-   [ ] ConsoleInput component
-   [ ] VerbosityFilter component
-   [ ] CSS Modules for all components

### Logging System

-   [ ] Diagnostic logger module (`lib/diagnostic-logger.ts`)
-   [ ] Logging functions (logDebug, logInfo, logWarn, logError, logTrace)
-   [ ] Log store/context
-   [ ] Log entry types and interfaces

### Command System

-   [ ] Command parser
-   [ ] Command registry
-   [ ] Built-in command handlers
-   [ ] Command history management

### Console Execution

-   [ ] JavaScript code executor
-   [ ] Error handling and display
-   [ ] Result formatting
-   [ ] Console output capture

### Integration

-   [ ] Global component registration in `App.tsx`
-   [ ] Keyboard shortcut for toggle
-   [ ] Replace console.log usage (optional migration)
-   [ ] Export logging functions for import

### Styling

-   [ ] Terminal UI styling
-   [ ] Color coding for verbosity levels
-   [ ] Scanline effects
-   [ ] Glowing text shadows
-   [ ] Slide animations
-   [ ] Responsive design (mobile considerations)

## Dependencies

### React Libraries

-   Standard React hooks (`useState`, `useEffect`, `useRef`, `useCallback`)
-   React Context (optional for log store)

### Browser APIs

-   `eval()` or `Function` constructor for code execution
-   `console` API (for capturing console.log output)
-   Keyboard event handling for shortcuts

## Performance Considerations

-   **Log limit**: Maximum number of log entries (e.g., 1000), then remove oldest
-   **Virtual scrolling**: For LogOutput if many entries (optional optimization)
-   **Debouncing**: Debounce rapid log entries if needed
-   **Memoization**: Memoize filtered log list
-   **Code execution**: Be careful with eval() performance for large code blocks

## Accessibility

-   Semantic HTML: Use proper form elements for input
-   ARIA labels:
    -   Panel: `aria-label="Diagnostic Panel"`
    -   Input: `aria-label="Console input"`
    -   Toggle button: `aria-label="Toggle diagnostic panel"`
-   ARIA states:
    -   Panel: `aria-hidden="true"` when closed
    -   Toggle: `aria-expanded="false"` when closed
-   Keyboard navigation:
    -   Toggle shortcut: `Ctrl+` or `` Ctrl+` ``
    -   Input field is focusable
    -   Tab navigation through filter controls
-   Screen reader support:
    -   Announce new log entries (optional, may be verbose)
    -   Announce command execution results
-   Color contrast: Ensure terminal colors meet WCAG AA standards
-   Animations: Respect `prefers-reduced-motion`

---

**Note**: This document is independent of backend implementation. This component has no backend dependencies.

