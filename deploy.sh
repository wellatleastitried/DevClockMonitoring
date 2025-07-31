#!/bin/bash

# DevClock Monitoring Production Deployment Script

echo "Deploying DevClock Monitoring for production..."

# Ensure data directory exists for SQLite database
mkdir -p data

# Set JAVA_HOME if needed (uncomment and adjust path as needed)
# export JAVA_HOME=/usr/lib/jvm/java-8-openjdk

# Check Java version
java -version

if [ $? -ne 0 ]; then
    echo "Error: Java is not installed or not in PATH"
    exit 1
fi

# Build the application
echo "Building application..."
./build.sh

if [ $? -ne 0 ]; then
    echo "Build failed!"
    exit 1
fi

# Run the application
echo "Starting DevClock Monitoring server..."
echo "Application will be available at http://localhost:8080"
echo "Press Ctrl+C to stop the server"

java -Xmx256m -jar target/dev-clock-monitoring-1.0.0.jar
