# StartGenie AI Detailed Project Documentation

## 1. Project Introduction

StartGenie AI is a full-stack web application designed to help students, founders, and early-stage entrepreneurs move from a raw business idea to a structured startup plan. The platform combines authentication, conversational AI, retrieval-augmented generation, AI image generation, document export, and persistent data storage in one system.

The project is divided into two major parts:

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + MongoDB + OpenAI APIs

The application solves a practical problem: many users have startup ideas but do not know how to validate them, structure them, prepare a plan, or present them confidently. StartGenie AI acts as an intelligent startup assistant that guides them through this process.

## 2. Main Objectives

The project was built to achieve the following goals:

- help users discuss and validate startup ideas through AI chat
- generate a structured startup blueprint from simple user inputs
- support file-based and prompt-based AI visual generation
- maintain user data, chat history, blueprint history, and generated assets
- export startup blueprints into presentation-ready formats
- provide a modern, user-friendly web dashboard for academic and practical use

## 3. Technology Stack

### Frontend

- React 19
- React Router DOM
- Vite
- Tailwind CSS
- Browser Local Storage

### Backend

- Node.js
- Express.js
- JWT authentication
- bcryptjs
- multer
- google-auth-library
- nodemailer
- Mongoose-based MongoDB models in `backend/services/mongo.js`

### AI and Export Services

- OpenAI Chat Completions API
- OpenAI Embeddings API
- OpenAI Image Generation API
- PDFKit
- docx
- PptxGenJS

## 4. High-Level System Architecture

The system follows a client-server architecture.

```text
User
  |
  v
React Frontend (Vite)
  |
  | HTTP / JSON / FormData
  v
Express Backend API
  |
  +--> MongoDB
  |      - users
  |      - chats
  |      - library files
  |      - blueprints
  |
  +--> OpenAI APIs
  |      - chat completions
  |      - embeddings
  |      - image generation
  |
  +--> Local File Storage
         - uploads/
         - knowledge-base JSON
         - public knowledge JSON
         - vector-index JSON
```

### Architectural Roles

- The frontend handles user interaction, route navigation, input forms, session storage, and dashboard rendering.
- The backend handles authentication, database operations, AI calls, retrieval logic, file export, and image generation.
- MongoDB stores core application data.
- Local JSON files support the knowledge base and vector retrieval layer.
- OpenAI powers the AI advisor, blueprint generator, embeddings-based retrieval, and diagram generation.

## 5. Project Folder Structure

```text
StartGenieAI_React/
|-- src/
|   |-- components/
|   |-- lib/
|   |-- pages/
|   |-- App.jsx
|   |-- main.jsx
|
|-- backend/
|   |-- data/
|   |-- scripts/
|   |-- services/
|   |-- server.js
|
|-- public/
|-- package.json
|-- README.md
|-- PROJECT_DOCUMENTATION.md
```

### Important Frontend Files

- `src/main.jsx`: frontend entry point
- `src/App.jsx`: route registration
- `src/lib/api.js`: shared API helper and token attachment logic
- `src/pages/Login.jsx`: email/password login page
- `src/pages/Signup.jsx`: user registration page
- `src/pages/VerifyEmail.jsx`: verification page
- `src/pages/SetPassword.jsx`: password setup for Google users
- `src/pages/AIAdvisor.jsx`: main dashboard with chat, library, history, settings, and blueprint tabs
- `src/pages/GenerateBlueprint.jsx`: blueprint generation flow
- `src/pages/Settings.jsx`: profile, security, and preference management
- `src/components/GoogleSignInButton.jsx`: Google sign-in integration

### Important Backend Files

