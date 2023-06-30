const morgan = require('morgan');
const hpp = require('hpp');
const express = require('express');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tours');
const userRouter = require('./routes/users');
const errorHandler = require('./controllers/errorController');

const app = express();

// global middleware

// dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
// limits number of requests from IP address
const limiter = rateLimit({
  max: 97,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP. Please try again in an hour.',
});
// security HTTP headers
app.use(helmet());
// body parser from req.body
app.use(express.json({ limit: '10kb' }));
// data sanitization against nosql query injection
app.use(mongoSanitize());
// data sanitization against XSS attacks
app.use(xss());
// prevent parameter polution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAveraged',
      'ratingsQuality',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
// serving static files from folder
app.use(express.static(`${__dirname}/public`));
// request timestamp for testing
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});
//  middleware for multiple routes
app.use('/api', limiter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
// handling unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on server`, 404));
});

app.use(errorHandler);

module.exports = app;

// routes - left as an example
// ":" defines variable, ":?" optional parameter, that you don't have to specify necessarily
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTour);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updateTour);
// app.delete('/api/v1/tours/:id', deleteTour);
