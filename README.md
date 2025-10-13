# 🐳 Docker Setup Guide

This project uses **Docker** for containerized deployment and consistent development environments.  
We have two main modes of operation:

- **Development Mode**
- **Production Mode**

---

## 🚀 Development Mode

Development mode is used during active coding and testing.  
It allows live updates, fast rebuilds, and easier debugging.

### ▶️ To Start Development Mode
Run the following command:

```bash
docker compose up --build
```

This command:

- Builds the containers (if not already built).

- Starts all services defined in docker-compose.yml.

- Enables hot-reloading and mounts local files (if configured).

### ▶️ To Run an Existing Container (Without Rebuilding)

If the containers are already built, simply run:

```bash
docker compose up
```

## 🏗️ Production Mode

Production mode is used for deployment in a live environment.
It runs the containers with optimized builds, without development dependencies or hot reloading.

### ▶️ To Start Production Mode

Use the following command:

```bash
docker compose -f docker-compose.yml up --build
```

This command:

- Uses the main docker-compose.yml configuration file.

- Builds and runs the containers optimized for production.

### 🧹 Stopping Containers

To stop the running containers in either mode, run:

```bash
docker compose down
```



