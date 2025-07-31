# DevClock Monitoring

A lightweight chess clock-style timer for tracking development hours vs customer wait time. Built with Java Spring Boot backend and React frontend.

## Features

- **Multiple Project Timers**: Create and manage multiple project timers with descriptions
- **Chess Clock Style**: Switch between "Development Time" and "Customer Wait Time" 
- **Role-Based Access**: Admin users can create/delete/assign projects, developers can only operate timers
- **Project Assignment**: Assign projects to specific users or make them visible to all
- **Timeline Visualization**: View detailed activity timelines for projects (Admin only)
- **Search Functionality**: Search projects by name or description
- **Real-time Updates**: Live timer updates and project state synchronization
- **Persistent Data**: SQLite database that survives server restarts
- **Modern UI**: Clean, responsive interface with confirmation modals
- **Simple Deployment**: Single JAR file deployment

## Architecture

- **Backend**: Java 8 + Spring Boot 2.7.18 + SQLite Database
- **Frontend**: React 18 + React Router 6 + Tailwind CSS + Axios
- **Database**: SQLite with Project, User, and TimelineEntry models
- **Build**: Maven for backend, npm/webpack for frontend

## Quick Start

### Development Mode

1. Make sure you have Java 8+ and Node.js installed
2. Make scripts executable:
   ```bash
   chmod +x dev-start.sh deploy.sh
   ```
3. Start development servers:
   ```bash
   ./dev-start.sh
   ```
   This will start:
   - Backend on http://localhost:8080
   - Frontend on http://localhost:3000

### Production Build

1. Build and deploy the application:
   ```bash
   ./deploy.sh
   ```
2. Access the application at http://localhost:8080

## Default Users

The application uses file-based user management with these default users:
- `admin` (ADMIN role) - Can create/delete/assign projects and view timelines
- `developer1` (DEVELOPER role) - Can operate timers on assigned projects
- `developer2` (DEVELOPER role) - Can operate timers on assigned projects

*Note: Users are loaded from `users.txt` file and can be modified there.*

## Usage

1. **Login**: Enter your username when prompted (use one of the default users)
2. **Create Projects** (Admin only): Click "Create Project" to add new timers with descriptions
3. **Assign Projects** (Admin only): Use the user button (👤) to assign projects to specific developers or all users
4. **Search Projects**: Use the search bar to find projects by name or description
5. **Operate Timers**: Click "Start Dev" or "Start Customer" to begin tracking time
6. **Switch Context**: Starting a new timer automatically stops the previous one
7. **View Timeline** (Admin only): Click the timeline button (📊) to see detailed project activity
8. **Delete Projects** (Admin only): Use the × button with confirmation modal
9. **Real-time Updates**: All times update live every second while active

## API Endpoints

### Projects
- `GET /api/projects` - List projects visible to current user
- `POST /api/projects` - Create project (Admin only)
- `DELETE /api/projects/{id}` - Delete project (Admin only)
- `POST /api/projects/{id}/toggle-dev` - Start/stop development timer
- `POST /api/projects/{id}/toggle-wait` - Start/stop wait timer
- `POST /api/projects/{id}/stop` - Stop any active timer
- `PUT /api/projects/{id}/assign` - Assign project to user (Admin only)
- `PUT /api/projects/{id}/assign-all` - Assign project to all users (Admin only)
- `PUT /api/projects/{id}/unassign` - Unassign project (Admin only)
- `GET /api/projects/{id}/timeline` - Get project timeline (Admin only)

### Users
- `GET /api/users/available` - Get available users for assignment
- Authentication via X-Username header (file-based user lookup)

## Configuration

The application uses `src/main/resources/application.properties` for configuration:
- Server port: `server.port=8080`
- SQLite database: `spring.datasource.url=jdbc:sqlite:devclock.db`
- CORS settings for frontend integration

User management is handled via `users.txt` file in the project root.

## Deployment Notes

- **Memory Usage**: Approximately 200-300MB RAM
- **Disk Usage**: ~50MB for the JAR file + SQLite database
- **Network**: Only requires port 8080
- **Database**: SQLite file (`devclock.db`) persists all data
- **Users**: Managed via `users.txt` file

## Future Plans

- **Authentication System**: Implement proper login/logout with session management
- **Enhanced User Roles**: Add more granular permissions and user role types
- **User Registration**: Allow admins to create new users through the UI
- **Advanced Reporting**: Export timeline data and generate reports
- **Team Management**: Organize users into teams with team-specific projects

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
├── services/       # API services
├── utils/          # Utility functions
└── pages/          # Page components
```

## Troubleshooting

### Common Issues

**Frontend Build Issues**: If the React build fails, try:
```bash
cd frontend && rm -rf node_modules package-lock.json
npm install
npm run build
```

**Database Issues**: If SQLite database gets corrupted, delete `devclock.db` and restart the application to recreate it.

**User Access Issues**: Check `users.txt` file format - each line should be: `username,role,displayName`

**Port Conflicts**: If port 8080 is in use, modify `server.port` in `application.properties`

## License

MIT License - see [LICENSE](LICENSE) file for details.