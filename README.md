## KANDYPACK — Run the full project with Docker

This repository contains a Node/Express backend, two Vite React frontends (`Admin` and `User`) and a MySQL initialization SQL file. The project is set up to run each component in its own container and orchestrated with Docker Compose.

### Overview
- Services started by `docker compose`: `db` (MySQL), `backend` (Express API), `admin-frontend` (Admin SPA served by nginx), `user-frontend` (User SPA served by nginx).
- Database initialization is driven by `db/init.sql` (executed during MySQL first initialization) and by environment variables in the repository root `.env` file.

### Prerequisites
- Docker Engine and Docker Compose plugin installed. On many systems `docker compose` is available.
- At least a few hundred MB free for images; more for the DB data.

### Prepare environment
1. Key variables in `.env`:
- `MYSQL_ROOT_PASSWORD` — MySQL root password (used only during init)
- `MYSQL_DATABASE` — DB name to create (default: kandypack)
- `MYSQL_USER` / `MYSQL_PASSWORD` — non-root app user (do NOT set `MYSQL_USER=root`)
- `MYSQL_HOST` — should remain `db` (Docker service hostname)

### First-time run (fresh DB)
This will build images and start the full stack. Because `db/init.sql` runs only on first-time initialization, remove any old DB volume if you want the script applied.

```bash
# stop & remove previous containers (WARNING: -v removes volumes and deletes DB data)
docker compose down -v

# build and start in detached mode
docker compose up --build -d
```

Check status:

```bash
docker compose ps
docker compose logs -f db backend admin-frontend user-frontend
```

Verify DB tables (example):

```bash
docker compose exec db mysql -u${MYSQL_USER} -p${MYSQL_PASSWORD} -e "USE ${MYSQL_DATABASE}; SHOW TABLES;"
```

### Preserve existing DB data
- If you must keep an existing DB volume, do not run `down -v`. To add an application user without reinitializing, create it manually:

```bash
docker compose exec db mysql -uroot -p"${MYSQL_ROOT_PASSWORD}"
# then in the MySQL prompt:
-- CREATE USER 'kandypack_user'@'%' IDENTIFIED BY 'the_password';
-- GRANT ALL PRIVILEGES ON kandypack.* TO 'kandypack_user'@'%';
-- FLUSH PRIVILEGES;
```

Then update `.env` with the new `MYSQL_USER`/`MYSQL_PASSWORD` and restart the backend:

```bash
docker compose restart backend
```

### Common commands
- Rebuild a single service and restart:
```bash
docker compose up -d --build backend
```
- Stop everything:
```bash
docker compose down
```
- Show container logs:
```bash
docker compose logs -f backend
```

### Ports used (defaults)
- Admin frontend: http://localhost:8080
- User frontend: http://localhost:8081
- Backend API: http://localhost:5000
- MySQL (host port): 3307 -> container 3306 (this mapping is configured in `docker-compose.yml`)

### Troubleshooting
- "ports are not available" – another service uses the host port (change mapping in `docker-compose.yml` or stop the service that uses it).
- "permission denied while trying to connect to the Docker daemon socket" – run with `sudo` or add your user to the `docker` group: `sudo usermod -aG docker $USER` and re-login.
- `MYSQL_USER="root"` entrypoint error — do not set `MYSQL_USER=root` in `.env`; use a different app username.
- `db/init.sql` did not run — MySQL only runs init scripts when data directory is empty; remove the DB volume (`docker compose down -v`) to force re-init.

### Security notes
- Do not commit `.env` to git. Commit only `.env.example`.
- Avoid exposing MySQL to the public; the compose file maps MySQL to host port for convenience — remove the `ports:` mapping for `db` in production.
- For production, use Docker secrets or an external secrets manager instead of `.env` files.

### Sharing or deploying
- For teammates, either push images to a registry or share the repository and instructions above.
- For a production server, clone the repo on the server, provide a secure `.env` (not committed), and run `docker compose up -d` behind an nginx reverse-proxy with TLS.

If you want, I can add a short `deploy.md` with a suggested nginx reverse proxy and Let's Encrypt steps. Tell me if you want the README adjusted for a specific deployment target (DigitalOcean, AWS EC2, etc.).