- `backend/server.js`: main Express server and REST API definitions
- `backend/services/mongo.js`: MongoDB connection and schema definitions
- `backend/services/ragService.js`: knowledge-base loading and retrieval logic
- `backend/services/vectorStoreService.js`: embeddings index creation and cosine similarity search
- `backend/services/blueprintService.js`: structured blueprint generation and export builders
- `backend/services/publicIngestService.js`: validation and summarization for public knowledge ingestion
- `backend/data/knowledge-base.json`: internal startup knowledge chunks
- `backend/data/public-knowledge-base.json`: optional ingested public knowledge chunks
- `backend/data/vector-index.json`: persisted embeddings index

## 6. Full Project Working From Scratch

This section explains the complete project lifecycle from initial load to final output.

### Step 1: User Opens the Application

- The frontend starts from `src/main.jsx`.
- `App.jsx` loads the React Router configuration.
- Public routes such as landing page, login, signup, docs, blog, and contact are available without authentication.

### Step 2: User Creates an Account or Signs In

- The user can register using email/password or use Google sign-in.
- After successful login, the backend returns a JWT token.
- The frontend stores the token and user object in local storage using `setSession()` in `src/lib/api.js`.

### Step 3: Dashboard Initialization

When the user enters `/ai-advisor`:

- the frontend checks whether a token exists
- if the token is missing, the user is redirected to `/login`
- if the token exists, the frontend calls:
  - `GET /api/auth/me`
  - `GET /api/chats`
  - `GET /api/library`
- the latest chat becomes active
- AI-generated visuals are loaded into the Library view

### Step 4: User Interacts With Main Features

The dashboard offers these functional areas:

- AI Chat
- Library
- Generate Blueprint
- History
- Settings

### Step 5: Backend Processes Requests

For each action:

- the frontend calls the backend through the shared `api()` helper
- the backend validates the request
- protected routes use JWT middleware
- MongoDB is queried or updated
- if needed, OpenAI services are called
- the backend returns JSON or a downloadable file

### Step 6: Results Are Stored and Reused

- chats are saved in MongoDB
- blueprints are saved in MongoDB
- generated images are saved under `backend/uploads`
- image metadata is stored in the `LibraryFile` collection
- blueprint export content is generated dynamically when requested

## 7. Frontend Flow Step by Step

## 7.1 Entry and Routing

The frontend uses React Router for navigation. Routes defined in `src/App.jsx` include:

- `/`
- `/login`
- `/signup`
- `/verify-email`
- `/set-password`
- `/api`
- `/docs`
- `/about`
- `/blog`
- `/contact`
- `/ai-advisor`
- `/settings`

## 7.2 Shared API Helper

`src/lib/api.js` centralizes frontend-backend communication.

Its responsibilities are:

- set base URL using `VITE_API_BASE_URL` or fallback to `/api`
- attach `Content-Type: application/json` unless the request body is `FormData`
- automatically include `Authorization: Bearer <token>` if a session exists
- parse JSON or text responses
- throw friendly errors when the backend returns a failure response

## 7.3 Login and Signup Flow

### Signup

`Signup.jsx`:

- collects name, email, password, confirm password
- requires terms acceptance
- submits to `POST /api/auth/signup`
- shows backend confirmation message
- redirects to login

### Login

`Login.jsx`:

- collects email and password
- sends `POST /api/auth/login`
- stores token and user via `setSession()`
- redirects to `/ai-advisor`

### Google Login

`GoogleSignInButton.jsx`:

- loads Google credential flow
- sends credential token to `POST /api/auth/google`
- backend verifies it
- frontend redirects to dashboard or password setup page

## 7.4 Dashboard Flow

The main logged-in experience is handled by `AIAdvisor.jsx`.

Important frontend responsibilities:

- load profile, chats, and library data at startup
- switch tabs between chat, library, blueprint, history, and settings
- maintain theme mode and sidebar state in local storage
- append temporary messages before backend confirmation
- refresh chat and library state after backend operations

## 7.5 Chat Flow in the Frontend

When the user sends a message:

