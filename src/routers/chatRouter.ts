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
import userModel from "../models/user.model"

const chatRouter = express.Router();
const io = getSocket()

const userSockets = new Map(); 

io.on('connection', (socket: Socket) => {
    console.log('A user connected');

    //socket.on('joinChat', (chatId) => {
    //    socket.join(chatId);
    //    console.log(`User ${socket.id} joined chat ${chatId}`);
    //});

});

const messageInput = "this is a test chat" //document.getElementById('name of element that contains the message to send')


async function addMessageToChat(chatId: string, userEmail: string,  message: string, next: NextFunction): Promise<void> {
    chatModel.findByIdAndUpdate(
        chatId,
        { $push: { messages: [userEmail, message] } },
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

async function joinChat(chatId: string, userId: string, next: NextFunction): Promise<void> {
    chatModel.findByIdAndUpdate(
        chatId,
        { $push: { users: userId } },
        { new: true }
    )
    .then(updatedChat =>{
        console.log("Chat updated successfully:", updatedChat);
    })
    .catch((err: ResponseError) => {
                console.log(err),
                next(err);
    })
    userModel.findByIdAndUpdate(
        userId,
        { $push: { chats: chatId}},
        { new: true}
    )
    .then(updatedChat =>{
        console.log("User updated successfully:", updatedChat);
    })
    .catch((err: ResponseError) => {
                console.log(err),
                next(err);
    })
}

chatRouter.route('/send')
    .post(authStrategy, async (req: Request, res: Response, next: NextFunction) => {
        const chatData = req.body;
        const userEmail = chatData.userEmail;
        const chatId = chatData.chatId;
        const message = chatData.message;
        try {
            addMessageToChat(chatId, userEmail, message, next);
            res.status(200).send("User sent message");
        } catch (error) {
            res.status(500).send("An error occurred");
        }
    });

chatRouter.route('/join')
    .post(authStrategy, async (req: Request, res: Response, next: NextFunction) => {
        console.log("Request body:", req.body);
        const { chatId, userId } = req.body;
        try {
            await joinChat(chatId, userId, next);
            res.status(200).send("User joined chat");
        } catch (error) {
            res.status(500).send("An error occurred");
        }
    });

chatRouter.route('/rename/:chatId')
    .post(authStrategy, async (req: Request, res: Response, next: NextFunction) => {
        const { chatId } = req.params;
        const { newName } = req.body;
        try {
            const updatedChat = await chatModel.findByIdAndUpdate(chatId, { chatName: newName }, { new: true });
            if (!updatedChat) {
                return res.status(404).send('Chat not found');
            }
            res.status(200).json(updatedChat);
        } catch (error) {
            console.error('Error renaming chat:', error);
            next(error);
        }
    });

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
    .get(authStrategy, function (req: Request, res: Response, next: NextFunction): void {
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