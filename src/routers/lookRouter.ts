import express, { NextFunction, Request, Response, response } from 'express';
import userModel from '../models/user.model';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { getToken } from '../authenticate';
import mongoose from 'mongoose';
import ResponseError from '../ResponseError';
import { FullJWT, jwtFromHeader } from '../authenticate';
import { MongoClient, ObjectId } from 'mongodb';


const lookRouter = express.Router();


lookRouter.route('/')
    .get(passport.authenticate('jwt', {session: false}), function (req: Request, res: Response, next: NextFunction): void {
        console.log("Inside GET");
        const validate: FullJWT = jwtFromHeader(req);
        if (validate.err) {
            next(validate.err);
        } else {
            //pull up a user and show only their preferences
           


            //email of user
            /*{email: validate.token.payload.email}*/

            //shows all users
            //userModel.find({})
            userModel.findOne({email: validate.token.payload.email})
                .then(function (users: any[]) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(users);
                    console.log("Successfully found users");
                }, function (err: ResponseError) { next(err) })
                .catch(function (err: ResponseError) { next(err) });
                



        }
    });

function findUser()
{
    return userModel.findOne({_id: '654ee6e313a5cdb8f0794c4a'});

}

/*
function calculateCompatability(userDoc, allUsersDocs)
{
    userID = userDoc._id;



    return user;
}
*/




export default lookRouter;
