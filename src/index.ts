import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import mongoose, { Promise } from "mongoose";
import passport from "passport"
import { morganMiddleware } from "./utils/logger";
import usersRouter from "./routers/usersRouter";
import ResponseError from "./ResponseError";
import { config } from "./config";
import lookRouter from "./routers/lookRouter";
import http from 'http';
import { initSocket } from './socket';

import searchRouter from "./routers/searchRouter"
import cookieParser from "cookie-parser"
import cors from 'cors';

mongoose.connect(config.mongoUrl).then(
  () => {
      console.log("Successfully connected to mongodb serever!");
  },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  // process.exit();
});

const app: Application = express();

const server = http.createServer(app);
const io = initSocket(server);

app.use(morganMiddleware);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], 
  methods: 'GET, POST, OPTIONS',
  credentials: true,
  exposedHeaders: 'Set-Cookie'
}));

const port = 8000;

server.listen(port, () => {
    console.log("Server listening at http://localhost:" + port);
});

app.set('trust proxy', process.env.NODE_ENV !== 'production');

import chatRouter from "./routers/chatRouter"; //weird import location due to socket.io needing to be iitialized before the import.

app.use('/user', usersRouter);
app.use('/chat', chatRouter);
app.use('/look', lookRouter);
app.use('/search', searchRouter)

app.use(function(err: ResponseError, req: Request, res: Response, next: NextFunction) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
  
    // render the error page
    res.status(err.status || 500);
    res.json({ error: err })
  });

  export { io }