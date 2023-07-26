const express = require('express');
const authController = require('../controllers/authController');
const usersController = require('../controllers/usersController');

const router = express.Router();

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);
router.route('/logout').get(authController.logout);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);

router.use(authController.protect);
// every route after this line will use this middleware

router.route('/me').get(usersController.getMe, usersController.getUser);
router
  .route('/updateMe')
  .patch(
    usersController.uploadUserPhoto,
    usersController.resizeUserPhoto,
    usersController.updateMe
  );
router.route('/updatePassword').patch(authController.updatePassword);
router.route('/deleteMe').delete(usersController.deleteMe);

router.use(authController.restrictTo('admin'));
// every route after this line will use this middleware

router.route('/').get(usersController.getAllUsers);
router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
