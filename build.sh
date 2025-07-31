#!/bin/bash
# DevClock Monitoring Build Script

echo "Building DevClock Monitoring Application..."

mkdir -p data

chmod +x mvnw

echo "Building Java backend..."
./mvnw clean package -DskipTests

if [ $? -ne 0 ]; then
    echo "Backend build failed!"
    exit 1
fi

echo "Building React frontend..."
cd frontend
npm install
npm run build

if [ $? -ne 0 ]; then
    echo "Frontend build failed!"
    exit 1
fi

echo "Copying frontend build to backend..."
cd ..
rm -rf src/main/resources/static
mkdir -p src/main/resources/static
cp -r frontend/build/* src/main/resources/static/

echo "Rebuilding backend with frontend..."
./mvnw clean package -DskipTests

echo "Build completed successfully!"
echo "Run with: java -jar target/dev-clock-monitoring-1.0.0.jar"
