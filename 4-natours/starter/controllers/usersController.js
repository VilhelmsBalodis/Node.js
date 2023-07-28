const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./factoryHandlers');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

const filterObj = (obj, ...fields) => {
  const resultObj = {};
  Object.keys(obj).forEach((key) => {
    if (fields.includes(key)) resultObj[key] = obj[key];
  });
  return resultObj;
};

exports.uploadUserPhoto = upload.single('photo');

exports.getAllUsers = factory.getAll(User);

exports.getUser = factory.getOne(User);

exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});

exports.updateMe = catchAsync(async (req, res, next) => {
  // error if user tries to update password
  if (req.body.password || req.body.passwordConfirm)
    return next(new AppError('This route is not for password update. Use /updatePassword', 400));
  // filter out unwanted fields
  const updateBody = filterObj(req.body, 'name', 'email');
  if (req.file) updateBody.photo = req.file.filename;
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

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const extention = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${extention}`);
//   },
// });
