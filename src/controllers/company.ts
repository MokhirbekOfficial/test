import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import { hash, genSalt } from 'bcrypt'
import { ICompany } from '../models/Company'
import { IDriver } from '../models/Driver'
import { IVehicle } from '../models/Vehicle'

export class CompanyController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        let { name, dot_number, type } = req.query

        let search = {}
        if (name) {
            search = {
                name: new RegExp(`^${name}`, 'i')
            }
        } else if (dot_number) {
            search = {
                $where: `/^${dot_number}.*/.test(this.dot_number)`
            }
        } else if (type) {
            search = {
                type: new RegExp(`^${type}`, 'i')
            }
        }

        let companies
        if (role === 'service') {
            companies = await storage.company.find({ ...search, service: id })
        } else if (role === 'admin') {
            companies = await storage.company.find({ ...search })
        }

        res.status(200).json({
            success: true,
            data: {
                companies
            },
            message: message('companny_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const _id = req.params.id

        let company
        if (role === 'admin') {
            company = await storage.company.findOne({ _id })
        } else if (role === 'service') {
            company = await storage.company.findOne({ service: id, _id })
        } else {
            if (role === 'company' && id !== _id) {
                return next(new AppError(403, 'company_403'))
            }

            company = await storage.company.findOne({ _id })
        }

        res.status(200).json({
            success: true,
            data: {
                company
            },
            message: message('company_get_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals,
            { email } = req.body

        const admin = (await storage.admin.find({ email }))[0]
        const driver = (await storage.driver.find({ email }))[0]
        const service = (await storage.service.find({ email }))[0]
        const user = (await storage.user.find({ email }))[0]

        if (admin || driver || service || user) {
            return next(new AppError(404, 'found_404'))
        }

        if (role === 'service') {
            req.body.service = id
            req.body.type = 'company'
        } else {
            req.body.type = 'only_company'
        }

        const salt = await genSalt()
        req.body.password = await hash(req.body.password, salt)

        const company = await storage.company.create(req.body)

        if (role === 'service') {
            await storage.service.update(id, { $inc: { total_companies: 1 } })
        }

        res.status(201).json({
            success: true,
            data: {
                company
            },
            message: message('company_create_201', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { password, status } = req.body, { lang, id, role } = res.locals, _id = req.params.id

        let company = await storage.company.findOne({ _id })

        if (role === 'service' && company.service !== id) {
            return next(new AppError(403, 'company_403'))
        }

        if (password) {
            const salt = await genSalt()
            req.body.password = await hash(password, salt)
        }

        if (status === 'inactive') {
            await storage.driver.updateMany({ company: company.id }, { status } as IDriver)
            await storage.vehicle.updateMany({ company: company.id }, { status } as IVehicle)
        }

        company = await storage.company.update({ _id }, req.body)

        res.status(200).json({
            success: true,
            data: {
                company
            },
            message: message('company_update_200', lang)
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const _id = req.params.id
        let company: ICompany

        if (role === 'service') {
            company = await storage.company.findOne({ _id, service: id })
        } else {
            company = await storage.company.findOne({ _id })
        }

        if (company.total_drivers || company.total_vehicles) {
            return next(new AppError(403, 'company_delete_403'))
        }

        await storage.company.deleteOne({ _id })

        await storage.service.update(id, { $inc: { total_companies: -1 } })

        res.status(200).json({
            success: true,
            message: message('company_delete_200', lang)
        })
    })
}
