const User = require('../models/userModel');
// const APIFeatures = require('../utils/apiFeatures');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const filterObj = (obj, ...fields) => {
  const resultObj = {};
  Object.keys(obj).forEach((key) => {
    if (fields.includes(key)) resultObj[key] = obj[key];
  });
  return resultObj;
};

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

exports.createUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'this route is not yet implemented' });
};

exports.getUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'this route is not yet implemented' });
};

exports.updateUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'this route is not yet implemented' });
};

exports.deleteUser = (req, res) => {
  res.status(500).json({ status: 'error', message: 'this route is not yet implemented' });
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // error if user tries to update password
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('This route is not for password update. Use /updatePassword', 400));
  // filter out unwanted fields
  const updateBody = filterObj(req.body, 'name', 'email');
  // update user document
  const user = await User.findByIdAndUpdate(req.user.id, updateBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: 'success', data: { user } });
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({ status: 'success', data: null });
});
