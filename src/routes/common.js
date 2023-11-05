const {
  AlreadyExistsError,
  NotFoundError,
  ValidationError,
} = require("../db/datastores/types");

const INTERNAL_SERVICE_ERROR_MSG = "unknown internal service error";

function parseDatabaseError(e) {
  switch (e.constructor) {
    case AlreadyExistsError:
      return {
        message: e.message,
        status: 400,
      };

    case NotFoundError:
      return {
        message: e.message,
        status: 404,
      };

    case ValidationError:
      return {
        message: e.message,
        status: 400,
      };

    default:
      return {
        message: INTERNAL_SERVICE_ERROR_MSG,
        status: 500,
      };
  }
}

module.exports = {
  parseDatabaseError,
};
