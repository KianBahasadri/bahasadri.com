# Route Comparison - User Features

**User-facing feature description from the user's perspective. This document describes what users can do and what the feature provides.**

## Overview

Route Comparison allows users to compare routes from different mapping/navigation APIs for a specific destination. Users can input an origin and destination, and the tool will fetch route information from multiple APIs (e.g., Google Maps, Mapbox, OpenRouteService) and display a side-by-side comparison of route options, including distance, duration, and other relevant metrics.

## Key Features

### Multi-API Route Fetching

Users can fetch route information from multiple navigation APIs simultaneously. The system queries each configured API with the same origin and destination parameters and aggregates the results for comparison.

### Route Comparison Display

Users can view routes from different APIs side-by-side, comparing key metrics such as:
- Total distance
- Estimated travel time
- Route geometry (for visualization)
- Turn-by-turn directions
- Traffic conditions (when available)

### Route Selection

Users can select and view detailed information about any specific route from the comparison results, including step-by-step directions and route visualization.

## User Workflows

### Compare Routes for a Destination

**Goal**: Compare route options from different APIs to find the best route to a destination

**Steps**:

1. Enter origin address or coordinates
2. Enter destination address or coordinates
3. Optionally select which APIs to query (default: all available)
4. Click "Compare Routes"
5. View comparison results showing routes from each API
6. Select a route to view detailed directions

**Result**: User receives a comprehensive comparison of route options from multiple APIs, helping them choose the best route based on their preferences (shortest distance, fastest time, etc.)

### View Route Details

**Goal**: Get detailed information about a specific route

**Steps**:

1. From the comparison results, click on a specific route
2. View detailed turn-by-turn directions
3. See route visualization on a map
4. Review additional route metadata

**Result**: User has complete information about their chosen route

## User Capabilities

- Compare routes from multiple navigation APIs simultaneously
- View side-by-side comparison of route metrics (distance, duration)
- Access detailed turn-by-turn directions for any route
- Visualize routes on an interactive map
- Filter or sort routes by different criteria (distance, time, etc.)

## Use Cases

### Planning a Trip

A user wants to plan a road trip and needs to compare route options from different services to find the most efficient path, considering factors like distance, estimated time, and traffic conditions.

### Finding Alternative Routes

A user wants to explore different route options to a destination, comparing suggestions from multiple APIs to find alternatives that might be faster, shorter, or avoid certain areas.

### API Comparison

A developer or curious user wants to see how different navigation APIs differ in their route recommendations for the same origin and destination.

## User Benefits

- **Comprehensive Comparison**: See all route options in one place instead of checking multiple services separately
- **Informed Decision Making**: Compare metrics side-by-side to choose the best route for your needs
- **Time Savings**: Get route information from multiple APIs in a single request
- **Transparency**: See how different APIs differ in their route recommendations

---

**Note**: This document describes features from the user's perspective. For technical implementation details, see `API_CONTRACT.yml`, `FRONTEND.md`, and `BACKEND.md`.

