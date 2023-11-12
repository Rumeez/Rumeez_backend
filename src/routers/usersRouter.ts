import express, { NextFunction, Request, Response, response } from 'express';
import userModel from '../models/user.model';
import passport from 'passport';
import bcrypt from 'bcrypt';
import { getToken } from '../authenticate';
import mongoose from 'mongoose';
import ResponseError from '../ResponseError';
import { FullJWT, jwtFromHeader } from '../authenticate';

const usersRouter = express.Router();

usersRouter.route('/')
    .get(passport.authenticate('jwt', {session: false}), function (req: Request, res: Response, next: NextFunction): void {
        console.log("Inside GET");
        const validate: FullJWT = jwtFromHeader(req);
        if (validate.err) {
            next(validate.err);
        } else {
            userModel.find({email: validate.token.payload.email})
                .then(function (users: any[]) {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(users);
                    console.log("Successfully found users");
                }, function (err: ResponseError) { next(err) })
                .catch(function (err: ResponseError) { next(err) });
        }
    });

usersRouter.route('/login')
    .post((req: Request, res: Response, next: NextFunction): void => {
        const userData = req.body;
        console.log("Performing login");
        userModel.findOne({ "email": userData.email })
        .then((user): void => {
            if (user === null) {
                console.log("User not found");
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.send("Wrong email");
            } else {
                const t1 = new Date().getTime();
                bcrypt.compare(userData.password, user.toJSON().password)
                .then((same: Boolean) => {
                    const t2 = new Date().getTime();
                    console.log("bcrypt compare took: " + (t2-t1) + "ms");
                    if (same) {
                        const token = getToken(user.toJSON());
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.json({ success: true, token: token, status: "You are successfully logged in!" });
                    } else {
                        res.sendStatus(403);
                    }
                });
            }
        }, (err: ResponseError) => next(err) );
    });

usersRouter.route('/signup')
    .post(function (req: Request, res: Response, next: NextFunction): void {
        console.log("In signup");
        const userData = req.body;

        console.log("req.body: " + JSON.stringify(req.body));
        bcrypt.genSalt(10)
            .then((salt: string) => {
                console.log("Generated salt: " + salt);
                return bcrypt.hash(userData.password, salt)
                    .then((hash: string) => {
                        console.log("Hash: " + hash);
                        return userModel.create({
                            ...userData,
                            password: hash
                        });
                    })
                    .then((user: mongoose.Document) => {
                        res.send(user);
                    }, (err: ResponseError) => next(err))
                    .catch((err: ResponseError) => {
                        console.log(err),
                            next(err);
                    });
            }, (err: ResponseError) => next(err))
            .catch((err: ResponseError) => {
                console.log(err),
                    next(err);
            });
    });

export default usersRouter;