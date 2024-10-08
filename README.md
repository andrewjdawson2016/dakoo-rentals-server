# DaKoo Rentals Server

The server side APIs which power dakoo-rentals.

## Table of Contents

- [Getting Started with PostgreSQL Locally](#getting-started-with-postgresql-locally)
  - [Starting Postgres](#starting-postgres)
  - [Creating Database and User](#creating-database-and-user)
- [Sample Curl Commands](#sample-curl-commands)

## Getting Started with PostgreSQL Locally

### Starting Postgres
```sh
brew install postgresql
brew services start postgresql
brew services stop postgresql
brew services list
```

### Creating Database and User
```sh
psql
```

```sql
CREATE DATABASE your_database_name;
CREATE USER your_username WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_username;
-- CREATE SCHEMA --
```

Update varibles in .env
```
PG_USER=your_username
PG_HOST=localhost
PG_DATABASE=your_database_name
PG_PASSWORD=your_password
PG_PORT=5432
```

## Sample Curl Commands

```sh
curl -X POST http://localhost:3000/properties -H "Content-Type: application/json" -d '{"address": "123 Main St"}'
curl http://localhost:3000/properties
curl http://localhost:3000/properties/3
curl -X DELETE http://localhost:3000/properties/3
```

## Logging Into Database
heroku pg:psql --app dakoo-rentals-server
