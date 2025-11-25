# Rideshare Price Comparison - User Features

**User-facing feature description from the user's perspective. This document describes what users can do and what the feature provides.**

## Overview

A tool that allows users to compare rideshare prices across multiple services (Uber, Lyft, etc.) for a specific ride. Users enter their origin and destination, and optionally specify a date and time, to see real-time price comparisons from different rideshare providers.

## Key Features

### Ride Input

Users can specify their ride details including:

-   Origin address or location
-   Destination address or location
-   Optional date and time for the ride (defaults to current time if not specified)

The interface provides an intuitive form for entering these details, with support for address autocomplete to make input easier.

### Price Comparison

The tool fetches and displays prices from multiple rideshare services simultaneously, showing:

-   Service name (Uber, Lyft, etc.)
-   Price estimates for different vehicle types (e.g., Economy, Premium, XL)
-   Estimated arrival time
-   Estimated trip duration

Prices are displayed in a clear comparison format, making it easy to identify the best option.

### Real-Time Pricing

Prices are fetched in real-time from rideshare APIs, ensuring users see current, accurate pricing information rather than outdated estimates.

## User Workflows

### Compare Prices for a Ride

**Goal**: Find the best rideshare price for a specific trip

**Steps**:

1. Enter the origin address or location
2. Enter the destination address or location
3. Optionally select a date and time for the ride (defaults to current time)
4. Click "Compare Prices" or similar action button
5. Wait for prices to load from multiple services
6. Review the comparison table showing prices from different services
7. Compare prices, vehicle types, and estimated times across services
8. Optionally adjust the date/time to see how prices change

**Result**: A clear comparison of rideshare prices from multiple services, allowing the user to make an informed decision about which service to use.

## User Capabilities

-   Enter origin and destination addresses
-   Specify optional date and time for the ride
-   View real-time price comparisons from multiple rideshare services
-   Compare prices across different vehicle types
-   See estimated arrival times and trip durations
-   Adjust ride parameters to see updated pricing

## Use Cases

### Find the Cheapest Option

Compare prices across multiple rideshare services to find the most affordable option for a specific trip, especially useful for budget-conscious users or frequent riders.

### Compare Vehicle Options

See pricing differences between economy, premium, and larger vehicle options across services to make an informed choice based on both price and comfort needs.

### Plan Ahead

Check prices for future rides at different times to find the best time to book or understand price variations throughout the day.

## User Benefits

-   **Save Money**: Easily identify the cheapest option across all services
-   **Time Savings**: Compare multiple services in one place instead of opening multiple apps
-   **Informed Decisions**: See all options side-by-side with pricing, vehicle types, and time estimates
-   **Convenience**: No need to have multiple rideshare apps installed or switch between them

---

**Note**: This document describes features from the user's perspective. For technical implementation details, see `API_CONTRACT.yml`, `FRONTEND.md`, and `BACKEND.md`.

