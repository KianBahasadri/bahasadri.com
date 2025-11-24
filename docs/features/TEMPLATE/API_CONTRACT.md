openapi: 3.1.0
info:
title: Feature API
description: >-
API contract document defining the interface between frontend and backend.
This serves as the single source of truth for coupling.
version: 1.0.0
servers:

-   url: http://localhost:8787/api
    description: Development Server
-   url: https://bahasadri.com/api
    description: Production Server

components:
securitySchemes: # EDIT THIS: Choose your actual auth method (e.g., JWT Bearer)
BearerAuth:
type: http
scheme: bearer
bearerFormat: JWT

schemas: # ------------------------------------------------------------------------- # SHARED DATA MODELS # -------------------------------------------------------------------------
ErrorResponse:
type: object
required: - error
properties:
error:
type: string
description: A descriptive error message.
example: "Invalid input provided."
code:
type: string
description: Machine-readable error code.
enum: [INVALID_INPUT, NOT_FOUND, INTERNAL_ERROR]
example: INVALID_INPUT

    # Replace [ModelName] with your actual data model (e.g., Slide, User)
    FeatureModel:
      type: object
      required:
        - id
        - name
        - createdAt
      properties:
        id:
          type: string
          format: uuid
          description: Unique identifier for the resource.
          example: "123e4567-e89b-12d3-a456-426614174000"
        name:
          type: string
          description: Name of the feature item.
          example: "My Awesome Feature"
        createdAt:
          type: string
          format: date-time
          description: Timestamp of creation.
          example: "2023-10-27T10:00:00Z"

# ---------------------------------------------------------------------------

# STANDARD RESPONSES (Reusable)

# ---------------------------------------------------------------------------

responses:
BadRequest:
description: Invalid input provided (400).
content:
application/json:
schema:
$ref: '#/components/schemas/ErrorResponse'
examples:
invalid_input:
value:
error: "Field 'name' is required."
code: "INVALID_INPUT"

    Unauthorized:
      description: Authentication required (401).
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'

    NotFound:
      description: Resource not found (404).
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            not_found:
              value:
                error: "Feature with ID 123 not found."
                code: "NOT_FOUND"

    InternalError:
      description: Server error (500).
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/ErrorResponse'
          examples:
            server_error:
              value:
                error: "Unexpected database error."
                code: "INTERNAL_ERROR"

paths:

# ---------------------------------------------------------------------------

# ENDPOINTS

# ---------------------------------------------------------------------------

# EDIT THIS: Replace [feature-name] and [endpoint] with actual paths

/feature-name/items:
get:
operationId: getFeatureItems
summary: Retrieve a list of feature items
description: Fetches all available items for this feature.
security: - BearerAuth: [] # Remove if auth is not required
responses:
'200':
description: A list of feature items.
content:
application/json:
schema:
type: array
items:
$ref: '#/components/schemas/FeatureModel'
'401':
$ref: '#/components/responses/Unauthorized'
'500':
$ref: '#/components/responses/InternalError'

    post:
      operationId: createFeatureItem
      summary: Create a new feature item
      description: Adds a new item to the collection.
      security:
        - BearerAuth: []
      requestBody:
        required: true
        content:
          application/json:
            schema:
              type: object
              required:
                - name
              properties:
                name:
                  type: string
                  example: "New Item Name"
      responses:
        '201':
          description: Item successfully created.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FeatureModel'
        '400':
          $ref: '#/components/responses/BadRequest'
        '401':
          $ref: '#/components/responses/Unauthorized'
        '500':
          $ref: '#/components/responses/InternalError'

/feature-name/items/{id}:
parameters: - name: id
in: path
required: true
description: The ID of the item to manipulate.
schema:
type: string
format: uuid

    get:
      operationId: getFeatureItemById
      summary: Get a specific item
      security:
        - BearerAuth: []
      responses:
        '200':
          description: The requested item details.
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/FeatureModel'
        '404':
          $ref: '#/components/responses/NotFound'
        '500':
          $ref: '#/components/responses/InternalError'
