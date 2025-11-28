# Security Documentation

Security considerations, current state, and protection mechanisms for bahasadri.com.

## Backend API Protection

**Status**: ✅ **Protected via Cloudflare Zero Trust**

The backend API has **no built-in authentication or authorization** mechanisms in the application code. However, infrastructure-level protection is provided by Cloudflare Zero Trust.

### Cloudflare Zero Trust

-   Blocks all requests made to `bahasadri.com`
-   All API requests are forced to go through service bindings or fail
-   Provides infrastructure-level access control

!!! publicly accessible: `/api/sms-messenger/webhook`

-   **Location**: `backend/src/sms-messenger/index.ts` (webhook endpoint)
-   **Protection**: Validates Twilio signatures for incoming webhooks
-   **Scope**: Only protects the Twilio webhook endpoint, not general API access, necessary so twilio can send the backend incoming messages

### Cloudflare Service Access

-   **R2 Bucket**: Not publicly accessible
-   **KV**: Not publicly accessible
-   **D1**: Not publicly accessible

All Cloudflare services are only accessible through Workers service bindings.

### Information Leakage

things that should never be in code:

-   api keys
-   usenet provider
-   passwords and credentials
-   database connection strings
-   secret keys and tokens (session secrets, encryption keys, etc.)
-   OAuth client secrets
-   webhook secrets and signing keys
-   Cloudflare API tokens and keys
-   service account credentials
-   personal information (PII) - email addresses, phone numbers, etc.
-   internal service URLs and endpoints
