import { NextFunction, Request, Response } from 'express'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import jwt from 'jsonwebtoken'
import config from '../config/config'
import { storage } from './../storage/main';

type DecodedToken = {
    id: string
    role: string
}

export const signToken = async (id: string, role: string): Promise<string> => {
    return jwt.sign({ id, role }, config.JwtSecret, { expiresIn: config.Lifetime })
}

export const decodeToken = async (token: string): Promise<DecodedToken> => {
    const decoded = (await jwt.verify(token, config.JwtSecret)) as DecodedToken
    return decoded
}

export class AuthMiddleware {
    auth = (roles: string[]) => {
        return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
            const token = req.headers.authorization

            if (!token) {
                return next(new AppError(401, 'auth_401'))
            }

            const decoded = decodeToken(token)
            const role = (await decoded).role
            const id = (await decoded).id

            if (!roles.includes(role)) {
                return next(new AppError(401, 'auth_401'))
            }

            let exploiter

            if (role === 'admin') {
                exploiter = (await storage.admin.find({ _id: id, status: 'active' }))[0]
            } else if (role === 'service') {
                exploiter = (await storage.service.find({ _id: id, status: 'active' }))[0]
            } else if (role === 'company') {
                exploiter = (await storage.company.find({ _id: id, status: 'active' }))[0]
            } else if (role === 'driver') {
                exploiter = (await storage.driver.find({ _id: id, is_active: true }))[0]
            }

            if (!exploiter) {
                return next(new AppError(401, 'auth_401'))
            }

            res.locals.id = id
            res.locals.role = role

            next()
        })
    }
}
