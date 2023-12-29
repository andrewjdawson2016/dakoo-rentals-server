CREATE TABLE building (
    id SERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL UNIQUE,
    nickname VARCHAR(255) NOT NULL UNIQUE,
    building_type VARCHAR(15) NOT NULL CHECK (building_type IN ('SINGLE_FAMILY', 'MULTI_FAMILY')),
    first_rental_month VARCHAR(7) NOT NULL,
    user_id INTEGER REFERENCES users(id)
);

CREATE TABLE unit (
    id SERIAL PRIMARY KEY,
    building_id INT NOT NULL REFERENCES building(id) ON DELETE CASCADE, 
    unit_number VARCHAR(255),
    user_id INTEGER REFERENCES users(id)
);

CREATE TABLE expense (
    id SERIAL PRIMARY KEY,
    building_id INT NOT NULL REFERENCES building(id) ON DELETE CASCADE,
    month_year VARCHAR(7) NOT NULL,
    amount INT NOT NULL,
    note TEXT DEFAULT '',
    user_id INTEGER REFERENCES users(id)
);

CREATE TABLE lease (
    id SERIAL PRIMARY KEY,
    unit_id INT NOT NULL REFERENCES unit(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price_per_month INT NOT NULL,
    is_renewal BOOLEAN NOT NULL DEFAULT false,
    CHECK (end_date > start_date),
    user_id INTEGER REFERENCES users(id)
);

CREATE TABLE lease_note (
    id SERIAL PRIMARY KEY,
    lease_id INT NOT NULL REFERENCES lease(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id INTEGER REFERENCES users(id)
);

CREATE TABLE lease_event (
    id SERIAL PRIMARY KEY,
    lease_id INT NOT NULL REFERENCES lease(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    execution_date DATE,
    description VARCHAR(10) NOT NULL CHECK (description IN ('START', 'SIX_MONTH', 'TWO_MONTH', 'ONE_MONTH', 'END')),
    user_id INTEGER REFERENCES users(id)
);

CREATE TABLE tenant (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    user_id INTEGER REFERENCES users(id)
);

CREATE TABLE tenant_lease (
    tenant_id INT NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    lease_id INT NOT NULL REFERENCES lease(id) ON DELETE CASCADE,
    PRIMARY KEY (tenant_id, lease_id),
    user_id INTEGER REFERENCES users(id)
);

CREATE TABLE user (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE INDEX idx_lease_event_due_date ON lease_event(due_date);
CREATE INDEX idx_lease_start_date ON lease(start_date);