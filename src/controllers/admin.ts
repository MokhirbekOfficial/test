import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import { compare, hash, genSalt } from 'bcrypt'
import { signToken } from '../middleware/auth'

export class AdminController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals

        const admin = await storage.admin.findOne({ _id: id })

        if (admin.type !== 'super_admin') {
            return next(new AppError(403, 'admin_403'))
        }

        const admins = await storage.admin.find(req.query)

        res.status(200).json({
            success: true,
            data: {
                admins
            },
            message: message('admin_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const _id = req.params.id

        let admin = await storage.admin.findOne({ _id: id })

        if (admin.type === 'admin' && id !== _id) {
            return next(new AppError(403, 'admin_403'))
        }

        admin = await storage.admin.findOne({ _id })

        res.status(200).json({
            success: true,
            data: {
                admin
            },
            message: message('admin_getOne_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals, {email} = req.body

        let admin = await storage.admin.findOne({ _id: id })

        const company = (await storage.company.find({email}))[0]
        const driver = (await storage.driver.find({email}))[0]
        const service = (await storage.service.find({email}))[0]
        const user = (await storage.user.find({email}))[0]

        if (company || driver || service || user) {
            return next(new AppError(404, 'found_404'))
        }

        if (admin.type !== 'super_admin') {
            return next(new AppError(403, 'admin_403'))
        }

        const salt = await genSalt()
        req.body.password = await hash(req.body.password, salt)

        admin = await storage.admin.create(req.body)

        res.status(201).json({
            success: true,
            data: {
                admin
            },
            message: message('admin_created_200', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { old_password, new_password } = req.body
        const { lang, id } = res.locals
        const _id = req.params.id

        let admin = await storage.admin.findOne({ _id: id })

        if (admin.type === 'admin' && id !== _id) {
            return next(new AppError(403, 'admin_403'))
        }

        if (new_password) {
            if (!(await compare(old_password, admin.password))) {
                return next(new AppError(401, 'auth_401'))
            }

            const salt = await genSalt()
            req.body.password = await hash(new_password, salt)
        }

        admin = await storage.admin.update({ _id }, req.body)

        res.status(200).json({
            success: true,
            data: {
                admin
            },
            message: message('admin_updated_200', lang)
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { id, lang } = res.locals
        const _id = req.params.id
        let admin = await storage.admin.findOne({ _id: id })

        if (admin.type !== 'super_admin' || id === _id) {
            return next(new AppError(403, 'admin_403'))
        }

        await storage.admin.delete({ _id })

        res.status(200).json({
            success: true,
            message: message('admin_delete_200', lang)
        })
    })

    createSuperAdmin = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { password } = req.body

        const salt = await genSalt()
        const hashed_password = await hash(password, salt)

        const admin = await storage.admin.create({
            ...req.body,
            password: hashed_password,
            type: 'super_admin'
        })

        const token = await signToken(admin.id, 'admin')

        res.status(201).json({
            success: true,
            data: {
                admin,
                token
            }
        })
    })
}