1. `handleSend()` validates the input.
2. A temporary user message is shown immediately in the UI.
3. The frontend sends `POST /api/chats/:chatId/messages`.
4. The backend returns the saved chat with AI response.
5. The frontend replaces temporary content with persisted chat messages.
6. If an AI visual was generated, the Library tab is updated too.

## 7.6 File Upload Flow in the Frontend

When the user uploads a file:

1. `handleFileUpload()` posts a text note into the current chat.
2. The file is sent as `FormData` to `POST /api/library/upload`.
3. The frontend then refreshes chat history and library state.
4. The generated AI diagram becomes visible in the Library tab.

## 7.7 Blueprint Flow in the Frontend

`GenerateBlueprint.jsx` implements a guided multi-step experience:

1. user enters idea, location, category, budget, and currency unit
2. user optionally clicks `Ask AI Questions`
3. frontend calls `POST /api/blueprints/questions`
4. backend returns five clarifying questions
5. user answers any of them
6. user clicks `Generate`
7. frontend calls `POST /api/blueprints/generate`
8. backend returns a preview object and progress messages
9. user can export the result as PDF, PPT, Word, Text, or Email

## 7.8 Settings Flow in the Frontend

`Settings.jsx` is divided into:

- Profile
- Security
- Preferences

Available actions:

- update name, email, about, avatar
- set or change password
- toggle analytics preference
- delete account
- log out

## 8. Backend Flow Step by Step

## 8.1 Backend Startup

The backend starts from `backend/server.js`.

Startup sequence:

1. load environment variables
2. create Express app
3. enable CORS
4. enable JSON body parsing
5. expose `/uploads` as a static folder
6. configure in-memory rate limiters
7. configure `multer` storage
8. initialize OpenAI client if API key exists
9. connect to MongoDB through `connectMongo()`
10. start Express on port `4000` or configured `PORT`

## 8.2 Core Backend Responsibilities

The backend manages:

- authentication and authorization
- email verification
- Google login verification
- chat storage and AI replies
- image generation and library management
- blueprint generation
- export generation
- retrieval-augmented generation
- account deletion and profile updates

## 8.3 Authentication Middleware

Protected routes use the `auth()` middleware:

- reads the `Authorization` header
- extracts the JWT token
- verifies it using `jsonwebtoken`
- sets `req.userId`
- rejects invalid or expired tokens

## 8.4 Rate Limiting

The backend uses custom in-memory rate limiters for:

- chat requests
- image generation requests
- blueprint generation requests
- RAG query requests

This protects expensive AI endpoints from rapid repeated usage.

## 9. MongoDB Database Structure and Usage

MongoDB is the primary persistent storage layer of the current backend implementation. Mongoose schemas are defined in `backend/services/mongo.js`.

The application uses four main collections:

- `users`
- `chats`
- `libraryfiles`
- `blueprints`

## 9.1 Users Collection

Purpose:

- store account data
- support login, Google auth, verification, and settings

Important fields:

- `id`
- `name`
- `email`
- `passwordHash`
- `emailVerified`
- `emailVerificationTokenHash`
- `emailVerificationExpiresAt`
- `googleSub`
- `about`
- `allowAnalytics`
- `avatarUrl`
- `createdAt`

Usage:

- email signup
- email login
- Google sign-in
- profile update
- password change
- account deletion

## 9.2 Chats Collection

Purpose:

- store conversation history for each user

Important fields:

- `id`
- `userId`
- `name`
- `messages`
- `createdAt`
- `updatedAt`

Message objects can include:

- `id`
- `sender`
- `type`
- `text`
- `imageUrl`
- `createdAt`
- `feedback`
- `regenerated`

Usage:

- AI chat persistence
- chat rename/delete
- chat history view
- feedback on AI responses
- regenerate last response

## 9.3 LibraryFiles Collection

Purpose:

- store metadata for AI-generated visuals

Important fields:

- `id`
- `userId`
- `name`
- `type`
- `prompt`
- `url`
- `createdAt`

Usage:

