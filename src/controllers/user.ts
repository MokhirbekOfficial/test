import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import { compare, hash, genSalt } from 'bcrypt'
import { signToken } from '../middleware/auth'

export class UserController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let filter = {}
        const { lang, id, role } = res.locals,
            search = req.query.search as string
        delete req.query.search
        if (role === 'service') {
            filter = {
                service: id
            }
        } else if (role === 'company') {
            filter = {
                type_id: id
            }
        }

        if (search) {
            filter = {
                ...filter,
                $or: [
                    {
                        'name.first_name': new RegExp(search, 'i')
                    },
                    {
                        'name.last_name': new RegExp(search, 'i')
                    }
                ]
            }
        }

        const users = await storage.user.find(filter),
            mess = message('user_getAll_200', lang)

        res.locals.data = {
            success: true,
            data: {
                users
            },
            message: mess
        }

        res.status(200).json({
            success: true,
            data: {
                users
            },
            message: mess
        })

        next()
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const user = await storage.user.findOne({ _id: req.params.id })

        if (
            (role === 'service' && user.service !== id) ||
            (role === 'company' && user.type_id !== id)
        ) {
            return next(new AppError(400, 'user_400'))
        }

        res.status(200).json({
            success: true,
            data: {
                user
            },
            message: message('user_get_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const { type, type_id, password, email } = req.body

        const admin = (await storage.admin.find({ email }))[0]
        const company = (await storage.company.find({ email }))[0]
        const driver = (await storage.driver.find({ email }))[0]
        const service = (await storage.service.find({ email }))[0]

        if (admin || company || driver || service) {
            return next(new AppError(404, 'found_404'))
        }

        if (role === 'service') {
            if (type === 'service') {
                if (id !== type_id) {
                    return next(new AppError(400, 'user_400'))
                }

                req.body.service = id
            } else {
                await storage.company.findOne({ _id: type_id, service: id })
            }
        } else {
            if (type === 'service' || id !== type_id) {
                return next(new AppError(400, 'user_400'))
            }

            const company = await storage.company.findOne({ _id: type_id })

            if (company?.service) {
                req.body.service = company.service
            }
        }

        const salt = await genSalt()
        req.body.password = await hash(password, salt)

        const user = await storage.user.create(req.body)

        res.status(201).json({
            success: true,
            data: {
                user
            },
            message: message('user_create_201', lang)
        })

        next()
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const { new_password, old_password } = req.body
        const _id = req.params.id
        let user = await storage.user.findOne({ _id })

        if (
            (role === 'service' && user.service !== id) ||
            (role === 'company' && user.type_id !== id)
        ) {
            return next(new AppError(403, 'auth_403'))
        }

        if (new_password) {
            if (!(await compare(old_password, user.password))) {
                return next(new AppError(401, 'password_401'))
            }

            const salt = await genSalt()
            req.body.password = await hash(new_password, salt)
        }

        user = await storage.user.update({ _id }, req.body)

        res.status(201).json({
            success: true,
            data: {
                user
            },
            message: message('user_updated_200', lang)
        })

        next()
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const _id = req.params.id

        if (role === 'service') {
            await storage.user.delete({ _id, service: id })
        } else {
            await storage.user.delete({ _id, type_id: id })
        }

        res.status(201).json({
            success: true,
            message: message('user_deleted_200', lang)
        })

        next()
    })
}
