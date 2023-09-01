const express = require('express');
const authController = require('../controllers/authController');
const viewController = require('../controllers/viewController');
// const bookController = require('../controllers/bookController');

const router = express.Router();

router.use(viewController.alerts);

router.get(
  '/',
  // bookController.createBookingCheckout,
  authController.isLoggedIn,
  viewController.getOverview
);

router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);

router.get('/login', authController.isLoggedIn, viewController.login);

router.get('/me', authController.protect, viewController.getAccount);

router.get('/my-tours', authController.protect, viewController.getMyTours);

module.exports = router;
