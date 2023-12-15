CREATE TABLE building (
    id SERIAL PRIMARY KEY,
    address VARCHAR(255) NOT NULL UNIQUE,
    monthly_expenses INT NOT NULL,
)

CREATE TABLE unit (
    id SERIAL PRIMARY KEY,
    building_id INT NOT NULL REFERENCES building(id) ON DELETE CASCADE, 
    unit_type VARCHAR(15) NOT NULL CHECK (unit_type IN ('SINGLE_FAMILY', 'MULTI_FAMILY')),
    unit_number VARCHAR(10),
    CHECK (
        (unit_type = 'SINGLE_FAMILY' AND unit_number IS NULL) OR 
        (unit_type = 'MULTI_FAMILY' AND unit_number IS NOT NULL)
    )
);

CREATE TABLE lease (
    id SERIAL PRIMARY KEY,
    unit_id INT NOT NULL REFERENCES unit(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    price_per_month INT NOT NULL,
    is_renewal BOOLEAN NOT NULL DEFAULT false,
    CHECK (end_date > start_date)
);

CREATE TABLE lease_note (
    id SERIAL PRIMARY KEY,
    lease_id INT NOT NULL REFERENCES lease(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lease_event (
    id SERIAL PRIMARY KEY,
    lease_id INT NOT NULL REFERENCES lease(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    execution_date DATE,
    description VARCHAR(10) NOT NULL CHECK (description IN ('START', 'SIX_MONTH', 'TWO_MONTH', 'ONE_MONTH', 'END'))
);

CREATE TABLE tenant (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE tenant_lease (
    tenant_id INT NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    lease_id INT NOT NULL REFERENCES lease(id) ON DELETE CASCADE,
    PRIMARY KEY (tenant_id, lease_id)
);

CREATE INDEX idx_lease_event_due_date ON lease_event(due_date);
CREATE INDEX idx_lease_start_date ON lease(start_date);