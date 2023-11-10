import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import mongoose, { Promise } from "mongoose";

const uri = 'mongodb://tester:' + encodeURIComponent("KwO9?$/q@HhZEf?PPzwM") + '@127.0.0.1:27017/test?authSource=admin';
mongoose.connect(uri);
import { User, IUser, Preferences, IPreferences } from "./mongoSchema";


const newUser = new User({name : "New", surname: "User", username: "hei", preferences: {universityHousing: false}})

//User.insertMany(newUser);
//User.updateOne({name: "Lee"}, {name: "Lu"} ).exec().then((result)=>{console.log("Updated")});
//const doc = User.find({username: 'hei'});



User.find().exec().then(doc => {
  console.log("World");
  console.log(doc.toString());
});//example of using mongo
//is .then() the same as await()?



const app: Application = express();
app.use(express.json());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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