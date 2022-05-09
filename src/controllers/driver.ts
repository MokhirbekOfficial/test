import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { join } from 'path'
import { unlink } from 'fs/promises'
import { message } from '../locales/get_message'
import { compare, genSalt, hash } from 'bcrypt'
import { signToken } from '../middleware/auth'
import { IDriver } from '../models/Driver'

export class DriverController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let filter = {},
            drivers
        const { lang, id, role } = res.locals,
            search = req.query.search as string
        delete req.query.search
        if (search) {
            filter = {
                ...req.query,
                $or: [
                    { 'name.first_name': new RegExp(search.trim(), 'i') },
                    { 'name.last_name': new RegExp(search.trim(), 'i') }
                ]
            }
        } else if (req.query) {
            filter = req.query
        }

        if (role === 'company') {
            drivers = await storage.driver.find({ ...filter, company: id })
        } else if (role === 'service') {
            drivers = await storage.driver.find({ ...filter, service: id })
        } else {
            drivers = await storage.driver.find(filter)
        }

        const mess = message('driver_getAll_200', lang)

        res.locals.data = {
            success: true,
            data: {
                drivers
            },
            message: mess
        }

        res.status(200).json({
            success: true,
            data: {
                drivers
            },
            message: mess
        })

        next()
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let driver
        const { lang, role, id } = res.locals,
            _id = req.params.id

        if (role === 'company') {
            driver = await storage.driver.findOne({ _id, company: id })
        } else if (role === 'service') {
            driver = await storage.driver.findOne({ _id, service: id })
        } else {
            if (role === 'driver' && _id !== id) {
                return next(new AppError(403, 'driver_403'))
            }

            driver = await storage.driver.findOne({ _id })
        }

        res.status(200).json({
            success: true,
            data: {
                driver
            },
            message: message('driver_getOne_200', lang)
        })
    })

    login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang } = res.locals, { email, password } = req.body

        const driver = await storage.driver.findOne({ email })

        if (
            !driver ||
            !(await compare(password, driver.password)) ||
            !driver.is_active
        ) {
            return next(new AppError(401, 'password_401'))
        }

        const token = await signToken(driver.id, 'driver')

        res.status(200).json({
            success: true,
            data: {
                driver,
                token
            },
            message: message('driver_loggedIn_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, role, id } = res.locals, { password, company_id, vehicle_id, driver_id, email, co_driver_id } = req.body

        let vehicle, company, co_driver

        const old_driver = (await storage.driver.find({ company: company_id, driver_id }))[0]

        if (old_driver) {
            return next(new AppError(403, 'driver_id_403'))
        }

        const admin = (await storage.admin.find({ email }))[0]
        const e_company = (await storage.company.find({ email }))[0]
        const service = (await storage.service.find({ email }))[0]
        const user = (await storage.user.find({ email }))[0]

        if (e_company || admin || service || user) {
            return next(new AppError(404, 'found_404'))
        }

        const salt = await genSalt()
        req.body.password = await hash(password, salt)

        if (role === 'company') {
            company = await storage.company.findOne({ _id: company_id, status: 'active' })

            if (company.type !== 'only_company') {
                return next(new AppError(401, 'auth_401'))
            }

            req.body.company = id
        } else {
            company = await storage.company.findOne({
                _id: company_id,
                service: id,
                status: 'active'
            })

            req.body.company = company_id
            req.body.service = company.service
        }

        if (co_driver_id) {
            co_driver = await storage.driver.findOne({
                _id: co_driver_id,
                company: company_id,
                is_active: true
            })

            if (co_driver.co_driver || co_driver.vehicle) {
                return next(new AppError(403, 'Co driver is busy'))
            }
            req.body.co_driver = co_driver_id
        }

        if (vehicle_id) {
            vehicle = await storage.vehicle.findOne({
                _id: vehicle_id,
                company: company_id,
                status: 'active'
            })
            req.body.vehicle = vehicle_id
        }

        const driver = await storage.driver.create(req.body)

        if (co_driver) {

            co_driver.co_driver = driver._id
            co_driver.vehicle = driver.vehicle

            if (vehicle) vehicle.drivers.push(co_driver._id)
            await co_driver.save()
        }

        if (vehicle) {

            vehicle.drivers.push(driver._id)
            await vehicle.save()
        }

        company.total_drivers++
        await company.save()

        if (company?.service) {
            await storage.service.update({ _id: company.service }, { $inc: { total_drivers: 1 } })
        }

        res.status(201).json({
            success: true,
            data: {
                driver
            },
            message: message('driver_created_201', lang)
        })

        next()
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { password, vehicle_id, co_driver_id, is_active } = req.body,
            { lang, role, id } = res.locals, _id = req.params.id

        let driver = await storage.driver.findOne({ _id }), vehicle, co_driver

        if (role === 'company' && driver.company !== id) {
            const company = await storage.company.findOne({_id: id, status: 'active'})

            if (company.type !== 'only_company') {
                return next(new AppError(401, 'auth_401'))
            }
        } else if (role === 'service' && driver.service !== id) {
            return next(new AppError(401, 'auth_401'))
        }

        if (driver.status === 'on' || driver.status === 'dr' || driver.status === 'sb') {
            if (is_active || !is_active) {
                return next(new AppError(404, 'driver_notUpdated_404'))
            }
        }

        if (password) {
            const salt = await genSalt()
            req.body.password = await hash(password, salt)
        }

        if (co_driver_id && driver.co_driver !== co_driver_id) {
            co_driver = await storage.driver.findOne({
                _id: co_driver_id,
                company: driver.company,
                is_active: true
            })

            if (co_driver.co_driver || co_driver.vehicle || (co_driver.status === 'on' || co_driver.status === 'dr' || co_driver.status === 'sb')) {
                return next(new AppError(401, 'Co driver is busy'))
            }

            if (driver.co_driver) {
                await storage.driver.update({ _id: driver.co_driver }, { co_driver: '' } as IDriver)
            }

            driver.co_driver = co_driver._id
            co_driver.co_driver = driver._id
            co_driver.vehicle = driver.vehicle
            await co_driver.save()
        }

        if (vehicle_id && vehicle_id !== driver.vehicle) {
            vehicle = await storage.vehicle.findOne({
                _id: vehicle_id,
                company: driver.company,
                status: 'active'
            })

            const e_co_driver = await storage.driver.findOne({_id: driver.co_driver})

            if (e_co_driver) {
                await storage.driver.update({_id: e_co_driver._id}, {co_driver: ''} as IDriver)
            }

            if (driver.vehicle || e_co_driver.vehicle) {
                const index = vehicle.drivers.indexOf(driver._id)
                const item = vehicle.drivers.indexOf(e_co_driver._id)
                if (index > -1) vehicle.drivers.splice(index)
                else if (item > -1) vehicle.drivers.splice(item)
                await vehicle.save()
            }

            driver.vehicle = vehicle._id
            driver.co_driver = ''
            vehicle.drivers.push(driver.driver_id)
            await vehicle.save()
        }

        if (is_active === false) {
            if (driver.vehicle) {
                const e_vehicle = await storage.vehicle.findOne({ _id: driver.vehicle })
                const index = e_vehicle.drivers.indexOf(driver.driver_id)
                if (index > -1) e_vehicle.drivers.splice(index)
                await e_vehicle.save()
            }

            if (driver.co_driver) {
                await storage.driver.update({ _id: driver.co_driver }, { co_driver: '' } as IDriver)
            }

            driver.co_driver = ''
            driver.vehicle = ''
            driver.terminated_date = Date.now()
        }

        driver = await storage.driver.update(
            { _id },
            {
                ...req.body,
                co_driver: driver.co_driver,
                vehicle: driver.vehicle,
                password: driver.password,
                terminated_date: driver.terminated_date
            }
        )

        res.status(200).json({
            success: true,
            data: {
                driver
            },
            message: message('driver_updated_200', lang)
        })

        next()
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, role, id } = res.locals, _id = req.params.id

        const driver = await storage.driver.findOne({ _id })

        if (driver.status === 'on' || driver.status === 'dr' || driver.status === 'sb') {
            return next(new AppError(404, 'driver_notDeleted_404'))
        }

        if (role === 'company') {
            const company = await storage.company.findOne({_id: id, status: 'active'})

            if (company.type !== 'only_company') {
                return next(new AppError(401, 'auth_401'))
            }

            await storage.driver.delete({ _id, company: id })
        } else {
            await storage.driver.delete({ _id, service: id })
        }

        await storage.company.update({ _id: driver.company }, { $inc: { total_drivers: -1 } })

        if (driver?.service) {
            await storage.service.update({ _id: driver.service }, { $inc: { total_drivers: -1 } })
        }

        if (driver.vehicle) {
            const vehicle = await storage.vehicle.findOne({ _id: driver.vehicle })
            const index = vehicle.drivers.indexOf(driver._id)
            if (index > -1) vehicle.drivers.splice(index)
            await vehicle.save()
        }

        if (driver.co_driver) {
            await storage.driver.update({driver_id: driver.co_driver}, {co_driver: ''} as IDriver)
        }

        if (driver.signature) {
            await unlink(join(__dirname, '../../../uploads', driver.signature))
        }

        res.status(200).json({
            success: true,
            message: message('driver_deleted_200', lang)
        })

        next()
    })

    getStatusCounts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        let on, dr, off, sb, active, inactive

        if (role === 'company') {
            on = await storage.driver.count({ company: id, status: 'on' })
            dr = await storage.driver.count({ company: id, status: 'dr' })
            off = await storage.driver.count({ company: id, status: 'off' })
            sb = await storage.driver.count({ company: id, status: 'sb' })
            active = await storage.driver.count({ company: id, status: 'active' })
            inactive = await storage.driver.count({ company: id, status: 'inactive' })
        } else if (role === 'service') {
            on = await storage.driver.count({ service: id, status: 'on' })
            dr = await storage.driver.count({ service: id, status: 'dr' })
            off = await storage.driver.count({ service: id, status: 'off' })
            sb = await storage.driver.count({ service: id, status: 'sb' })
            active = await storage.driver.count({ service: id, status: 'active' })
            inactive = await storage.driver.count({ service: id, status: 'inactive' })
        } else {
            on = await storage.driver.count({ status: 'on' })
            dr = await storage.driver.count({ status: 'dr' })
            off = await storage.driver.count({ status: 'off' })
            sb = await storage.driver.count({ status: 'sb' })
            active = await storage.driver.count({ status: 'active' })
            inactive = await storage.driver.count({ status: 'inactive' })
        }

        res.status(200).json({
            success: true,
            data: {
                status: {
                    on, dr, off, sb, active, inactive
                }
            },
            message: message('drivers_status_200', lang)
        })
    })
}
