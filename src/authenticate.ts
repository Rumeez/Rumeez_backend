import passport from 'passport';
import { Strategy as PassportStrategy } from 'passport-strategy';
import User from './models/user.interface';
import jwt from 'jsonwebtoken';
import passportJwt, { ExtractJwt, VerifiedCallback, VerifyCallback } from 'passport-jwt';
import { config } from './config';
import ResponseError from './ResponseError';
import { Request } from 'express';

const opts: passportJwt.StrategyOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secretKey
};

const Strategy: VerifyCallback = (payload: any, done: VerifiedCallback): void => {
    console.log("Strategy used");
    console.log("Payload: " + JSON.stringify(payload));
    done(null, payload);
}

const JwtStrategy: PassportStrategy = new passportJwt.Strategy(opts, Strategy);

passport.use(JwtStrategy);

interface GetToken {
    (user: User): string;
}

export const getToken: GetToken = function(user: any): string {
    console.log("User: " + JSON.stringify(user));
    return jwt.sign(user, config.secretKey, {
        expiresIn: 3600 //Expires in one hour
    });
};

export interface FullJWT {
    token: {
        header: {
            alg: string,
            typ: string
        };
        payload: {
            email: string,
        };
        signature: string;
    };
    err: ResponseError | null;
}

const EmptyToken: FullJWT["token"] = {
        header: {
            alg: "",
            typ: ""
        },
        payload: {
            email: "",
        },
        signature: ""
}

function isFullJWT(obj: any): boolean {
    try {
        const objFullJWT: FullJWT = obj;
        return true;
    } catch {
        return false;
    }
}


export const jwtFromHeader = function(req: Request): FullJWT {
    const token: string | undefined = req.headers.authorization;
    if (token) {
        console.log("Before verify");
        try {
            console.log("token: " + token.split(' ')[1]);
            const decryptedToken: string | object = jwt.verify(token.split(' ')[1], config.secretKey, {complete: true});
            console.log("Made it past verify");
            if (typeof decryptedToken === "object") {
                console.log("Obj");
                console.log("decryptedToken: " + JSON.stringify(decryptedToken));
                const fullJWTcandidate: any = {token: decryptedToken, err: null}
                if (isFullJWT(fullJWTcandidate)) {
                    console.log("Is FullJWT");
                    return fullJWTcandidate;
                } else {
                    console.log("Isn't FullJWT");
                    const err: ResponseError = new Error("Bad JWT Token");
                    err.status = 400;
                    return {token: EmptyToken, err: err};
                }
            } else {
                console.log("String");
                console.log("decryptedToken: " + decryptedToken);
                const err: ResponseError = new Error("Bad JWT Token");
                err.status = 400;
                return {token: EmptyToken, err: err};
            }
        } catch {
            console.log("No bueno")
            const err: ResponseError = new Error("Invalid JWT");
            err.status = 403;
            return {token: EmptyToken, err: err};
        }
    } else {
        const err: ResponseError = new Error("Bad JWT Token");
        err.status = 400;
        return {token: EmptyToken, err: err};
    }
}