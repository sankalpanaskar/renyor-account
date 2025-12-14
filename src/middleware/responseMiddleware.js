const Response = require('../utils/response');

module.exports = (req, res, next) => {
  res.success = (statusCode = 200, message = "Success", data = null) => {
    return Response.success(res, statusCode, message, data);
  };

  res.error = (statusCode = 400, message = "Something went wrong") => {
    return Response.error(res, statusCode, message);
  };

  next();
};
