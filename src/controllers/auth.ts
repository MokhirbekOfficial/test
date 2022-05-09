import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import { compare } from 'bcrypt'
import { signToken } from '../middleware/auth'

export class AuthController {
    login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let response, type_id!: string, type!: string, token, user_type
        const { lang } = res.locals,
            { email, password } = req.body

        const admin = (await storage.admin.find({ email }))[0]
        const service = (await storage.service.find({ email }))[0]
        const company = (await storage.company.find({ email }))[0]
        const user = (await storage.user.find({ email }))[0]

        if (admin) {
            response = admin
            type = 'admin'
        } else if (service) {
            response = service
            type = 'service'
        } else if (company) {
            response = company
            type = 'company'
        } else if (user) {
            response = user
            type_id = user.type_id
            type = user.type
        }

        if (
            response &&
            (await compare(password, response.password)) &&
            response.status === 'active'
        ) {
            if (user) {
                token = await signToken(type_id, type)
            } else {
                token = await signToken(response._id, type)
            }
        } else {
            return next(new AppError(403, 'auth_403'))
        }

        res.status(200).json({
            success: true,
            data: {
                response,
                type,
                token
            },
            message: message(`${type}_loggedIn_200`, lang)
        })
    })

    profile = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let profile, company_info = null
        const { lang, id, role } = res.locals
        const { company_id } = req.query
        if (role === 'admin') {
            profile = await storage.admin.findOne({ _id: id })
            if (company_id) {
                company_info = await storage.company.findOne({ _id: company_id })
            }
        } else if (role === 'service') {
            profile = (await storage.service.find({ _id: id }))[0]
            if (!profile && !company_id) {
                profile = await storage.user.findOne({ type_id: id })
            } else if (company_id) {
                company_info = await storage.company.findOne({ _id: company_id })
                if (company_info.service !== id) {
                    return next(new AppError(403, 'auth_403'))
                }
            }
        } else if (role === 'company') {
            profile = (await storage.company.find({ _id: id }))[0]
            if (!profile) {
                profile = await storage.user.findOne({ type_id: id })
            }
        }

        res.status(200).json({
            success: true,
            data: {
                profile,
                main_type: role,
                company_info
            },
            message: message(`${role}_loggedIn_200`, lang)
        })
    })
}
