# AI Blog Generator - Backend (UserManagement)

This backend provides:
- User registration, login, and profile (JWT)
- AI blog generation (OpenAI or deterministic stub)
- Blog history and retrieval
- MongoDB persistence via Mongoose
- Swagger docs at /docs and OpenAPI JSON at /openapi.json
- Health endpoints at `/` and `/healthz`

## Getting Started

1. Install dependencies
   - cd UserManagement
   - npm install

2. Configure environment
   - Copy `.env.example` to `.env` and fill in values.

3. Run
   - npm run dev  (development with nodemon)
   - npm start    (production)

Default port is 3001.

## Environment Variables

See `UserManagement/.env.example` for full list:
- PORT, HOST, NODE_ENV
- MONGODB_URI
- JWT_SECRET
- AI_PROVIDER, AI_API_KEY, OPENAI_MODEL
- RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX

## API Docs
- Swagger UI: /docs
- OpenAPI JSON: /openapi.json

## Notes
- If MONGODB_URI is not provided, the app will run but DB features will be unavailable.
- If AI_PROVIDER=openai and AI_API_KEY is provided, OpenAI will be used. Otherwise a deterministic stub is returned.