- diagram gallery in Library tab
- prompt-based image generation
- upload-based image generation
- blueprint-related visual storage

## 9.4 Blueprints Collection

Purpose:

- store generated startup plans and related metadata

Important fields:

- `id`
- `userId`
- `idea`
- `location`
- `category`
- `budget`
- `unit`
- `extraContext`
- `qa`
- `structured`
- `retrievedKnowledge`
- `blueprintVisual`
- `status`
- `createdAt`

Usage:

- blueprint preview
- export generation
- saved history of startup planning work

## 10. Authentication Flow

## 10.1 Email Signup Flow

1. User fills signup form.
2. Frontend sends `POST /api/auth/signup`.
3. Backend validates required fields.
4. Backend checks whether the email already exists.
5. Password is hashed using `bcrypt`.
6. Email verification token data is prepared.
7. User document is inserted into MongoDB.
8. A default chat is created automatically.
9. If email verification is enabled, a verification email is sent or the link is printed in console.

## 10.2 Email Verification Flow

1. User opens `/verify-email?token=...`.
2. Frontend calls `GET /api/auth/verify-email`.
3. Backend hashes the token.
4. Backend looks up the matching token hash in MongoDB.
5. If valid, `emailVerified` becomes `true`.
6. Verification token fields are cleared.

## 10.3 Email Login Flow

1. User submits email and password.
2. Frontend calls `POST /api/auth/login`.
3. Backend fetches the user by email.
4. Backend checks email verification if required.
5. Backend compares the password against `passwordHash`.
6. Backend generates JWT.
7. Frontend stores token and user details.
8. User enters the dashboard.

## 10.4 Google Sign-In Flow

1. User signs in with Google.
2. Frontend receives Google credential token.
3. Frontend posts it to `POST /api/auth/google`.
4. Backend verifies the credential using `google-auth-library`.
5. Backend creates or updates the user.
6. A default chat is created for first-time users.
7. Backend issues a JWT token.
8. Frontend redirects to dashboard or password setup page.

## 10.5 Password Setup for Google Users

If a Google-authenticated user has no saved password:

- frontend sends `PUT /api/users/me/password`
- backend hashes and stores the new password
- the same account can then use email/password login too

## 11. AI Chat Feature Implementation

The AI Chat feature is the core interaction mode of the system.

### Backend Chat Flow

1. Route: `POST /api/chats/:chatId/messages`
2. JWT authentication is validated.
3. Backend checks whether the chat belongs to the user.
4. User message is appended to the chat document.
5. If the chat still has a default title like `Chat 1`, it is auto-renamed using the first user message.
6. Backend checks whether the message implies a visual request using `shouldGenerateVisual()`.
7. If visual generation is required:
   - OpenAI image generation is called
   - image file is saved in `uploads`
   - image metadata is saved in `LibraryFile`
   - an AI image message is pushed into chat
8. Backend generates the AI text response.
9. AI message is appended.
10. Chat document is saved and returned.

### Chat-Specific Features

- create new chat
- rename chat
- delete chat
- regenerate the latest AI response
- provide up/down feedback on AI responses

## 12. RAG and Knowledge Retrieval Flow

RAG stands for Retrieval-Augmented Generation. It improves AI output by giving the language model relevant startup-specific context before generating a response.

### Knowledge Sources

- `backend/data/knowledge-base.json`
- `backend/data/public-knowledge-base.json`

These contain chunked domain knowledge such as:

- startup planning guidance
- legal/compliance notes
- market and business model concepts
- operations and product advice

### Retrieval Process

1. The backend loads all knowledge chunks.
2. `ensureVectorIndex()` creates or reuses embeddings in `vector-index.json`.
3. When a user query arrives, the query is embedded.
4. Cosine similarity is computed against stored chunk embeddings.
5. Top-ranked chunks are selected.
6. These chunks are added into the OpenAI prompt as context.

### Where RAG Is Used

