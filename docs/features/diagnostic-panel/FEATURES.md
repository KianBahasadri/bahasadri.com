# Diagnostic Panel - User Features

**Global diagnostic panel that replaces console.log with a hacker terminal UI, providing diagnostic logging, JavaScript console execution, and custom slash commands.**

## Overview

The diagnostic panel is a pullout menu on the left side of the screen that provides a comprehensive diagnostic and debugging interface. It features a hacker terminal UI matching the site's cyberpunk aesthetic, allowing developers to view diagnostic information, execute JavaScript code, and use custom slash commands. The panel effectively replaces browser console.log with a more integrated and visually consistent debugging experience.

## Key Features

### Pullout Menu Interface

The panel appears as a collapsible menu on the left side of the screen:
- Slides in/out from the left edge with smooth animations
- Fixed position that doesn't interfere with page content
- Toggleable visibility (can be shown/hidden)
- Terminal-style UI matching the site's cyberpunk theme

### Diagnostic Logging System

The panel provides a logging system that replaces `console.log`:
- Importable logging functions that can be used throughout the application
- Messages appear in the terminal-style output area
- Supports different verbosity levels (debug, info, warn, error, etc.)
- Filterable by verbosity level
- Timestamped entries
- Color-coded by log level

### Verbosity Levels

The logging system supports multiple verbosity levels:
- **Debug**: Detailed diagnostic information for development
- **Info**: General informational messages
- **Warn**: Warning messages that don't break functionality
- **Error**: Error messages and exceptions
- **Trace**: Stack traces and detailed execution flow
- **Silent**: Suppress all logging (for production)

Users can filter the displayed logs by selecting which verbosity levels to show.

### JavaScript Console

The panel includes a fully functional JavaScript console:
- Input field for typing JavaScript code
- Execute code and see results in real-time
- Full access to browser APIs and global objects
- Command history (arrow keys to navigate previous commands)
- Multi-line code support
- Error handling and display

### Custom Slash Commands

The console supports custom slash commands for quick operations:
- Commands start with `/` (e.g., `/help`, `/clear`, `/filter`)
- Built-in commands for common operations
- Extensible command system for adding custom commands
- Command autocomplete/suggestions (optional)
- Command history

### Hacker Terminal UI

The panel features a terminal/cyberpunk aesthetic matching the site theme:
- Dark background with terminal green/cyan text
- Monospace font (terminal-style)
- Scanline effects
- Glowing text shadows
- Pink/cyan accent colors matching site theme
- Cursor blinking animation
- Terminal-style prompt indicators

## User Workflows

### Viewing Diagnostic Information

**Goal**: View diagnostic logs from the application

**Steps**:

1. User opens the diagnostic panel (toggle button or keyboard shortcut)
2. Panel slides in from the left side
3. User views diagnostic messages in the terminal output area
4. Messages are color-coded by verbosity level
5. User can scroll through the log history
6. User can filter by verbosity level using controls or slash commands

**Result**: User sees all diagnostic information in a terminal-style interface

### Logging Diagnostic Information

**Goal**: Send diagnostic information to the panel from application code

**Steps**:

1. Developer imports logging functions (e.g., `logDebug`, `logInfo`, `logError`)
2. Developer calls logging functions throughout the application
3. Messages appear in the diagnostic panel in real-time
4. Messages are formatted with timestamps and verbosity level indicators

**Result**: Diagnostic information is displayed in the panel instead of browser console

### Executing JavaScript Code

**Goal**: Run JavaScript code in the console

**Steps**:

1. User opens the diagnostic panel
2. User types JavaScript code in the input field
3. User presses Enter to execute
4. Code executes and result is displayed in the output area
5. Errors are caught and displayed with stack traces
6. User can navigate command history with arrow keys

**Result**: User can execute JavaScript code and see results immediately

### Using Slash Commands

**Goal**: Execute custom commands for quick operations

**Steps**:

1. User opens the diagnostic panel
2. User types a slash command (e.g., `/clear`, `/help`, `/filter debug`)
3. User presses Enter
4. Command executes and performs the requested action
5. Feedback is displayed in the output area

**Result**: User performs quick operations using slash commands

### Filtering Logs by Verbosity

**Goal**: Show only logs of specific verbosity levels

**Steps**:

1. User opens the diagnostic panel
2. User uses filter controls or slash command (e.g., `/filter debug info`)
3. Panel updates to show only logs matching selected verbosity levels
4. Filter state persists while panel is open

**Result**: User sees only relevant diagnostic information

## User Capabilities

- View diagnostic logs in a terminal-style interface
- Filter logs by verbosity level
- Execute JavaScript code in a console interface
- Use custom slash commands for quick operations
- Navigate command history
- Clear log history
- Toggle panel visibility
- Import and use logging functions throughout the application
- See color-coded, timestamped log entries
- View error stack traces and detailed diagnostic information

## Use Cases

### Development Debugging

Developers can use the panel to debug application issues by viewing diagnostic logs, executing test code, and inspecting application state in real-time.

### Production Diagnostics

In production, the panel can display important diagnostic information (filtered by verbosity level) to help diagnose issues without cluttering the browser console.

### Code Testing

Developers can quickly test JavaScript code snippets, API calls, or utility functions directly in the console without opening browser DevTools.

### Log Management

The panel provides a centralized location for all diagnostic information, making it easier to manage and filter logs compared to browser console.

## User Benefits

- **Integrated Experience**: Diagnostic tools match the site's visual theme
- **Better Organization**: All diagnostic information in one place
- **Customizable**: Filter by verbosity, clear history, custom commands
- **Developer-Friendly**: Import logging functions anywhere in the codebase
- **Visual Consistency**: Terminal UI matches the cyberpunk aesthetic
- **Powerful Console**: Full JavaScript execution with command history
- **Quick Operations**: Slash commands for common tasks

---

**Note**: This document describes features from the user's perspective. For technical implementation details, see `FRONTEND.md`.

