# Platformer Game - Frontend Design

**Frontend-specific design and implementation requirements. This document is independent of backend implementation details.**

## Overview

Frontend implementation for the platformer game. This is a fully client-side game built with React and HTML5 Canvas (or a game library like Phaser, PixiJS, or native Canvas API). The game handles all physics, collision detection, rendering, and game state management in the browser.

## Code Location

`frontend/src/pages/platformer-game/`

## API Contract Reference

See `docs/features/platformer-game/API_CONTRACT.md` for the API contract this frontend consumes. Note that the game should work without the backend API using embedded level data and localStorage for scores.

## Pages/Routes

### `/platformer-game`

**Component**: `PlatformerGame.tsx`

**Description**: Main game page that renders the platformer game canvas and UI

**Route Configuration**:

```typescript
<Route path="/platformer-game" element={<PlatformerGame />} />
```

## Components

### PlatformerGame (Main Page)

**Location**: `PlatformerGame.tsx`

**Purpose**: Main game component that manages the game loop, rendering, and game state

**State**:

-   Server state: Level data (TanStack Query, with fallback to embedded data)
-   Local state: Game state (current level, score, lives, character position, game status)

**Layout**:

-   Canvas element for game rendering
-   UI overlay for score, lives, level indicator
-   Menu overlays for start screen, pause menu, game over screen

### GameCanvas

**Location**: `components/GameCanvas/GameCanvas.tsx`

**Purpose**: Handles the game rendering and game loop

**Props**:

```typescript
interface GameCanvasProps {
    levelData: LevelData;
    onLevelComplete: () => void;
    onGameOver: () => void;
    onScoreUpdate: (score: number) => void;
}
```

**State**:

-   Game loop state (running, paused)
-   Character state (position, velocity, animation frame)
-   Level state (platforms, obstacles, collectibles)

**Interactions**:

-   Keyboard input handling (arrow keys, WASD, spacebar, Escape)
-   Game loop (requestAnimationFrame)
-   Collision detection
-   Physics calculations

**Styling**:

-   CSS Modules: `GameCanvas.module.css`
-   Canvas element with fixed or responsive dimensions

### GameUI

**Location**: `components/GameUI/GameUI.tsx`

**Purpose**: Displays game UI elements (score, lives, level indicator)

**Props**:

```typescript
interface GameUIProps {
    score: number;
    lives: number;
    currentLevel: number;
    isPaused: boolean;
    onPause: () => void;
    onResume: () => void;
    onRestart: () => void;
    onMainMenu: () => void;
}
```

**State**:

-   UI visibility state

**Interactions**:

-   Pause button click
-   Menu button clicks

**Styling**:

-   CSS Modules: `GameUI.module.css`
-   Overlay positioned on top of game canvas

### StartScreen

**Location**: `components/StartScreen/StartScreen.tsx`

**Purpose**: Initial game start screen with instructions

**Props**:

```typescript
interface StartScreenProps {
    onStart: () => void;
}
```

**Styling**:

-   CSS Modules: `StartScreen.module.css`
-   Full-screen overlay with game title and instructions

### GameOverScreen

**Location**: `components/GameOverScreen/GameOverScreen.tsx`

**Purpose**: Game over screen displayed when player loses

**Props**:

```typescript
interface GameOverScreenProps {
    score: number;
    level: number;
    onRestart: () => void;
    onMainMenu: () => void;
}
```

**Styling**:

-   CSS Modules: `GameOverScreen.module.css`
-   Full-screen overlay with game over message and options

### LevelCompleteScreen

**Location**: `components/LevelCompleteScreen/LevelCompleteScreen.tsx`

**Purpose**: Level completion screen displayed when player completes a level

**Props**:

```typescript
interface LevelCompleteScreenProps {
    level: number;
    score: number;
    onNextLevel: () => void;
    onMainMenu: () => void;
}
```

**Styling**:

-   CSS Modules: `LevelCompleteScreen.module.css`
-   Overlay with level complete message and options

## State Management