- AI advisor chat replies
- structured blueprint generation
- manual RAG testing through `/api/rag/query`

### Why It Matters

RAG improves:

- domain relevance
- consistency of guidance
- legal/compliance awareness
- quality of generated startup plans

## 13. Library and Image Generation Feature

The Library tab stores AI-generated visuals for later viewing and download.

### Prompt-Based Generation

Route: `POST /api/library/generate`

Flow:

1. frontend submits a prompt
2. backend calls OpenAI image generation
3. generated image is saved in `backend/uploads`
4. metadata is saved in `LibraryFile`
5. frontend refreshes the Library view

### Upload-Based Generation

Route: `POST /api/library/upload`

Flow:

1. user uploads a file
2. backend stores the file temporarily through `multer`
3. backend generates a prompt based on file context
4. OpenAI creates a related business visual
5. the generated image is stored locally
6. metadata is stored in MongoDB
7. frontend refreshes chat and library

## 14. Blueprint Generator Feature

This is the main planning and evaluation feature of the project.

### User Inputs

The blueprint generator accepts:

- startup idea
- location
- category
- budget range
- currency unit
- optional clarifying answers

### Clarifying Questions Flow

Route: `POST /api/blueprints/questions`

Flow:

1. frontend sends idea, location, category, budget, and unit
2. backend uses OpenAI to generate five focused questions
3. if OpenAI is unavailable, backend returns built-in fallback questions
4. user answers any subset of those questions

### Blueprint Generation Flow

Route: `POST /api/blueprints/generate`

Flow:

1. backend validates required fields
2. optional Q&A is converted into `extraContext`
3. `generateStructuredBlueprint()` is called
4. retrieval fetches relevant knowledge chunks
5. backend sends a strict JSON prompt to OpenAI
6. response JSON is normalized into a consistent structure
7. optional blueprint visual generation is executed
8. blueprint record is stored in MongoDB
9. blueprint visual metadata is stored in Library if created
10. frontend receives a compact preview and status lines

### Structured Blueprint Contents

The generated blueprint can include:

- title
- executive summary
- problem statement
- solution design
- target users
- market analysis
- business model
- operations plan
- legal and compliance
- financial plan
- risks and mitigation
- 90-day milestones
- investor pitch slides
- source references
- legal notice
- call to action
- optional diagram prompt

## 15. Export System

The blueprint export system converts generated startup plans into usable formats.

Route: `POST /api/blueprints/:id/export`

Supported formats:

- `text`
- `pdf`
- `word`
- `ppt`
- `email`

### Export Internals

- `buildTextExport()` builds plain text content
- `buildPdfExport()` uses PDFKit
- `buildDocxExport()` uses `docx`
- `buildPptxExport()` uses PptxGenJS
- `email` creates a PDF and sends it as an attachment through SMTP

### Why This Feature Is Important

This makes the project useful not only as an AI tool but also as a deliverable generator for:

- research submissions
- viva presentations
- startup proposal sharing
- investor-facing documents

## 16. API Flow and Integration

The application uses REST APIs defined mainly inside `backend/server.js`.

### Public Utility APIs

- `GET /api/health`
- `GET /api/config`

