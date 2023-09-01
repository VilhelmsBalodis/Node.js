const morgan = require('morgan');
const hpp = require('hpp');
const express = require('express');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const AppError = require('./utils/appError');
const tourRouter = require('./routes/tours');
const userRouter = require('./routes/users');
const reviewRouter = require('./routes/reviews');
const bookRouter = require('./routes/bookings');
const viewRouter = require('./routes/views');
const bookController = require('./controllers/bookController');
const errorHandler = require('./controllers/errorController');

const app = express();

app.enable('trust proxy');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public'))); // serving static files from folder

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
// implement cors access-control-allow-origins *
app.use(cors());
app.options('*', cors());
app.post(
  '/webhook-checkout',
  express.raw({ type: 'application/json' }),
  bookController.webhookChechout
);
// body parser from req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extender: true, limit: '10kb' }));
app.use(cookieParser());
// data sanitization against nosql query injection
app.use(mongoSanitize());
// data sanitization against XSS attacks
app.use(xss());
// text compression
app.use(compression());
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

// request timestamp for testing
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

//  middleware for multiple routes
app.use('/', viewRouter);
app.use('/api', limiter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookRouter);
// handling unhandled routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on server`, 404));
});

app.use(errorHandler);

module.exports = app;

// routes - left as an example
// ":" defines variable, ":?" optional parameter, that you don't have to specify necessarily
// app.get('/api/v1/tours', getAllTours);
