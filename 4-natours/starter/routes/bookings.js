const express = require('express');
const authController = require('../controllers/authController');
const bookController = require('../controllers/bookController');

const router = express.Router();

router.use(authController.protect);

router.get('/checkout/:tourId', authController.protect, bookController.checkoutSession);

router.use(authController.restrictTo('lead-guide', 'admin'));

router.route('/').get(bookController.getAllBookings).post(bookController.createBooking);

router
  .route('/:id')
  .get(bookController.getBooking)
  .patch(bookController.updateBooking)
  .delete(bookController.deleteBooking);

module.exports = router;
