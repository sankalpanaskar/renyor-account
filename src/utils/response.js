exports.success = (res, statusCode = 200, message = "Success", data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

exports.error = (res, statusCode = 400, message = "Something went wrong") => {
  return res.status(statusCode).json({
    success: false,
    message
  });
};
