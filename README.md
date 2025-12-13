# Multi-tenant RBAC API

Node.js + Express + PostgreSQL  
Static password auth (password = "123") + JWT + simple RBAC.

## Setup

1. Create PostgreSQL database and create tables: tenants, users, roles, permissions, role_permissions.
2. Copy `.env.example` to `.env` and fill DB values + JWT secret.
3. Install dependencies:

```bash
npm install
```

4. Start dev server:

```bash
npm run dev
```

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "123"
}
```

### Swagger

Open: `http://localhost:4000/api-docs`
