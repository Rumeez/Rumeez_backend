import express, { NextFunction, Request, Response, response } from 'express';
import userModel from '../models/user.model';
import passport from 'passport';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import ResponseError from '../ResponseError';
import { FullJWT, jwtFromHeader, jwtFromCookie, authStrategy } from '../authenticate';
import { MongoClient, ObjectId, Db, Collection } from 'mongodb';
import User from '../models/user.interface';
import { config } from "../config";

const searchRouter = express.Router();

searchRouter.route('/')
    .post(authStrategy, async function (req: Request, res: Response, next: NextFunction): Promise<void> {
       
        const validate: FullJWT = jwtFromCookie(req);
        try {
            const name = req.body.name;
            const users = await userModel.find({ firstname: name });
            
            if (users) {
               res.json(users);
            } else {
                res.send('User not found');
            }
          } catch (err) {
           
            next(err);}
   });

   export default searchRouter;