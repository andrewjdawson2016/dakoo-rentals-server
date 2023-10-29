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
        statusCode: 400,
      };

    case NotFoundError:
      return {
        message: e.message,
        statusCode: 404,
      };

    case ValidationError:
      return {
        message: e.message,
        statusCode: 400,
      };

    default:
      return {
        message: INTERNAL_SERVICE_ERROR_MSG,
        statusCode: 500,
      };
  }
}

module.exports = {
  parseDatabaseError,
};
