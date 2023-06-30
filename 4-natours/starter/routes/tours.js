const express = require('express');
const authController = require('../controllers/authController');
const toursController = require('../controllers/toursController');

const router = express.Router();

router.route('/top-5-cheap').get(toursController.aliasTopTours, toursController.getAllTours);
router.route('/stats').get(toursController.getTourStats);
router.route('/monthly-plan/:year').get(toursController.getMonthlyPlan);

router
  .route('/')
  .get(authController.protect, toursController.getAllTours)
  .post(toursController.createTour);

router
  .route('/:id')
  .get(toursController.getTour)
  .patch(toursController.updateTour)
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    toursController.deleteTour
  );

module.exports = router;
