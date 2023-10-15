# DaKoo Rentals Server

The server side APIs which power dakoo-rentals.

## Table of Contents

- [Getting Started with PostgreSQL Locally](#getting-started-with-postgresql-locally)
  - [Starting Postgres](#starting-postgres)
  - [Creating Database and User](#creating-database-and-user)
- [Running Service](#running-service)
  - [Local Run](#local-run)
  - [Hosted Run](#hosted-run)

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

## Running Service

### Local Run
```sh
npm start
curl -X POST http://localhost:3000/properties -H "Content-Type: application/json" -d '{"address": "123 Main St"}'
```

### Hosted Run
```sh
git push
# Wait for deployment
curl -X POST https://dakoo-rentals-server-a20f6c2bf881.herokuapp.com/properties -H "Content-Type: application/json" -d '{"address": "123 Main St"}'
```
