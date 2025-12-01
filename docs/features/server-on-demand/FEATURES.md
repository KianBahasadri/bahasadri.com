# Server on Demand - User Features

**User-facing feature description from the user's perspective. This document describes what users can do and what the feature provides.**

## Overview

An on-demand VPS provisioning service that allows users to spin up virtual private servers with a single click. Servers are automatically deprovisioned after a set time period, and users can interact with their servers through a browser-based terminal interface. The service supports multiple cloud providers and automatically generates SSH keys for secure access.

## Key Features

### One-Click VPS Provisioning

Users can spin up a VPS on demand with a single button click. The system handles all the complexity of provisioning, configuration, and setup automatically.

### Server Size Selection

Users can choose from various server sizes (e.g., small, medium, large) with different CPU, RAM, and storage configurations. Each size option displays its specifications and pricing.

### Cost Estimation

Before provisioning, users see an estimated cost for the selected server size and duration. The system calculates costs based on the chosen size and countdown timer duration, helping users make informed decisions.

### Multi-Cloud Provider Support

The service works with multiple cloud providers, allowing users to choose their preferred provider or let the system select the best available option.

### Configurable Countdown Timer

Users can manually adjust the countdown timer before provisioning, with a maximum limit of $5 in usage based on the selected server size. The timer displays the remaining time until automatic deprovisioning and updates in real-time.

### Automatic SSH Key Generation

The system automatically generates SSH key pairs for each provisioned server. Users receive the private key they can use to connect to the server via SSH from their local machine.

### Browser-Based Terminal

Users can open a terminal directly in the browser to run commands on their provisioned server. This provides immediate access without needing to configure SSH clients or manage keys manually.

### Terminal Shortcut Commands

The browser terminal supports custom `/` commands that are automatically translated by the backend into full commands before being sent to the server. For example, `/deploy` might translate to a full deployment script. Users can configure these shortcuts on the main page before provisioning, allowing for personalized command aliases.

## User Workflows

### Spin Up a New Server

**Goal**: Provision a VPS server on demand

**Steps**:

1. Navigate to the Server on Demand page
2. Select a server size (small, medium, large, etc.)
3. Optionally select a cloud provider (or use default)
4. Configure terminal shortcuts (optional - set up `/` commands that will be available in the browser terminal)
5. Adjust the countdown timer duration (up to $5 maximum usage based on selected size)
6. Review the cost estimate for the selected configuration
7. Click the "Spin Up Server" button
8. Wait for provisioning to complete (typically 30-60 seconds)
9. View the server details, SSH key, and countdown timer
10. Optionally open the browser terminal to start using the server

**Result**: A fully provisioned VPS server ready for use, with SSH access credentials, a browser terminal interface, and configured shortcut commands

### Use the Browser Terminal

**Goal**: Run commands on the provisioned server through the browser

**Steps**:

1. After server is provisioned, click "Open Terminal" button
2. Terminal interface appears in the browser
3. Type commands and press Enter to execute
4. Use custom `/` shortcut commands (e.g., `/deploy`, `/status`) that are automatically translated by the backend
5. See command output in real-time
6. Use standard terminal features (command history, etc.)

**Result**: Full terminal access to the server without leaving the browser, with support for custom shortcut commands

### Configure Terminal Shortcuts

**Goal**: Set up custom `/` commands for the browser terminal

**Steps**:

1. On the Server on Demand main page, before provisioning
2. Navigate to the "Terminal Shortcuts" section
3. Add custom shortcuts (e.g., `/deploy` → `npm run build && pm2 restart app`)
4. Save the shortcut configuration
5. These shortcuts will be available in the browser terminal after server provisioning

**Result**: Personalized command shortcuts that make common tasks faster and easier

### Connect via SSH from Local Machine

**Goal**: Connect to the server using SSH from a local terminal

**Steps**:

1. After server is provisioned, view the displayed SSH key
2. Copy the private key to local machine
3. Set appropriate permissions on the key file
4. Use SSH command with the provided server IP and key
5. Connect and use the server normally

**Result**: SSH access to the server from local machine

### Monitor Server Lifecycle

**Goal**: Track when the server will be automatically deprovisioned

**Steps**:

1. After server is provisioned, view the countdown timer
2. Timer displays remaining time until deprovisioning
3. Timer updates in real-time
4. View the cost breakdown showing how much has been spent and remaining budget
5. When timer reaches zero, server is automatically deprovisioned

**Result**: Clear visibility into server lifecycle, cost tracking, and automatic cleanup

## User Capabilities

-   Spin up VPS servers on demand with one click
-   Select from various server sizes with different specifications
-   View cost estimates before provisioning
-   Adjust countdown timer duration (up to $5 maximum usage based on size)
-   Configure custom terminal shortcut commands before provisioning
-   Choose from multiple cloud providers
-   View and copy SSH keys for server access
-   Use browser-based terminal to run commands on servers
-   Use custom `/` shortcut commands in the terminal that are auto-translated by the backend
-   Monitor countdown timer and cost tracking until automatic deprovisioning
-   Connect to servers via SSH from local machine using provided keys

## Use Cases

### Quick Development Environment

Spin up a temporary server for testing, development, or experimentation without long-term commitment or manual setup.

### Temporary Compute Tasks

Run one-off scripts, data processing, or other compute tasks on a fresh server that automatically cleans up when done.

### Learning and Experimentation

Provision servers to learn new technologies, test configurations, or experiment with different setups without worrying about cleanup.

### On-Demand Testing

Quickly provision servers for testing applications, running CI/CD tasks, or validating configurations in isolated environments.

## User Benefits

-   **Simplicity**: One-click provisioning eliminates complex setup processes
-   **Cost Control**: Automatic deprovisioning with $5 maximum usage limit prevents unexpected charges
-   **Cost Transparency**: Cost estimates before provisioning and real-time cost tracking help manage spending
-   **Flexibility**: Support for multiple cloud providers and server sizes gives options and customization
-   **Efficiency**: Custom terminal shortcuts reduce repetitive typing and speed up common tasks
-   **Convenience**: Browser terminal provides immediate access without SSH client configuration
-   **Transparency**: Countdown timer and cost breakdown clearly show server lifecycle and spending
-   **Security**: Automatic SSH key generation ensures secure access without manual key management

---

**Note**: This document describes features from the user's perspective. For technical implementation details, see `API_CONTRACT.md`, `FRONTEND.md`, and `BACKEND.md`.
