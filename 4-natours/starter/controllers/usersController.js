const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandlers');

const filterObj = (obj, ...fields) => {
  const resultObj = {};
  Object.keys(obj).forEach((key) => {
    if (fields.includes(key)) resultObj[key] = obj[key];
  });
  return resultObj;
};

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
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
