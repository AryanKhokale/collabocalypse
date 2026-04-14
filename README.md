# Collabocalypse

## Overview
**Collabocalypse** is a collaborative real-time document editing platform that enables multiple users to work on shared documents simultaneously. It combines a robust FastAPI backend with a modern React frontend, featuring real-time synchronization via WebSockets, user authentication through Keycloak, and persistent storage with PostgreSQL and Redis caching.

## Features
- **Real-time Collaborative Editing** - Multiple users can edit documents simultaneously with live updates
- **User Management** - User authentication and role-based access control via Keycloak
- **Real-time Synchronization** - WebSocket-powered live sync between clients
- **Document Management** - Create, read, update, and share documents with granular permission controls
- **Performance Optimization** - Redis caching layer for improved performance
- **Rich Text Editor** - Integrated with React Quill for advanced text editing capabilities
- **CORS Security** - Configured middleware for secure cross-origin requests
- **Load Balancing** - Nginx reverse proxy configuration for production deployment

## Technology Stack

### Backend
- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL (persistent storage)
- **Cache**: Redis (buffer and performance optimization)
- **Authentication**: Keycloak
- **Protocol**: WebSockets for real-time communication
- **Architecture**: Async/await with SQLAlchemy ORM

### Frontend
- **Framework**: React 18.3+
- **Build Tool**: Vite 7.2+
- **Text Editor**: React Quill 2.0
- **Routing**: React Router DOM 7.12+
- **Authentication**: Keycloak integration

## Project Structure

```
collabocalypse/
├── backend/
│   ├── main.py                           # FastAPI application entry point
│   ├── API/
│   │   ├── Middlewares/
│   │   │   └── CORS.py                  # CORS middleware configuration
│   │   └── Routes/
│   │       ├── DocumentAPI.py           # Document CRUD endpoints
│   │       ├── RealTimeSyncAPI.py       # Real-time sync endpoints
│   │       └── UserAPI.py               # User management endpoints
│   ├── Authentication/
│   │   └── Verification.py              # Keycloak authentication logic
│   ├── core/
│   │   ├── config.py                    # Configuration and environment variables
│   │   ├── dbs/
│   │   │   ├── postgres_db.py           # PostgreSQL connection management
│   │   │   └── redis_db.py              # Redis connection management
│   │   └── DEPENDECIES/
│   │       └── dependencies.py          # Dependency injection setup
│   ├── model/                           # Data models
│   │   ├── document.py
│   │   ├── template.py
│   │   └── user.py
│   ├── repository/                      # Data access layer
│   │   ├── document_repo.py
│   │   ├── template_repo.py
│   │   └── user_repo.py
│   ├── services/                        # Business logic layer
│   │   ├── document_service.py
│   │   ├── document_service1.py
│   │   ├── mail_service.py
│   │   ├── realtime_service.py
│   │   ├── template_service.py
│   │   └── user_service.py
│   ├── Websockets_handling/
│   │   └── ConnectionManager/
│   │       └── connection_manager.py    # WebSocket connection management
│   └── ReverseProxy_LoadBalancing/
│       └── nginx.conf                   # Nginx configuration
├── frontend/
│   ├── src/
│   │   ├── main.jsx                     # Entry point
│   │   ├── App.jsx                      # Root component
│   │   ├── config.js                    # Frontend configuration
│   │   ├── components/
│   │   │   ├── Dashboard.jsx            # Main dashboard
│   │   │   ├── Login.jsx                # Login component
│   │   │   └── landing/                 # Landing page components
│   │   └── assets/
│   ├── public/                          # Static assets
│   ├── keycloak-theme/                  # Custom Keycloak login theme
│   ├── vite.config.js                   # Vite configuration
│   ├── package.json
│   └── eslint.config.js
└── README.md
```

## Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **PostgreSQL** 12+
- **Redis** 6+
- **Keycloak** 18+
- **npm** or **yarn**

