# construction-company

A full-stack construction company website with a public React site and hidden JWT-protected admin dashboard.

## Backend install

```bash
cd backend
npm install
copy .env.example .env
```

On macOS/Linux, use:

```bash
cp .env.example .env
```

## Frontend install

```bash
cd frontend
npm install
copy .env.example .env
```

On macOS/Linux, use:

```bash
cp .env.example .env
```

## Environment files

`backend/.env`

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/construction_company
JWT_SECRET=construction_secret_key
CLIENT_URL=http://localhost:5173
```

`frontend/.env`

```env
VITE_API_URL=http://localhost:5000
```

## Start MongoDB

Make sure MongoDB is running locally before seeding or starting the backend.

```bash
mongod
```

If MongoDB is installed as a service on Windows, start it from Services or run:

```bash
net start MongoDB
```

## Seed database

```bash
cd backend
npm run seed
```

The seed creates the admin user, blogs, services, projects, and sample leads.

## Run backend

```bash
cd backend
npm run dev
```

Backend API: `http://localhost:5000`

## Run frontend

```bash
cd frontend
npm run dev
```

Frontend: `http://localhost:5173`

## Admin access

Secret login URL: `http://localhost:5173/secure-admin-portal-9483`

Dashboard URL: `http://localhost:5173/secure-admin-dashboard`

Email: `admin@construction.com`

Password: `admin123`

## API URLs

Auth:

- `POST /api/auth/login`
- `GET /api/auth/me`

Blogs:

- `GET /api/blogs`
- `GET /api/blogs/:id`
- `POST /api/blogs`
- `PUT /api/blogs/:id`
- `DELETE /api/blogs/:id`

Projects:

- `GET /api/projects`
- `GET /api/projects/:id`
- `POST /api/projects`
- `PUT /api/projects/:id`
- `DELETE /api/projects/:id`

Services:

- `GET /api/services`
- `GET /api/services/:id`
- `POST /api/services`
- `PUT /api/services/:id`
- `DELETE /api/services/:id`

Leads:

- `POST /api/leads`
- `GET /api/leads`
- `DELETE /api/leads/:id`
