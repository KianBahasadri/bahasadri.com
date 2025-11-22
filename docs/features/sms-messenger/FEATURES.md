# SMS Messenger - User Features

**User-facing feature description from the user's perspective. This document describes what users can do and what the feature provides.**

## Overview

An SMS messaging utility that allows users to send and receive text messages directly from their browser. Features include message history, threaded conversations, contact management, and real-time message updates.

## Key Features

### Send SMS Messages

Users can send text messages to any phone number directly from the web interface. Messages are sent via SMS and delivered to the recipient's phone.

### Receive SMS Messages

Users can receive incoming SMS messages in real-time. Messages appear in the chat interface automatically, organized by conversation thread.

### Message History

All sent and received messages are stored and displayed in a chat-style interface. Users can view complete conversation history with any contact.

### Threaded Conversations

Messages are organized into conversation threads, one per phone number. Users can easily switch between different conversations and see message history for each.

### Contact Management

Users can create and manage contact aliases, assigning friendly names to phone numbers for easier identification in conversations.

### Real-Time Updates

New messages appear automatically without needing to refresh the page. The interface polls for updates and displays new messages as they arrive.

## User Workflows

### Send a Message

**Goal**: Send an SMS message to someone

**Steps**:

1. Navigate to the SMS messenger page
2. Enter a phone number (or select from contacts)
3. Type a message
4. Click send or press Enter
5. Message is sent and appears in the conversation

**Result**: SMS message is delivered to the recipient's phone

### View Conversation History

**Goal**: See all messages with a specific person

**Steps**:

1. Navigate to the SMS messenger page
2. View the list of conversation threads in the sidebar
3. Click on a thread to view all messages with that contact
4. Scroll through message history

**Result**: Complete conversation history is displayed

### Receive and Reply to Messages

**Goal**: Respond to an incoming SMS message

**Steps**:

1. New message appears automatically in the interface
2. Click on the conversation thread
3. Read the incoming message
4. Type a reply
5. Send the message

**Result**: Reply is sent and conversation continues

### Manage Contacts

**Goal**: Add a friendly name to a phone number

**Steps**:

1. Navigate to the SMS messenger page
2. Open the contacts section
3. Click "Add Contact"
4. Enter phone number and display name
5. Save the contact

**Result**: Phone number now displays with the friendly name in conversations

## User Capabilities

-   Send SMS messages to any phone number
-   Receive SMS messages in real-time
-   View complete message history
-   Organize messages into conversation threads
-   Create and manage contact aliases
-   See message timestamps and status
-   Switch between multiple conversations
-   See unread message indicators

## Use Cases

### Personal SMS Management

Manage SMS conversations from a computer instead of a phone, useful for typing longer messages or managing multiple conversations.

### Business Communication

Send and receive SMS messages for business purposes, with the ability to organize conversations and maintain contact lists.

### Message Backup

Keep a complete history of SMS conversations in the cloud, accessible from any device with a web browser.

### Multi-Device Access

Access SMS messages from any device with internet access, not limited to a single phone.

## User Benefits

-   **Convenient**: Send and receive SMS from a computer with a full keyboard
-   **Organized**: Threaded conversations make it easy to follow multiple discussions
-   **Persistent**: Message history is stored and accessible anytime
-   **Real-Time**: New messages appear automatically without refreshing
-   **Contact Management**: Friendly names make it easier to identify conversations
-   **Accessible**: Works from any device with a web browser
-   **Reliable**: Messages are delivered via established SMS infrastructure

---

**Note**: This document describes features from the user's perspective. For technical implementation details, see `API_CONTRACT.md`, `FRONTEND.md`, and `BACKEND.md`.
