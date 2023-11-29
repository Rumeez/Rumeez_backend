import express, { NextFunction, Request, Response, response } from 'express';
import passport from 'passport';
import bcrypt from 'bcrypt';
// import { getToken } from '../authenticate';
import mongoose from 'mongoose';
import ResponseError from '../ResponseError';
import { FullJWT, jwtFromHeader, authStrategy } from '../authenticate';
import chatModel from "../models/chat.model"
import { Server, Socket } from 'socket.io';
import { getSocket } from '../socket';

const chatRouter = express.Router();
const io = getSocket()

const userSockets = new Map(); 

io.on('connection', (socket: Socket) => {
    console.log('A user connected');

    socket.on('joinChat', (chatId) => {
        socket.join(chatId);
        console.log(`User ${socket.id} joined chat ${chatId}`);
    });

});

const messageInput = "this is a test chat" //document.getElementById('name of element that contains the message to send')


async function addMessageToChat(chatId: string, userId: string,  message: string, next: NextFunction): Promise<void> {
    io.to(chatId).emit('chatMessage', message);
    chatModel.findByIdAndUpdate(
        chatId,
        { $push: { messages: [userId, message] } },
        { new: true }
    )
    .then(updatedChat =>{
        console.log("Chat updated successfully:", updatedChat);
    })
    .catch((err: ResponseError) => {
                console.log(err),
                next(err);
    })
}


chatRouter.route('/create')
    .post(authStrategy, (req: Request, res: Response, next: NextFunction): void => {
        const chatData = req.body;
        console.log("Creating Chat");
        console.log("req.body: " + JSON.stringify(req.body));
        chatModel.create({
            ...chatData,
        })
        .then((chat: mongoose.Document) => {
            res.send(chat._id);
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