import express, { NextFunction, Request, Response, response } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { getToken } from '../authenticate';
import mongoose from 'mongoose';
import ResponseError from '../ResponseError';
import { FullJWT, jwtFromHeader } from '../authenticate';
import chatModel from "../models/chat.model"

const chatRouter = express.Router();

chatRouter.route('/create')
    .post(passport.authenticate('jwt', {session: false}), (req: Request, res: Response, next: NextFunction): void => {
        const chatData = req.body;
        console.log("Creating Chat");
        console.log("req.body: " + JSON.stringify(req.body));
        chatModel.create({
            ...chatData,
        })
        .then((chat: mongoose.Document) => {
            res.send(chat);
        }, (err: ResponseError) => next(err))

    });

export default chatRouter;