# Seeker-Provider Platform

A full-stack application built with Python Flask backend, Next.js frontend, and SQLite database.

## Project Structure

- `backend/` - Flask API server
- `frontend/` - Next.js web application

## Prerequisites

- Node.js 18+ and npm
- Python 3.9+
- Docker and Docker Compose (for containerized deployment)

## Local Development Setup

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Create and activate a virtual environment:

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Start the Flask development server:

```bash
python app.py
```

The backend server will start at http://127.0.0.1:5000

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the Next.js development server:

```bash
npm run dev
```

The frontend application will be available at http://127.0.0.1:3000

## Running in Docker

1. Start the development containers:

```bash
docker-compose up --build
```

This will start:

- Backend at http://127.0.0.1:5000
- Frontend at http://127.0.0.1:3000

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Providers

- `GET /api/providers` - Get all providers
- `POST /api/providers` - Create a new provider
- `PUT /api/providers/<id>` - Update provider profile

### Matching

- `GET /api/match/providers` - Get matched providers for seekers

## Environment Variables

### Backend

- `FLASK_ENV` - Environment (development/production)
- `FLASK_APP` - Application entry point
- `SECRET_KEY` - Secret key for JWT tokens
- `SQLALCHEMY_DATABASE_URI` - Database connection string

### Frontend

- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NODE_ENV` - Environment (development/production)

## Technologies Used

### Backend

- Flask 2.0.1
- SQLAlchemy 2.0.28
- Flask-SQLAlchemy 2.5.1
- Flask-CORS 3.0.10
- Gunicorn 20.1.0
- PyJWT 2.1.0
- bcrypt 3.2.0

### Frontend

- Next.js 14
- React
- TypeScript
- Tailwind CSS

## Health Checks

Both services include health check endpoints:

- Backend: `GET /health`
- Frontend: `GET /` (root endpoint)

## Troubleshooting

### Common Issues

1. **Port Conflicts**

   - Ensure ports 3000 and 5000 are not in use
   - Modify ports in docker-compose files if needed

2. **Database Issues**

   - Check SQLite file permissions
   - Ensure database directory exists

3. **Build Failures**
   - Clear Docker cache: `docker-compose build --no-cache`
   - Check Node.js and Python versions

### Getting Help

For additional support:

1. Check the logs: `docker-compose logs`
2. Verify container status: `docker-compose ps`
3. Test API endpoints: `curl http://127.0.0.1:5000/health`
