# Stage 1: Build Frontend
FROM node:20 as frontend-build
WORKDIR /app/admin-web
COPY admin-web/package*.json ./
RUN npm install
COPY admin-web/ ./
# Build with relative base path for Django static files
RUN npm run build

# Stage 2: Build Backend
FROM python:3.11-slim
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libpq-dev \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy Backend Code
COPY backend/ ./backend/

# Copy Frontend Build to Backend Static folder
# This puts index.html and assets/ inside backend/static
COPY --from=frontend-build /app/admin-web/dist /app/backend/static

# Set Workdir to backend
WORKDIR /app/backend

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Collect Static
# This moves files from backend/static (including frontend) to backend/staticfiles
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run Application
CMD ["gunicorn", "matrix_backend.wsgi:application", "--bind", "0.0.0.0:8000"]