## Installation & Setup

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install fastapi uvicorn sqlalchemy quill-delta-python python-dotenv psycopg2-binary redis
   ```

4. **Configure environment variables**
   Create a `.env` file in the backend directory:
   ```env
   DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/collabocalypse
   REDIS_URL=redis://localhost:6379
   KEYCLOAK_URL=http://localhost:8080
   KEYCLOAK_REALM=your_realm
   KEYCLOAK_CLIENT_ID=your_client_id
   KEYCLOAK_CLIENT_SECRET=your_client_secret
   ```

5. **Run the backend server**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

The backend API will be available at `http://localhost:8000`
- API documentation: `http://localhost:8000/docs` (Swagger UI)

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   Create a `.env.local` file in the frontend directory:
   ```env
   VITE_API_BASE_URL=http://localhost:8000
   VITE_KEYCLOAK_URL=http://localhost:8080
   VITE_KEYCLOAK_REALM=your_realm
   VITE_KEYCLOAK_CLIENT_ID=your_client_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Document API (`/api/documents`)
- `GET /documents` - Retrieve all documents
- `GET /documents/{id}` - Get a specific document
- `POST /documents` - Create a new document
- `PUT /documents/{id}` - Update a document
- `DELETE /documents/{id}` - Delete a document
- `POST /documents/{id}/share` - Share a document with users

### User API (`/api/users`)
- `GET /users` - List all users
- `GET /users/{id}` - Get user details
- `POST /users` - Create a new user
- `PUT /users/{id}` - Update user profile
- `DELETE /users/{id}` - Delete a user

### Real-time Sync API (`/api/sync`)
- `WebSocket /ws/documents/{id}` - Connect to real-time document synchronization
- `POST /sync/changes` - Sync document changes

## WebSocket Usage

Connect to the WebSocket endpoint to receive real-time updates:

```javascript
const ws = new WebSocket('ws://localhost:8000/ws/documents/doc_id');

ws.onmessage = (event) => {
  const update = JSON.parse(event.data);
  // Handle real-time document updates
};

ws.send(JSON.stringify({
  type: 'change',
  content: deltaChange
}));
```

## Authentication

The application uses **Keycloak** for authentication:

1. Users log in through the Keycloak login page
2. JWT tokens are issued upon successful authentication
3. Tokens are used for API requests and WebSocket connections
4. Token refresh is handled automatically

## Database Schema

### Key Tables
- **Users**: User account and profile information
- **Documents**: Document metadata and ownership
- **DocumentPermissions**: User access control for documents
- **Templates**: Document templates for quick creation
- **Sessions**: Active user sessions and connections

## Deployment

### Using Nginx (Load Balancing)
The project includes an Nginx configuration for reverse proxying and load balancing:

```bash
nginx -c /path/to/ReverseProxy_LoadBalancing/nginx.conf
```

### Docker Setup (Optional)
Create a `docker-compose.yml` for containerized deployment with PostgreSQL and Redis services.

## Development Workflow

### Running Tests
```bash
# Backend
cd backend
pytest

# Frontend
cd frontend
npm run test
```

### Code Linting
```bash
# Frontend
npm run lint
```

### Building for Production
```bash
# Backend (already production-ready with FastAPI)
uvicorn main:app --host 0.0.0.0 --port 8000

# Frontend
npm run build
# Output will be in dist/ directory
```

## Troubleshooting

### WebSocket Connection Issues
- Ensure the backend server is running
- Check CORS configuration in `API/Middlewares/CORS.py`
- Verify network connectivity to the WebSocket endpoint

### Database Connection Errors
- Verify PostgreSQL is running and accessible
- Check DATABASE_URL configuration
- Ensure database credentials are correct

### Real-time Sync Not Working
- Check Redis connection is active
- Verify WebSocket ConnectionManager is properly initialized
- Review ConnectionManager logs for connection issues

## Contributing
1. Create a feature branch (`git checkout -b feature/your-feature`)
2. Make your changes
3. Run linting and tests
4. Commit your changes (`git commit -m 'Add your feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Open a Pull Request

## License
[Specify your license here - MIT, Apache 2.0, GPL, etc.]

## Support
For issues, questions, or contributions, please open an issue or contact the development team.

---

**Last Updated**: April 2026
