class NotFoundError extends Error {
    constructor(message) {
        super(message);
        this.name = "NotFoundError";
    }
}

class Property {
    constructor(id, address) {
        this.id = id;
        this.address = address;
    }

    static fromRow(row) {
        return new Property(row.id, row.address);
    }
}

class Lease {
    constructor(id, property_id, start_date, end_date, price_per_month, leaseNotes = [], leaseEvents = []) {
        this.id = id;
        this.property_id = property_id;
        this.start_date = start_date;
        this.end_date = end_date;
        this.price_per_month = price_per_month;
        this.leaseNotes = leaseNotes;
        this.leaseEvents = leaseEvents;
    }

    static fromRow(row) {
        return new Lease(row.id, row.property_id, row.start_date, row.end_date, row.price_per_month);
    }

    addLeaseNote(leaseNote) {
        this.leaseNotes.push(leaseNote);
    }

    addLeaseEvent(leaseEvent) {
        this.leaseEvents.push(leaseEvent);
    }
}

class LeaseNote {
    constructor(id, lease_id, note) {
        this.id = id;
        this.lease_id = lease_id;
        this.note = note;
    }

    static fromRow(row) {
        return new LeaseNote(row.id, row.lease_id, row.note);
    }
}

class LeaseEvent {
    constructor(id, lease_id, due_date, execution_date, description) {
        this.id = id;
        this.lease_id = lease_id;
        this.due_date = due_date;
        this.execution_date = execution_date;
        this.description = description;
    }

    static fromRow(row) {
        return new LeaseEvent(row.id, row.lease_id, row.due_date, row.execution_date, row.description);
    }
}

class Tenant {
    constructor(id, name, email, lease_id) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.lease_id = lease_id;
    }

    static fromRow(row) {
        return new Tenant(row.id, row.name, row.email, row.lease_id);
    }
}

module.exports = {
    NotFoundError,
    Property,
    LeaseNote,
    LeaseEvent,
    Lease,
    Tenant
};