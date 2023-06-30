const AppError = require('../utils/appError');

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
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const JWTError = () => new AppError('Invalid token. Please log in again.', 401);

const JWTExpiredError = () => new AppError('Your token has expired. Please log in again', 401);

const devError = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const prodError = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR 💥', err);
    res.status(500).json({ status: 'error', message: 'Something went wrong' });
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    devError(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') error = castError(err);
    if (err.code === 11000) error = duplicateFields(err);
    if (err.name === 'ValidationError') error = validationError(err);
    if (err.name === 'JsonWebTokenError') error = JWTError();
    if (err.name === 'TokenExpiredError') error = JWTExpiredError();
    prodError(error, res);
  }
};
