const { DateTime } = require("luxon");

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = "NotFoundError";
  }
}

class AlreadyExistsError extends Error {
  constructor(message) {
    super(message);
    this.name = "AlreadyExistsError";
  }
}

class Building {
  constructor(
    id,
    address,
    nickname,
    building_type,
    first_rental_month,
    units = [],
    expenses = []
  ) {
    this.id = id;
    this.address = address;
    this.nickname = nickname;
    this.building_type = building_type;
    this.first_rental_month = first_rental_month;
    this.units = units;
    this.expenses = expenses;
  }

  static fromRow(row) {
    return new Building(
      row.id,
      row.address,
      row.nickname,
      row.building_type,
      row.first_rental_month
    );
  }

  addUnit(unit) {
    this.units.push(unit);
  }

  addExpense(expense) {
    this.expenses.push(expense);
  }
}

class Unit {
  constructor(id, building_id, unit_type, unit_number, leases = []) {
    this.id = id;
    this.building_id = building_id;
    this.unit_type = unit_type;
    this.unit_number = unit_number;
    this.leases = leases;
  }

  static fromRow(row) {
    return new Unit(row.id, row.building_id, row.unit_type, row.unit_number);
  }

  addLease(lease) {
    this.leases.push(lease);
  }
}

class Lease {
  constructor(
    id,
    unit_id,
    start_date,
    end_date,
    price_per_month,
    is_renewal,
    tenants = [],
    leaseNotes = [],
    leaseEvents = []
  ) {
    this.id = id;
    this.unit_id = unit_id;
    this.start_date = DateTime.fromJSDate(start_date).toISODate();
    this.end_date = DateTime.fromJSDate(end_date).toISODate();
    this.price_per_month = price_per_month;
    this.is_renewal = is_renewal;
    this.tenants = tenants;
    this.leaseNotes = leaseNotes;
    this.leaseEvents = leaseEvents;
  }

  static fromRow(row) {
    return new Lease(
      row.id,
      row.unit_id,
      row.start_date,
      row.end_date,
      row.price_per_month,
      row.is_renewal
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

class Expense {
  constructor(id, building_id, month_year, amount, note) {
    this.id = id;
    this.building_id = building_id;
    this.month_year = month_year;
    this.amount = amount;
    this.note = note;
  }

  static fromRow(row) {
    return new Expense(
      row.id,
      row.building_id,
      row.month_year,
      row.amount,
      row.note
    );
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
    this.due_date = DateTime.fromJSDate(due_date).toISODate();
    this.execution_date = execution_date
      ? DateTime.fromJSDate(execution_date).toISODate()
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
  AlreadyExistsError,
  ValidationError,
  Unit,
  LeaseNote,
  LeaseEvent,
  Lease,
  Expense,
  Tenant,
  Building,
};
