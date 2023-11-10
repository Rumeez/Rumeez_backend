import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose, { Promise } from "mongoose";
import { User, IUser, Preferences, IPreferences } from "./mongoSchema";
import { morganMiddleware } from "./utils/logger";

const uri = 'mongodb://tester:' + encodeURIComponent("KwO9?$/q@HhZEf?PPzwM") + '@127.0.0.1:27017/test?authSource=admin';
mongoose.connect(uri).then(
  () => {
      console.log("Successfully connected to mongodb serever!");
  },
).catch(err => {
  console.log("MongoDB connection error. Please make sure MongoDB is running. " + err);
  // process.exit();
});

const app: Application = express();
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morganMiddleware);

app.get("/users", (req: Request, res: Response) => {
  //res.send("Healthy");
  res.json(User);
});

app.post("/users", (req: Request, res: Response) =>{
  const user = {name: req.body.name, surname: req.body.surname, username: req.body.username}
  //users.push(user);
  User.insertMany(user);
  res.status(201).send();
});


const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});