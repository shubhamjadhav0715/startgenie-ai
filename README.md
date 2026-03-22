# StartGenie AI (Frontend + Backend)

## Frontend
From `StartGenieAI_React`:

```bash
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` (or next free port).

## Backend
From `StartGenieAI_React/backend`:

```bash
npm install
npm run dev
```

Backend runs on `http://localhost:4000`.

## Environment (optional)
Create `StartGenieAI_React/.env` to change API URL:

```bash
VITE_API_BASE_URL=http://localhost:4000/api
VITE_GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com
```

Create `StartGenieAI_React/backend/.env` for OpenAI-powered generation:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_IMAGE_MODEL=gpt-image-1
OPENAI_BLUEPRINT_MODEL=gpt-4.1-mini
OPENAI_EMBEDDING_MODEL=text-embedding-3-small

# Google login (required for Google sign-in)
GOOGLE_CLIENT_ID=your_google_oauth_client_id.apps.googleusercontent.com

# Email verification (optional)
EMAIL_VERIFICATION_REQUIRED=false
# SMTP_HOST=smtp.gmail.com
# SMTP_USER=your_email@gmail.com
# SMTP_PASS=your_app_password
```

## Implemented API
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `GET /api/auth/me`
- `PUT /api/users/me`
- `PUT /api/users/me/password`
- `DELETE /api/users/me`
- `GET /api/chats`
- `POST /api/chats`
- `PATCH /api/chats/:chatId`
- `DELETE /api/chats/:chatId`
- `POST /api/chats/:chatId/messages`
- `GET /api/library`
- `POST /api/library/upload`
- `POST /api/blueprints/generate`
- `POST /api/blueprints/:id/export`
- `GET /api/config`
- `GET /api/health`

Data is persisted in `backend/data/db.json`.
RAG vector index is persisted in `backend/data/vector-index.json`.