### Authentication APIs

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/request-email-verification`
- `GET /api/auth/verify-email`
- `GET /api/auth/me`

### User APIs

- `PUT /api/users/me`
- `PUT /api/users/me/password`
- `DELETE /api/users/me`

### Chat APIs

- `GET /api/chats`
- `POST /api/chats`
- `PATCH /api/chats/:chatId`
- `DELETE /api/chats/:chatId`
- `POST /api/chats/:chatId/messages`
- `POST /api/chats/:chatId/regenerate`
- `PATCH /api/chats/:chatId/messages/:messageId/feedback`

### Library APIs

- `GET /api/library`
- `POST /api/library/upload`
- `POST /api/library/generate`

### Blueprint APIs

- `POST /api/blueprints/questions`
- `POST /api/blueprints/generate`
- `POST /api/blueprints/:id/export`

### RAG APIs

- `GET /api/rag/validation-report`
- `POST /api/rag/query`

### General API Integration Pattern

1. user performs an action in React
2. frontend calls `api()` or `fetch()`
3. JWT is attached if needed
4. Express route validates the request
5. MongoDB is read or updated
6. OpenAI is called when AI output is required
7. response is returned as JSON or file
8. frontend updates UI state

## 17. Feature-by-Feature Implementation Summary

### Landing and Static Pages

- public informational pages for product introduction and navigation

### Signup and Login

- manual email/password authentication
- Google sign-in option

### Email Verification

- token-based email verification with hashed token storage

### AI Chat

- conversational startup assistance
- RAG-supported responses
- optional AI diagram generation from visual requests

### Chat History

- previous chats listed and restorable
- rename and delete supported

### Library

- stores generated AI visuals
- allows preview and download

### File Upload + Visual Generation

- upload a file
- backend generates a related business diagram

### Blueprint Questions

- clarifying questions before blueprint generation

### Blueprint Generator

- creates a structured startup plan
- stores the result for later export

### Export System

- PDF, PPT, Word, Text, and Email export options

### Settings

- profile update
- avatar upload
- password management
- analytics preference
- account deletion

## 18. End-to-End Example

### Scenario: A New User Generates a Startup Blueprint

1. user opens the landing page
2. user signs up with email and password
3. backend stores the user in MongoDB
4. backend creates a default chat
5. user verifies email if verification is enabled
6. user logs in
7. frontend stores JWT token
8. dashboard loads profile, chats, and library
9. user opens the Blueprint tab
10. user enters a startup idea, location, category, and budget
11. user asks AI clarifying questions
12. backend returns five questions
13. user answers some questions
14. user clicks Generate
15. backend retrieves relevant knowledge chunks using embeddings
16. OpenAI generates a structured startup blueprint
17. backend optionally generates a matching visual
18. blueprint and visual metadata are stored
19. frontend shows the preview
20. user exports the blueprint as PPT or PDF

## 19. Security Mechanisms

The project includes the following security-oriented controls:

- JWT-based route protection
- password hashing using bcrypt
- hashed email verification tokens
- ownership checks on user-specific resources
- rate limiting on costly AI endpoints
- basic server-side validation

## 20. Limitations

Current limitations of the project include:

- no automated test suite included in the repository
- AI output quality depends on external API availability and prompt quality
- uploaded files are used mainly for context naming, not deep content extraction
- in-memory rate limiting resets on server restart
- chat messages are stored inside chat documents and may require pagination for large-scale usage

## 21. Future Enhancements

Possible future upgrades:

- real-time collaboration
- richer file parsing and summarization
- multilingual support
- admin dashboard
- cloud object storage for uploads
- better validation and stronger production hardening
- CI/CD and automated testing
- deeper citation-based retrieval
- startup scoring and recommendation engine

## 22. Academic and Viva Value

This project is suitable for final-year evaluation because it demonstrates:

- full-stack development
- database design
- authentication and authorization
- REST API integration
- AI service orchestration
- retrieval-augmented generation
- document generation
- modern frontend dashboard design

It is not a simple static website. It is an interactive intelligent system with real persistence, real APIs, AI-generated outputs, and exportable business artifacts.

## 23. Short Viva Summary

StartGenie AI is a full-stack AI-based startup assistant built with React, Node.js, Express, MongoDB, and OpenAI APIs. Users can create accounts, log in, chat with an AI startup advisor, generate business diagrams, create structured startup blueprints, and export those blueprints as PDF, Word, PPT, Text, or Email. The system uses JWT authentication for protected access, MongoDB for persistent storage, and a retrieval-augmented generation pipeline that combines embeddings with a startup knowledge base to improve AI answer quality. This makes the project both technically strong and academically relevant.

