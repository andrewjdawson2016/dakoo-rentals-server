const { DateTime } = require("luxon");

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
  }
}

class Property {
  constructor(id, address, leases = []) {
    this.id = id;
    this.address = address;
    this.leases = leases;
  }

  static fromRow(row) {
    return new Property(row.id, row.address);
  }

  addLease(lease) {
    this.leases.push(lease);
  }
}

class Lease {
  constructor(
    id,
    property_id,
    start_date,
    end_date,
    price_per_month,
    is_renewal,
    tenants = [],
    leaseNotes = [],
    leaseEvents = []
  ) {
    this.id = id;
    this.property_id = property_id;
    this.start_date = DateTime.fromISO(start_date.toISOString()).toISODate();
    this.end_date = DateTime.fromISO(end_date.toISOString()).toISODate();
    this.price_per_month = price_per_month;
    this.is_renewal = is_renewal;
    this.tenants = tenants;
    this.leaseNotes = leaseNotes;
    this.leaseEvents = leaseEvents;
  }

  static fromRow(row) {
    return new Lease(
      row.id,
      row.property_id,
      row.start_date,
      row.end_date,
      row.price_per_month,
      row.is_renewal,
      row.previous_lease_id
    );
  }

  addLeaseNote(leaseNote) {
    this.leaseNotes.push(leaseNote);
  }

  addLeaseEvent(leaseEvent) {
    this.leaseEvents.push(leaseEvent);
  }

  addTenant(tenant) {
    this.tenants.push(tenant);
  }
}

class LeaseNote {
  constructor(id, lease_id, note, created_at) {
    this.id = id;
    this.lease_id = lease_id;
    this.note = note;
    this.created_at = created_at;
  }

  static fromRow(row) {
    return new LeaseNote(row.id, row.lease_id, row.note, row.created_at);
  }
}

class LeaseEvent {
  constructor(id, lease_id, due_date, execution_date, description) {
    this.id = id;
    this.lease_id = lease_id;
    this.due_date = DateTime.fromISO(due_date.toISOString()).toISODate();
    this.execution_date = execution_date
      ? DateTime.fromISO(execution_date.toISOString()).toISODate()
      : "";
    this.description = description;
  }

  static fromRow(row) {
    return new LeaseEvent(
      row.id,
      row.lease_id,
      row.due_date,
      row.execution_date,
      row.description
    );
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
  Tenant,
};
