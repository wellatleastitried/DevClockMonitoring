# Production Installation Guide

## Server Requirements

- Java 8 or higher
- At least 512MB RAM (application uses ~200-300MB)
- 100MB disk space

## Installation Steps

### 1. Prepare the Server

```bash
# Install Java 8 (if not already installed)
# On Ubuntu/Debian:
sudo apt update
sudo apt install openjdk-8-jdk

# On CentOS/RHEL:
sudo yum install java-1.8.0-openjdk

# Create application user
sudo useradd -r -m -U -d /opt/devclock -s /bin/false app
```

### 2. Build and Deploy

```bash
# On your development machine, build the application
./build.sh

# Copy the JAR file to your server
scp target/dev-clock-monitoring-1.0.0.jar user@your-server:/opt/devclock/

# Copy service file (optional, for systemd)
sudo cp devclock.service /etc/systemd/system/
```

### 3. Configure and Start

#### Option A: Direct Run (Simple)
```bash
cd /opt/devclock
java -Xmx256m -jar dev-clock-monitoring-1.0.0.jar
```

#### Option B: Systemd Service (Recommended)
```bash
# Set permissions
sudo chown -R app:app /opt/devclock
sudo chmod +x /opt/devclock/dev-clock-monitoring-1.0.0.jar

# Enable and start service
sudo systemctl daemon-reload
sudo systemctl enable devclock
sudo systemctl start devclock

# Check status
sudo systemctl status devclock

# View logs
sudo journalctl -u devclock -f
```

### 4. Access the Application

Open your browser and navigate to:
```
http://your-server-ip:8080
```

## Configuration

### Port Configuration
To change the port, create `/opt/devclock/application.properties`:
```properties
server.port=9090
```

### Persistent Database
The application now uses SQLite by default for persistent data storage. The database file is stored in `./data/devclockdb.sqlite`.

For alternative database configurations, you can modify `application.properties`:
```properties
# For MySQL (requires MySQL JDBC driver)
spring.datasource.url=jdbc:mysql://localhost:3306/devclock
spring.datasource.username=devclock_user
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
spring.jpa.hibernate.ddl-auto=update

# For PostgreSQL (requires PostgreSQL JDBC driver)
spring.datasource.url=jdbc:postgresql://localhost:5432/devclock
spring.datasource.username=devclock_user
spring.datasource.password=your_password
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=update
```

## Firewall Configuration

If using a firewall, open the application port:
```bash
# UFW (Ubuntu)
sudo ufw allow 8080

# iptables
sudo iptables -A INPUT -p tcp --dport 8080 -j ACCEPT
```

## Troubleshooting

### Check Java Installation
```bash
java -version
```

### Check Application Logs
```bash
# If using systemd
sudo journalctl -u devclock -f

# If running directly, logs go to console
```

### Check Port Usage
```bash
netstat -tulpn | grep 8080
```

### Memory Issues
If the server has limited memory, reduce the heap size:
```bash
java -Xmx128m -jar dev-clock-monitoring-1.0.0.jar
```
