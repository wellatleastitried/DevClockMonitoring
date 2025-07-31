# DevClock Monitoring

A lightweight chess clock-style timer for tracking development hours vs customer wait time. Built with Java Spring Boot backend and React frontend.

## Features

- **Multiple Project Timers**: Create and manage multiple project timers
- **Chess Clock Style**: Switch between "Development Time" and "Customer Wait Time" 
- **Role-Based Access**: Admin users can create/delete projects, developers can only operate timers
- **Real-time Updates**: WebSocket-based live updates across all connected clients
- **Persistent Data**: Uses SQLite database that survives server restarts
- **Simple Deployment**: Single JAR file deployment

## Architecture

- **Backend**: Java 8 + Spring Boot 2.7.18 + SQLite Database + WebSocket
- **Frontend**: React 18 + Tailwind CSS + Axios + SockJS/STOMP
- **Database**: SQLite (persistent, lightweight file-based database)

## Quick Start

### Development Mode

1. Make sure you have Java 8+ and Node.js installed
2. Make scripts executable:
   ```bash
   chmod +x dev-start.sh build.sh
   ```
3. Start development servers:
   ```bash
   ./dev-start.sh
   ```
   This will start:
   - Backend on http://localhost:8080
   - Frontend on http://localhost:3000

### Production Build

1. Build the application:
   ```bash
   ./build.sh
   ```
2. Run the application:
   ```bash
   java -jar target/dev-clock-monitoring-1.0.0.jar
   ```
3. Access the application at http://localhost:8080

## Default Users

The application creates these default users on startup:
- `admin` (ADMIN role) - Can create/delete projects
- `developer1` (DEVELOPER role) - Can operate timers only
- `developer2` (DEVELOPER role) - Can operate timers only

## Usage

1. **Login**: Enter your username when prompted (or use one of the default users)
2. **Create Projects** (Admin only): Click "Create Project" to add new timers
3. **Operate Timers**: Click "Start Dev" or "Start Wait" to begin tracking time
4. **Switch Context**: Clock automatically stops the previous timer when starting a new one
5. **View Progress**: Real-time display of accumulated development and wait times

## API Endpoints

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project (Admin only)
- `DELETE /api/projects/{id}` - Delete project (Admin only)
- `POST /api/projects/{id}/toggle-dev` - Start development timer
- `POST /api/projects/{id}/toggle-wait` - Start wait timer
- `POST /api/projects/{id}/stop` - Stop timer

### Users
- `GET /api/users/current` - Get current user info
- `GET /api/users` - List all users
- `POST /api/users` - Create user

### WebSocket
- Connect to `/ws` for real-time updates
- Subscribe to `/topic/projects` for project updates

## Configuration

Edit `src/main/resources/application.properties` to customize:
- Server port: `server.port=8080`
- Database settings (for production, switch to persistent DB)
- CORS settings
- Logging levels

## Deployment Notes

- **Memory Usage**: Approximately 200-300MB RAM
- **Disk Usage**: ~50MB for the JAR file
- **Network**: Only requires the configured port (default 8080)
- **Database**: Uses SQLite for persistent data storage (data survives server restarts)

For persistent data in production, configure a persistent database in `application.properties`.

## Development

### Backend Structure
```
src/main/java/com/devclock/
├── model/          # JPA entities
├── repository/     # Data access layer
├── service/        # Business logic
├── controller/     # REST endpoints
└── config/         # Configuration classes
```

### Frontend Structure
```
frontend/src/
├── components/     # React components
├── services/       # API and WebSocket services
└── utils/          # Utility functions
```

## Troubleshooting

### WebSocket Module Error
If you encounter `Module not found: Error: Can't resolve 'net'` during frontend build, the dependencies have been updated to use browser-compatible WebSocket libraries. Run:
```bash
cd frontend
npm install
npm run build
```

### Build Issues
If the build fails, try:
```bash
# Clean and rebuild
cd frontend && rm -rf node_modules package-lock.json
npm install
cd .. && ./build.sh
```

## License

MIT License - see LICENSE file for details.