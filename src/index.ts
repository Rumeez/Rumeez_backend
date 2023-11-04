import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose, { Promise } from "mongoose";

mongoose.connect('mongodb://rumeez-backend:c*In4,><mFDmGF^lsLM{@127.0.0.1:27017/rumeez?authSource=admin');

import { User, IUser } from "./mongoSchema";

console.log("Hello");
User.find({}).exec().then(doc => {
  console.log("World");
  console.log(doc.toString());
});

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req: Request, res: Response) => {
  res.send("Healthy");
});

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});