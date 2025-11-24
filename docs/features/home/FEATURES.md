# Home Page - User Features

**Landing page that serves as the entry point to the application, showcasing available tools with a distinctive terminal/cyberpunk aesthetic.**

## Overview

The home page is the main landing page of the application. It presents users with a visually striking interface featuring terminal scanlines, particle effects, and a screen border glow. Users can browse available tools and navigate to enabled features.

## Key Features

### Visual Terminal Aesthetic

The page features a terminal/cyberpunk design with:

-   Terminal scanline background effects
-   Animated particle system with emoji particles (♡, 💊, 🩹, ✨, 💕, 💉, 🔪, 💖)
-   Glowing screen border with pulsing animation
-   Dark theme with pink/cyan terminal color accents

### Tool Discovery

Users can view all available tools at /docs/features in a grid layout

### Interactive Feedback

-   Hover effects on enabled tool cards trigger a heartbeat sound effect
-   Visual feedback distinguishes enabled tools (clickable) from disabled tools
-   Smooth transitions and animations enhance user experience

### Yandere Agent Chatbox

Users can interact with the yandere agent through a chatbox interface:

-   Real-time conversation with the yandere agent
-   Message history displayed in a chat-style interface
-   Terminal/cyberpunk aesthetic matching the home page design
-   Agent responds with yandere personality traits
-   Conversation persists across page refreshes (managed server-side)

### Randomly Generated Welcome Message

The hero section displays a randomly selected welcome message from a pre-generated list of yandere-themed greetings. Each time a user visits or refreshes the home page, they see a different message, adding variety and personality to the landing experience. Messages are styled with terminal/cyberpunk effects including glitch animations and glowing text shadows, matching the overall aesthetic of the page.

## User Workflows

### Browsing Available Tools

**Goal**: Discover and access available tools

**Steps**:

1. User lands on the home page
2. User views the hero section with a randomly selected message from a pre-generated list, e.g. "You entered my domain~ ♡"
3. User hovers over enabled tool cards to hear heartbeat sound
4. User clicks on an enabled tool card to navigate to that tool

**Result**: User navigates to the selected tool page

### Viewing Disabled Tools

**Goal**: See what tools are planned or under development

**Steps**:

1. User views the tools grid
2. User identifies disabled tools (non-clickable cards)
3. User understands which features are not yet available

**Result**: User is aware of upcoming features

### Chatting with the Yandere Agent

**Goal**: Have a conversation with the yandere agent

**Steps**:

1. User opens the chatbox on the home page
2. User types a message in the input field
3. User sends the message (click send or press Enter)
4. Agent processes the message and generates a response
5. Agent's response appears in the chatbox
6. User continues the conversation by sending more messages

**Result**: User engages in a conversation with the yandere agent

## User Capabilities

-   View the landing page with visual effects
-   Browse all available tools in a grid layout
-   Navigate to enabled tools (SMS Messenger, Calculator)
-   See which tools are disabled/coming soon
-   Experience interactive hover effects with sound feedback
-   Chat with the yandere agent through the chatbox
-   View conversation history in the chatbox
-   Send messages and receive responses in real-time

## Use Cases

### Tool Discovery

Users can discover new tools they weren't aware of by browsing the tools grid on the home page.

### Interactive Experience

Users can engage with the yandere agent through the chatbox, creating an immersive and interactive experience that matches the terminal/cyberpunk aesthetic of the site.

## User Benefits

-   **Clear Navigation**: Easy access to all available tools from a single page
-   **Visual Appeal**: Engaging terminal/cyberpunk aesthetic creates a memorable experience
-   **Tool Discovery**: All tools are visible in one place, making it easy to find features
-   **Status Indication**: Clear visual distinction between enabled and disabled tools
-   **Interactive Feedback**: Hover effects provide engaging user interaction
-   **Engaging Interaction**: Chat with the yandere agent adds personality and interactivity to the landing page
-   **Immersive Experience**: The chatbox enhances the terminal/cyberpunk theme with conversational elements

---

**Note**: This document describes features from the user's perspective. For technical implementation details, see `API_CONTRACT.md`, `FRONTEND.md`, and `BACKEND.md`.
