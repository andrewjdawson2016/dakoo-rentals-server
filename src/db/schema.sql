CREATE TABLE property (
    id SERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE lease (
    id SERIAL PRIMARY KEY,
    property_id INT NOT NULL REFERENCES property(id),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price_per_month INT NOT NULL
);

CREATE TABLE tenant (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    lease_id INT NOT NULL REFERENCES lease(id)
);

CREATE TABLE lease_note (
    id SERIAL PRIMARY KEY,
    lease_id INT NOT NULL REFERENCES lease(id),
    note TEXT
);

CREATE TABLE lease_event (
    id SERIAL PRIMARY KEY,
    lease_id INT NOT NULL REFERENCES lease(id),
    due_date DATE NOT NULL,
    execution_date DATE
);