### Server State (TanStack Query)

```typescript
// Query keys
const queryKeys = {
    levels: ["platformer-game", "levels"] as const,
    level: (levelNumber: number) => ["platformer-game", "level", levelNumber] as const,
};

// TanStack Query hooks
const useLevels = () => {
    return useQuery({
        queryKey: queryKeys.levels,
        queryFn: () => fetchLevels(),
        staleTime: Infinity, // Level data doesn't change
        retry: false, // Fallback to embedded data on error
    });
};

const useLevel = (levelNumber: number) => {
    return useQuery({
        queryKey: queryKeys.level(levelNumber),
        queryFn: () => fetchLevel(levelNumber),
        staleTime: Infinity,
        retry: false,
    });
};
```

### Local State (React)

```typescript
// Game state
const [gameState, setGameState] = useState<GameState>({
    currentLevel: 1,
    score: 0,
    lives: 3,
    position: { x: 0, y: 0 },
});

const [gameStatus, setGameStatus] = useState<"menu" | "playing" | "paused" | "gameOver" | "levelComplete">("menu");
const [isPaused, setIsPaused] = useState(false);
```

## API Integration

### API Client Functions

**Location**: `lib/api.ts`

```typescript
// Fetch all levels
export const fetchLevels = async (): Promise<LevelsResponse> => {
    const response = await fetch("/api/platformer-game/levels", {
        method: "GET",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch levels");
    }

    return response.json();
};

// Fetch specific level
export const fetchLevel = async (levelNumber: number): Promise<LevelData> => {
    const response = await fetch(`/api/platformer-game/levels?level=${levelNumber}`, {
        method: "GET",
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch level");
    }

    return response.json();
};

// Save high score (optional)
export const saveHighScore = async (score: number, level: number, playerName?: string): Promise<HighScoreResponse> => {
    const response = await fetch("/api/platformer-game/high-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, level, playerName }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save high score");
    }

    return response.json();
};
```

### Error Handling

-   **Level Data Fallback**: If API fails, use embedded level data in the frontend
-   **High Score Fallback**: If API fails, save to localStorage instead
-   **Graceful Degradation**: Game should be fully playable without backend

## Game Engine

### Game Loop

```typescript
// Game loop using requestAnimationFrame
const gameLoop = (timestamp: number) => {
    if (!isPaused && gameStatus === "playing") {
        updateGame(timestamp);
        renderGame();
    }
    requestAnimationFrame(gameLoop);
};
```

### Physics System

-   **Gravity**: Constant downward acceleration
-   **Velocity**: Character velocity for horizontal and vertical movement
-   **Collision Detection**: AABB (Axis-Aligned Bounding Box) collision detection
-   **Platform Collision**: Check if character is on a platform
-   **Wall Collision**: Prevent character from moving through walls

### Input Handling

```typescript
// Keyboard input handling
useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
            // Move left
        } else if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
            // Move right
        } else if (e.key === " " || e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
            // Jump
        } else if (e.key === "Escape" || e.key === "p" || e.key === "P") {
            // Pause
        }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
}, []);
```

## User Interactions

### Primary Actions

-   **Start Game**:
    -   Trigger: Click "Start" button or press any key on start screen
    -   Flow: Load first level, initialize game state, start game loop
    -   Error handling: Fallback to embedded level data if API fails

-   **Character Movement**:
    -   Trigger: Arrow keys or WASD
    -   Flow: Update character velocity, apply physics, check collisions
    -   Error handling: None (client-side only)

-   **Jump**:
    -   Trigger: Spacebar or Up arrow
    -   Flow: Apply upward velocity if character is on ground
    -   Error handling: None

-   **Pause/Resume**:
    -   Trigger: Escape or P key
    -   Flow: Toggle pause state, show/hide pause menu
    -   Error handling: None

-   **Level Complete**:
    -   Trigger: Character reaches goal point
    -   Flow: Show level complete screen, update score, load next level
    -   Error handling: Handle missing next level gracefully

