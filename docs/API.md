# 📡 StartGenie AI - API Documentation

Complete API reference for the StartGenie AI backend.

**Base URL:** `http://localhost:8000` (Development)

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <access_token>
```

### POST `/api/auth/signup`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "password": "securepassword123",
  "full_name": "John Doe" // Optional
}
```

**Response:** `201 Created`
```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "username": "johndoe",
  "is_active": true,
  "is_verified": false,
  "created_at": "2026-01-19T10:00:00Z"
}
```

---

### POST `/api/auth/login`
Login and receive JWT access token.

**Request Body:** (Form Data)
```
username=user@example.com
password=securepassword123
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

---

### GET `/api/auth/me`
Get current authenticated user information.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "_id": "user_id",
  "email": "user@example.com",
  "username": "johndoe",
  "full_name": "John Doe",
  "is_active": true,
  "is_verified": false,
  "created_at": "2026-01-19T10:00:00Z"
}
```

---

### POST `/api/auth/logout`
Logout current user (client-side token removal).

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "message": "Successfully logged out"
}
```

---

## 📋 Blueprint Management

### POST `/api/blueprint/generate`
Generate a new startup blueprint using AI.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "startup_idea": "A mobile app that connects local farmers directly with consumers in tier-2 cities",
  "additional_context": {
    "budget": "10 lakhs",
    "timeline": "6 months",
    "location": "Pune"
  }
}
```

**Response:** `201 Created`
```json
{
  "_id": "blueprint_id",
  "user_id": "user_id",
  "startup_idea": "A mobile app that connects...",
  "status": "generating",
  "content": null,
  "generation_time": null,
  "created_at": "2026-01-19T10:00:00Z",
  "updated_at": "2026-01-19T10:00:00Z"
}
```

**Status Values:**
- `pending` - Queued for generation
- `generating` - Currently being generated
- `completed` - Generation complete
- `failed` - Generation failed

---

### GET `/api/blueprint/`
Get all blueprints for current user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `skip` (int, default: 0) - Number of blueprints to skip
- `limit` (int, default: 10) - Maximum blueprints to return

**Response:** `200 OK`
```json
[
  {
    "_id": "blueprint_id",
    "user_id": "user_id",
    "startup_idea": "...",
    "status": "completed",
    "content": { /* Blueprint content */ },
    "generation_time": 45.2,
    "created_at": "2026-01-19T10:00:00Z",
    "updated_at": "2026-01-19T10:01:00Z"
  }
]
```

---

### GET `/api/blueprint/{blueprint_id}`
Get a specific blueprint by ID.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "_id": "blueprint_id",
  "user_id": "user_id",
  "startup_idea": "...",
  "status": "completed",
  "content": {
    "startup_overview": {
      "suggested_names": ["FarmConnect", "AgriDirect", "FreshLink"],
      "industry": "AgriTech",
      "problem_statement": "...",
      "solution": "...",
      "unique_value_proposition": "..."
    },
    "market_analysis": {
      "target_audience": "...",
      "market_size": "...",
      "market_demand": "...",
      "industry_trends": ["...", "..."],
      "competitors": [
        {
          "name": "Competitor A",
          "strength": "...",
          "weakness": "..."
        }
      ]
    },
    "business_model": {
      "revenue_streams": ["...", "..."],
      "pricing_strategy": "...",
      "customer_acquisition": "..."
    },
    "swot_analysis": {
      "strengths": ["...", "..."],
      "weaknesses": ["...", "..."],
      "opportunities": ["...", "..."],
      "threats": ["...", "..."]
    },
    "budget_estimation": {
      "initial_setup_cost": 500000,
      "monthly_operational_expenses": 100000,
      "technology_cost": 200000,
      "marketing_cost": 150000,
      "breakdown": {
        "Development": 200000,
        "Marketing": 150000
      }
    },
    "funding_investment": {
      "funding_options": ["...", "..."],
      "government_schemes": [
        {
          "name": "Startup India Seed Fund",
          "amount": "Up to ₹20 lakhs",
          "eligibility": "..."
        }
      ],
      "investor_readiness_tips": ["...", "..."]
    },
    "legal_compliance": {
      "business_registration_type": "Private Limited Company",
      "required_licenses": ["GST", "FSSAI"],
      "taxation_basics": "...",
      "compliance_checklist": ["...", "..."]
    },
    "go_to_market_strategy": {
      "launch_plan": "...",
      "marketing_channels": ["...", "..."],
      "risks": ["...", "..."],
      "mitigation_strategies": ["...", "..."]
    },
    "action_roadmap": {
      "months_0_3": ["...", "..."],
      "months_3_6": ["...", "..."],
      "months_6_12": ["...", "..."]
    },
    "export_summary": "..."
  },
  "generation_time": 45.2,
  "created_at": "2026-01-19T10:00:00Z",
  "updated_at": "2026-01-19T10:01:00Z"
}
```

---

### DELETE `/api/blueprint/{blueprint_id}`
Delete a blueprint.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

### POST `/api/blueprint/{blueprint_id}/export/pdf`
Export blueprint as PDF.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK` (PDF file)

---

### POST `/api/blueprint/{blueprint_id}/export/ppt`
Export blueprint as PowerPoint.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK` (PPT file)

---

## 💬 Chat API

### POST `/api/chat/message`
Send a message to the AI assistant.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "message": "How can I improve my marketing strategy?",
  "blueprint_id": "blueprint_id" // Optional
}
```

**Response:** `200 OK`
```json
{
  "message": "How can I improve my marketing strategy?",
  "response": "Based on your blueprint, here are some suggestions...",
  "timestamp": "2026-01-19T10:00:00Z"
}
```

---

### GET `/api/chat/history`
Get chat history for current user.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `blueprint_id` (string, optional) - Filter by blueprint
- `skip` (int, default: 0) - Number of messages to skip
- `limit` (int, default: 50) - Maximum messages to return

**Response:** `200 OK`
```json
[
  {
    "id": "chat_id",
    "user_id": "user_id",
    "blueprint_id": "blueprint_id",
    "message": "...",
    "response": "...",
    "created_at": "2026-01-19T10:00:00Z"
  }
]
```

---

### DELETE `/api/chat/history/{chat_id}`
Delete a specific chat message.

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

### DELETE `/api/chat/history`
Clear all chat history (or for specific blueprint).

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `blueprint_id` (string, optional) - Clear only for specific blueprint

**Response:** `204 No Content`

---

## 🏥 Health Check

### GET `/health`
Check API health status.

**Response:** `200 OK`
```json
{
  "status": "healthy",
  "environment": "development",
  "version": "1.0.0"
}
```

---

### GET `/`
Root endpoint with API information.

**Response:** `200 OK`
```json
{
  "message": "Welcome to StartGenie AI API",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs"
}
```

---

## 📊 Error Responses

### 400 Bad Request
```json
{
  "detail": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error",
  "message": "An error occurred"
}
```

---

## 🔄 Rate Limiting

- **Per Minute:** 60 requests
- **Per Hour:** 1000 requests

Exceeding limits returns `429 Too Many Requests`.

---

## 📝 Notes

- All timestamps are in UTC ISO 8601 format
- All monetary values are in Indian Rupees (₹)
- Blueprint generation typically takes 30-60 seconds
- Maximum startup idea length: 1000 characters
- Minimum password length: 8 characters
- Username must be 3-50 characters

---

## 🔗 Interactive Documentation

Visit `/docs` for interactive Swagger UI documentation.
Visit `/redoc` for ReDoc documentation.

---

**Built with ❤️ by StartGenie AI Team**
