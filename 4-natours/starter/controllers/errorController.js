const AppError = require("../utils/appError");

const castError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}!`;
  return new AppError(message, 400);
};

const duplicateFields = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value!`;
  return new AppError(message, 400);
};

const validationError = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

const JWTError = () => new AppError("Invalid token. Please log in again.", 401);

const JWTExpiredError = () =>
  new AppError("Your token has expired. Please log in again", 401);

const devError = (err, req, res, next) => {
  console.error("ERROR 💥", err.message);
  if (req.originalUrl.startsWith("/api")) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  return res
    .status(err.statusCode)
    .render("error", { title: "Something went wrong", msg: err.message });
};

const prodError = (err, req, res) => {
  console.error("ERROR 💥", err.message);
  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    return res
      .status(500)
      .json({ status: "error", message: "Something went wrong" });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
  }
  return res.status(err.statusCode).render("error", {
    title: "Something went wrong",
    msg: "Please try again later.",
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.message = err.message || "Please try again later.";
  if (process.env.NODE_ENV === "development") {
    devError(err, req, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err };
    error.message = err.message;
    if (err.name === "CastError") error = castError(err);
    if (err.code === 11000) error = duplicateFields(err);
    if (err.name === "ValidationError") error = validationError(err);
    if (err.name === "JsonWebTokenError") error = JWTError();
    if (err.name === "TokenExpiredError") error = JWTExpiredError();
    prodError(error, req, res);
  }
};
