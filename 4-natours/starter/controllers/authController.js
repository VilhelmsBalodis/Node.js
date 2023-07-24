const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/email');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES,
  });

const createToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV !== 'production') cookieOptions.secure = true;
  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({ status: 'success', token, data: { user } });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangedAt: req.body.passwordChangedAt,
    role: req.body.role,
  });
  createToken(user, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError('Please provide a valid email and password', 400));

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.passwordCompare(password, user.password)))
    return next(new AppError('Incorrect email or password', 401));
  createToken(user, 200, res);
});

exports.logout = catchAsync(async (req, res, next) => {
  res.cookie('jwt', 'Logged out', {
    expires: new Date(Date.now() + 10000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  // check if there is any token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) return next(new AppError('Please log in to get access', 401));
  // token verification
  const payload = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  // check if user still exists
  const user = await User.findById(payload.id);
  if (!user) return next(new AppError('User, that holds this token, no longer exists', 401));
  // checks if user has changed passoword after token was issued
  if (user.passwordChange(payload.iat))
    return next(new AppError('User recently changed password. Please log in again.', 401));
  req.user = user;
  res.locals.user = user;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('User has no peromission to perform this action', 403));
    }
    next();
  };

exports.forgotPassword = catchAsync(async (req, res, next) => {
  // get user based on email
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new AppError('There is no user with this email address', 404));
  // generate random token
  const resetToken = user.passwordReset();
  await user.save({ validateBeforeSave: false });
  // send it to user's email
  const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to ${resetURL}`;
  try {
    await sendEmail({
      email: req.body.email,
      subject: 'Your password reset token (valid for 10 min)',
      message,
    });
    res.status(200).json({ status: 'success', message: 'Token sent to email' });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError('Error sending password reset token', 500));
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  // get user based on token
  const resetToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await User.findOne({
    passwordResetToken: resetToken,
    resetTokenExpires: { $gt: Date.now() },
  });
  // set new password if token has not expired and there is a user
  if (!user) return next(new AppError('Token is invalid or has expired', 400));
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.resetTokenExpires = undefined;
  await user.save({ validateBeforeSave: true });
  // log the user in, send JWT
  createToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  // get user from collection
  console.log(req.user.id);
  const user = await User.findById(req.user.id).select('+password');
  // check if posted password is correct
  if (!(await user.passwordCompare(req.body.passwordCurrent, user.password)))
    return next(new AppError('Provided password does not matches users password', 401));
  // if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // log user in, send JWT
  createToken(user, 200, res);
});

exports.isLoggedIn = async (req, res, next) => {
  // check if there is any cookie
  if (req.cookies.jwt) {
    try {
      // token verification
      const payload = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);
      // check if user still exists
      const user = await User.findById(payload.id);
      if (!user) return next();
      // checks if user has changed passoword after token was issued
      if (user.passwordChange(payload.iat)) return next();
      // there is logged in user
      res.locals.user = user;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
