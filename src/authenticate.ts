import passport from 'passport';
import { Strategy as PassportStrategy } from 'passport-strategy';
import User from './models/user.interface';
import jwt from 'jsonwebtoken';
import passportJwt, { ExtractJwt, VerifiedCallback, VerifyCallback } from 'passport-jwt';
import { config } from './config';

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