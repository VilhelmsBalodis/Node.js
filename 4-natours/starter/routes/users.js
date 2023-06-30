const express = require('express');

const router = express.Router();
const usersController = require('../controllers/usersController');
const authController = require('../controllers/authController');

router.route('/signup').post(authController.signup);
router.route('/login').post(authController.login);

router.route('/forgotPassword').post(authController.forgotPassword);
router.route('/resetPassword/:token').patch(authController.resetPassword);
router.route('/updatePassword').patch(authController.protect, authController.updatePassword);

router.route('/updateMe').patch(authController.protect, usersController.updateMe);
router.route('/deleteMe').delete(authController.protect, usersController.deleteMe);

router.route('/').get(usersController.getAllUsers).post(usersController.createUser);
router
  .route('/:id')
  .get(usersController.getUser)
  .patch(usersController.updateUser)
  .delete(usersController.deleteUser);

module.exports = router;
