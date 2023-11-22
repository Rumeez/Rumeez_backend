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

chatRouter.route('/get/:id')
    .get(passport.authenticate('jwt', {session: false}), (req: Request, res: Response, next: NextFunction): void => {
        console.log("Authentication was successful")
        const id = req.params.id;
        if (!id)
        {
            res.status(400).send('ID is required');
        }else{
            chatModel.findById(id).then((chat) => { //ask about how to type check here
                if (!chat)
                {
                    return res.status(404).send('Chat not found');
                }
                res.status(200).json(chat);
                console.log("Successfully found chat");
            }).catch((err: ResponseError) => {
                console.log(err),
                    next(err);
            })
        }
    })

export default chatRouter;