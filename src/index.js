const mongoose = require('mongoose');
const app = require('./app');
require("dotenv").config();

let server;
mongoose
  .connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    server = app.listen(process.env.PORT, () => {
      console.log(`Listening to port ${process.env.PORT}`);
    });
  });

const exitHandler = () => {
    if (server) {
        server.close(() => {
           console.log('Server closed');
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
};


const unexpectedErrorHandler = (error) => {
    console.error(error);
    exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
   console.log('SIGTERM received');
    if (server) {
        server.close();
    }
});
