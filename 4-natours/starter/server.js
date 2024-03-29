const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', () => {
  console.log('unhandled exception, shutting down..');

  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

const db = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(db, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => console.log('connection to database successfull'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => console.log('app runnig on port', port));

process.on('unhandledRejection', () => {
  console.log('unhandled rejection, shutting down..');
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM recieved. Shutting down gracefully.. ⚔');
  server.close(() => {
    console.log('⚔ Process terminated!');
  });
});
