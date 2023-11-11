import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mongoose, { Promise } from "mongoose";
import passport from "passport"
import { morganMiddleware } from "./utils/logger";
import usersRouter from "./routers/usersRouter";
import ResponseError from "./ResponseError";
import { config } from "./config";

mongoose.connect(config.mongoUrl).then(
  () => {
      console.log("Successfully connected to mongodb serever!");
  },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  // process.exit();
});

const app: Application = express();

app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(bodyParser.json());

const port = 3000;

app.listen(port, () => {
    console.log("Server listening at http://localhost:3000");
});

app.use('/user', usersRouter);

app.use(function(err: ResponseError, req: Request, res: Response, next: NextFunction) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.json({ error: err })
  });