-   **Game Over**:
    -   Trigger: Character loses all lives or falls off level
    -   Flow: Show game over screen, save score (if possible)
    -   Error handling: Fallback to localStorage if API fails

## UI/UX Requirements

### Layout

-   **Canvas**: Full-screen or fixed-size game canvas
-   **UI Overlay**: Score, lives, level indicator in top corners
-   **Menus**: Full-screen overlays for start, pause, game over, level complete

### Visual Design

-   **Character Sprite**: Animated character sprite for different states (idle, running, jumping)
-   **Platforms**: Clear visual distinction for platforms
-   **Obstacles**: Visually distinct obstacles (spikes, enemies, pits)
-   **Background**: Level background that doesn't interfere with gameplay
-   **Terminal Aesthetic**: Match the site's terminal/cyberpunk theme if possible

### User Feedback

-   **Loading states**: Show loading indicator when fetching level data
-   **Error messages**: Display error if level fails to load (with fallback)
-   **Success feedback**: Visual/audio feedback for level completion
-   **Empty states**: N/A (game always has levels)

## Implementation Checklist

### Components

-   [ ] PlatformerGame page component
-   [ ] GameCanvas component with game loop
-   [ ] GameUI component
-   [ ] StartScreen component
-   [ ] GameOverScreen component
-   [ ] LevelCompleteScreen component
-   [ ] CSS Modules for all components
-   [ ] Component tests

### Pages

-   [ ] Main page route configuration
-   [ ] Page tests

### State Management

-   [ ] TanStack Query setup for level data
-   [ ] Local game state management
-   [ ] Game state persistence (localStorage for progress)
-   [ ] API client functions with error handling
-   [ ] Fallback to embedded level data

### Game Engine

-   [ ] Game loop implementation
-   [ ] Physics system (gravity, velocity, collision)
-   [ ] Collision detection system
-   [ ] Input handling (keyboard)
-   [ ] Character movement and animation
-   [ ] Level rendering
-   [ ] Sprite/animation system

### Styling

-   [ ] CSS Modules for components
-   [ ] Responsive design (if needed)
-   [ ] Loading/error states
-   [ ] Menu overlays
-   [ ] UI element styling

### Integration

-   [ ] Connect to backend API (per API_CONTRACT.md) with fallback
-   [ ] Test API calls
-   [ ] Handle errors gracefully
-   [ ] Test error scenarios
-   [ ] Test client-side only mode (no backend)

## Testing Considerations

### Unit Tests

-   Component rendering
-   User interactions
-   State management
-   API client functions
-   Error handling
-   Physics calculations
-   Collision detection

### Integration Tests

-   API integration with fallback
-   Game loop execution
-   Input handling
-   Level progression
-   Error scenarios
-   Loading states

## Dependencies

### React Libraries

-   `react-router-dom`: Routing
-   `@tanstack/react-query`: Data fetching (optional, with fallback)
-   Standard React hooks

### Game Libraries (Choose One)

-   **Option 1**: Native HTML5 Canvas API (no external dependencies)
-   **Option 2**: Phaser.js (full-featured game framework)
-   **Option 3**: PixiJS (2D WebGL renderer)
-   **Option 4**: Matter.js (physics engine) + Canvas

## Performance Considerations

-   **Game Loop**: Use requestAnimationFrame for smooth 60fps rendering
-   **Collision Detection**: Optimize collision checks (spatial partitioning if needed)
-   **Rendering**: Only render visible portions of the level
-   **Memory**: Clean up game state when switching levels
-   **Asset Loading**: Preload sprites and level data

## Accessibility

-   **Keyboard Navigation**: Full keyboard support for all game actions
-   **Screen Reader**: Provide text alternatives for game state
-   **Visual Feedback**: Clear visual indicators for all game states
-   **Controls Display**: Show control instructions on start screen
-   **Pause Functionality**: Easy access to pause menu

---

**Note**: This document is independent of backend implementation. Only the API contract in API_CONTRACT.md couples frontend and backend. The game should be fully playable without backend using embedded level data.

