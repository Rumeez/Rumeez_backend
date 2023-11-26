import express, { NextFunction, Request, Response, response } from 'express';
import userModel from '../models/user.model';
import passport from 'passport';
import bcrypt from 'bcrypt';
import mongoose, { ObjectId } from 'mongoose';
import ResponseError from '../ResponseError';
import { FullJWT, jwtFromHeader, getTokenAccountVerification, getTokenLogin, getTokenAccountRecovery, jwtFromCookie } from '../authenticate';
import preferencesModel from '../models/preferences.model';
import RoommatePreferences from '../models/preferences.interface';
import User from '../models/user.interface';
import AWS, { SharedIniFileCredentials } from 'aws-sdk'
import { PromiseResult } from 'aws-sdk/lib/request';


const credentials: SharedIniFileCredentials = new AWS.SharedIniFileCredentials({profile: 'rumeez'});
AWS.config.update({region: 'us-east-2', credentials: credentials});

const usersRouter = express.Router();

usersRouter.route('/')
    .get(passport.authenticate('jwt', { session: false }), function (req: Request, res: Response, next: NextFunction): void {
        console.log("Inside GET");
        const validate: FullJWT = jwtFromCookie(req);
        if (validate.err) {
            next(validate.err);
        } else {
            userModel.find(
                { email: validate.token.payload.email })
                .then(function (users: User[]) {
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
                    bcrypt.compare(userData.password, user.password)
                        .then((same: Boolean) => {
                            const t2 = new Date().getTime();
                            console.log("bcrypt compare took: " + (t2 - t1) + "ms");
                            if (same) {
                                const token = getTokenLogin(user);
                                res.statusCode = 200;
                                res.setHeader('Content-Type', 'application/json');
                                res.json({ success: true, status: "You are successfully logged in!" });
                                res.cookie("token", token);
                            } else {
                                res.sendStatus(403);
                            }
                        });
                }
            }, (err: ResponseError) => next(err));
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
                        return preferencesModel.create(userData.preferences)
                            .then(() => {
                                return userModel.create({
                                    ...userData,

                                    password: hash
                                });
                            })

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

usersRouter.route('/update-preferences')
    .post(passport.authenticate('jwt', { session: false }), function (req: Request, res: Response, next: NextFunction): void {
        const validate: FullJWT = jwtFromCookie(req);
        if (validate.err) {
            next(validate.err);
        } else {
            try {
                const pref: RoommatePreferences = {
                    dormType: req.body.dormType, //drop down 9 choices
                    numberOfRoommates: Number(req.body.numberOfRoommates), //drop down
                    genderOfRoomate: req.body.genderOfRoomate,
                    smoking: Boolean(req.body.smoking), //yes or no drop down
                    drinking: Boolean(req.body.drinking), //yes or no drop down
                    riseTime: req.body.riseTime,//drop down menu 
                    sleepTime: req.body.sleepTime, //drop down menu 
                    temp: req.body.temp, //hot, cold, or medium drop down
                }
                userModel.updateOne(
                    { email: validate.token.payload.email },
                    { preferences: pref })
                    .then(function () {
                        res.sendStatus(200);
                        console.log("Successfully found users");
                    }, function (err: ResponseError) { next(err) })
                    .catch(function (err: ResponseError) { next(err) });
            } catch {
                res.sendStatus(400);
            }
        }
    });

usersRouter.route('/verify')
    .get(passport.authenticate('jwt', { session: false }), function (req: Request, res: Response, next: NextFunction): void {
        const validate: FullJWT = jwtFromCookie(req);
        if (validate.err) {
            next(validate.err);
        } else {
            try {
                userModel.findOne({ email: validate.token.payload.email })
                    .then((user: mongoose.Document | null): Promise<PromiseResult<AWS.SES.SendEmailResponse, AWS.AWSError>> | null => {
                        if (user === null) {
                            return null;
                        } else {
                            const userJSON: any = user.toJSON();
                            const verificationToken: string = getTokenAccountVerification(userJSON);
                            const email: AWS.SES.SendEmailRequest = {
                                Destination: { /* required */
                                    ToAddresses: [
                                        validate.token.payload.email,
                                    ]
                                },
                                Message: { /* required */
                                    Body: { /* required */
                                        Text: {
                                            Charset: "UTF-8",
                                            Data: `Dear ${validate.token.payload.firstname},\n\n
                                                    This is the link you requested for account verification.\n\n
                                                    If you did not request account verification, you can safely ignore this email. \n\n
                                                    Verification link: http://something.or.other/${verificationToken}\n\n
                                                    Best,
                                                    The Rumeez Dev Team`
                                        }
                                    },
                                    Subject: {
                                        Charset: "UTF-8",
                                        Data: "Rummez Account Verification"
                                    }
                                },
                                Source: "no_reply_rumeez@proton.me", /* required */
                            };
                            return new AWS.SES({apiVersion: "2010-12-01"}).sendEmail(email).promise();
                        }
                    }, function (err: ResponseError) { next(err) })
                    .then((promiseResult: PromiseResult<AWS.SES.SendEmailResponse, AWS.AWSError> | null | void): void => {
                        res.sendStatus(200);
                    })
                    .catch(function (err: ResponseError) { next(err) })
            } catch {
                res.sendStatus(400);
            }
        }
    });

usersRouter.route('/verify/confirm')
    .post(passport.authenticate('jwt', { session: false }), function (req: Request, res: Response, next: NextFunction): void {
        const validate: FullJWT = jwtFromHeader(req);
        if (validate.err) {
            next(validate.err);
        } else if (validate.token.payload.permissions.verifyaccount) {
            userModel.findOneAndUpdate({"email": validate.token.payload.email}, {$set: {verified: true}})
            .then((user: mongoose.Document | null): void => {
                console.log("User: " + user);
                if (user) {
                    res.sendStatus(200);
                } else {
                    const err: ResponseError = new Error("Unauthorized");
                    err.status = 403;
                    return next(err);
                }
            })
            .catch((err: Error) => next(err));
        } else {
            res.sendStatus(400);
        }
    });

usersRouter.route('/accountrecovery')
    .post((req: Request, res: Response, next: NextFunction): void => {
        const auth: FullJWT = jwtFromHeader(req);
        if (auth.err) {
            return next(auth.err);
        }
        const token: FullJWT["token"] = auth.token;
        console.log("Token payload: " + JSON.stringify(token.payload));
        if (!token.payload.permissions.accountrecovery) {
            const err: ResponseError = new Error("Not authorized");
            err.status = 403;
            return next(err);
        }
        if (!req.body.newPassword) {
            const err: ResponseError = new Error("Need new password");
            err.status = 400;
            return next(err);
        } else {
            const newPassword: string = req.body.newPassword;
            bcrypt.genSalt(10)
            .then((salt: string): Promise<string> => {
                return bcrypt.hash(newPassword, salt);
            })
            .then((hash: string): void => {
                userModel.findOne({ "email": token.payload.email })
                .then((user: mongoose.Document | null): mongoose.Query<mongoose.Document | null, mongoose.Document, {}> => {
                    if (!user) {
                        const err: ResponseError = new Error("User does not exist");
                        err.status = 400;
                        throw err;
                    } else {
                        console.log("Pushing new password to MongoDB")
                        return userModel.findOneAndUpdate({ "email": token.payload.email }, {
                            $set: {
                                password: hash
                            }
                        });
                    }
                })
                .then((user: mongoose.Document | null): void => {
                    if (user) {
                        res.sendStatus(200);
                    } else {
                        const err: ResponseError = new Error("Internal error");
                        err.status = 500;
                        throw err;
                    }
                }).catch((err: Error) => next(err));
            }).catch((err: Error) => next(err));
        }
    });

usersRouter.route('/accountrecovery/gettoken')
    .get((req: Request, res: Response, next: NextFunction): void => {
        if (!req.body.email) {
            const err: ResponseError = new Error("No email provided");
            err.status = 400;
            next(err);
        } else {
            const userEmail: string = req.body.email;
            res.sendStatus(200);
            userModel.findOne({ "email": userEmail })
            .then((user: mongoose.Document | null): Promise<PromiseResult<AWS.SES.SendEmailResponse, AWS.AWSError>> | null => {
                if (user) {
                    const userJSON: any = user.toJSON();
                    const recoveryToken: string = getTokenAccountRecovery(userJSON);
                    const email: AWS.SES.SendEmailRequest = {
                        Destination: { /* required */
                            ToAddresses: [
                                userEmail,
                            ]
                        },
                        Message: { /* required */
                            Body: { /* required */
                                Text: {
                                    Charset: "UTF-8",
                                    Data: `Dear ${userJSON.firstname},\n\n
                                            This is the link you requested for account recovery.\n\n
                                            If you did not request account verification, you can safely ignore this email. \n\n
                                            Token: http://localhost:3000/recovery/${recoveryToken}\n\n
                                            Best,
                                            The Rumeez Dev Team`
                                }
                            },
                            Subject: {
                                Charset: "UTF-8",
                                Data: "Rumeez Account Recovery"
                            }
                        },
                        Source: "no_reply_rumeez@proton.me", /* required */
                    };
                    return new AWS.SES({apiVersion: "2010-12-01"}).sendEmail(email).promise();
                } else {
                    return null;
                }
            })
            .then((promiseResult: PromiseResult<AWS.SES.SendEmailResponse, AWS.AWSError> | null): void => {
                console.log(promiseResult);
            })
            .catch((err: Error) => console.log(err));
        }
    })

usersRouter.route('/passwordreset')
    .post(passport.authenticate('jwt', { session: false }), (req: Request, res: Response, next: NextFunction): void => {
        console.log("In password reset");
        const auth: FullJWT = jwtFromCookie(req);
        console.log("auth: " + JSON.stringify(auth));
        console.log("Token: " + JSON.stringify(auth.token));
        if (auth.err) {
            console.log(auth.err);
            return next(auth.err);
        }
        const token: FullJWT["token"] = auth.token;
        if (!token.payload.permissions.passwordreset) {
            const err: ResponseError = new Error("Unauthorized");
            err.status = 403;
            next(err);
        }
        if (req.body.curPassword && req.body.newPassword) {
            const curPassword: string = req.body.curPassword;
            const newPassword: string = req.body.newPassword;
            const email: string = token.payload.email;
            console.log("All conditions met");
            userModel.findOne({"email": email})
                .then((user: mongoose.Document | null): void => {
                    if (user) {
                        bcrypt.compare(curPassword, user.toJSON().password)
                            .then((match: boolean): void => {
                                if (match) {
                                    bcrypt.genSalt(10)
                                    .then((salt: string): Promise<string> => {
                                        return bcrypt.hash(newPassword, salt);
                                    })
                                    .then((hash: string): mongoose.Query<mongoose.Document | null, mongoose.Document, {}> => {
                                        return userModel.findOneAndUpdate({"email":email}, {$set:{
                                            password: hash
                                        }})
                                    })
                                    .then((user: mongoose.Document | null): void => {
                                        if (user) {
                                            res.sendStatus(200);
                                        } else {
                                            res.sendStatus(500);
                                        }
                                    })
                                    .catch((err: Error): void => {
                                        next(err)
                                    });
                                } else {
                                    res.sendStatus(403);
                                }
                            })
                            .catch((err: Error): void => {
                                next(err);
                            });
                    } else {
                        res.sendStatus(400);
                    }
                })
        } else {
            res.sendStatus(400);
        }
    })

export default usersRouter;