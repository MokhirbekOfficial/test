import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import { compare, hash, genSalt } from 'bcrypt'
import { signToken } from '../middleware/auth'
import { ICompany } from '../models/Company'
import { IDriver } from '../models/Driver'
import { IVehicle } from '../models/Vehicle'

export class ServiceController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const { name, dot_number } = req.query

        let search = {}

        if (name) {
            search = {
                name: new RegExp(`^${name}`, 'i')
            }
        } else if (dot_number) {
            search = {
                $where: `/^${dot_number}.*/.test(this.dot_number)`
            }
        }

        const services = await storage.service.find({ ...search }),
            mess = message('service_getAll_200', lang)

        res.locals.data = {
            success: true,
            data: {
                services
            },
            message: mess
        }

        res.status(200).json({
            success: true,
            data: {
                services
            },
            message: mess
        })

        next()
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const _id = req.params.id

        if (id !== _id && role !== 'admin') {
            return next(new AppError(401, 'auth_401'))
        }

        const service = await storage.service.findOne({ _id })

        res.status(200).json({
            success: true,
            data: {
                service
            },
            message: message('service_get_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals,
            { email } = req.body

        const admin = (await storage.admin.find({ email }))[0]
        const company = (await storage.company.find({ email }))[0]
        const driver = (await storage.driver.find({ email }))[0]
        const user = (await storage.user.find({ email }))[0]

        if (admin || driver || company || user) {
            return next(new AppError(404, 'found_404'))
        }

        const salt = await genSalt()
        req.body.password = await hash(req.body.password, salt)

        const service = await storage.service.create(req.body)

        res.status(201).json({
            success: true,
            data: {
                service
            },
            message: message('service_create_201', lang)
        })

        next()
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals, { password, status } = req.body, _id = req.params.id

        let service = await storage.service.findOne({ _id })

        if ((role === 'service' && service._id !== id) || (role === 'service' && status)) {
            return next(new AppError(403, 'auth_403'))
        }

        if (password) {
            const salt = await genSalt()
            req.body.password = await hash(password, salt)
        }

        service = await storage.service.update({ _id }, req.body)

        if (status === 'inactive') {
            await storage.company.updateMany({ service: service.id }, { status: 'inactive' } as ICompany)
            await storage.driver.updateMany({ service: service.id }, { status: 'inactive' } as IDriver)
            await storage.vehicle.updateMany({ service: service.id }, { status: 'inactive' } as IVehicle)
        }


        res.status(201).json({
            success: true,
            data: {
                service
            },
            message: message('service_updated_200', lang)
        })

        next()
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals
        const service = await storage.service.findOne({ _id: req.params.id })

        if (service.total_vehicles || service.total_companies || service.total_drivers) {
            return next(new AppError(403, 'service_403'))
        }

        await storage.service.delete({ _id: req.params.id })

        res.status(201).json({
            success: true,
            message: message('service_deleted_200', lang)
        })

        next()
    })
}
