import { NextFunction, Request, Response } from 'express'
import { IDriver } from '../models/Driver'
import { storage } from '../storage/main'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import { IVehicle } from '../models/Vehicle'
import AppError from '../utils/appError'
import { ICompany } from '../models/Company'

export class VehicleController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let filter = {},
            vehicles
        const { lang, role, id } = res.locals,
            search = req.query.search as string
        delete req.query.search

        if (search) {
            filter = {
                ...req.query,
                $or: [
                    { make: { $regex: search.trim(), $options: 'i' } },
                    { model: { $regex: search.trim(), $options: 'i' } },
                    { vin_code: { $regex: search.trim(), $options: 'i' } },
                    { $where: `/^${search}.*/.test(this.year)` }
                ]
            }
        } else if (req.query) {
            filter = req.query
        }

        if (role === 'company') {
            vehicles = await storage.vehicle.find({ ...filter, company: id })
        } else if (role === 'service') {
            vehicles = await storage.vehicle.find({ ...filter, service: id })
        } else {
            vehicles = await storage.vehicle.find(filter)
        }

        const mess = message('vehicle_getAll_200', lang)

        res.locals.data = {
            success: true,
            data: {
                vehicles
            },
            message: mess
        }

        res.status(200).json({
            success: true,
            data: {
                vehicles
            },
            message: mess
        })

        next()
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let vehicle: IVehicle
        const { lang, role, id } = res.locals, _id = req.params.id

        if (role === 'company') {
            vehicle = await storage.vehicle.findOne({ _id, company: id })
        } else if (role === 'service') {
            vehicle = await storage.vehicle.findOne({ _id, service: id })
        } else {
            vehicle = await storage.vehicle.findOne({ _id })
        }

        res.status(200).json({
            success: true,
            data: {
                vehicle
            },
            message: message('vehicle_getOne_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, role, id } = res.locals, { company_id, driver_id, vehicle_id } = req.body
        let driver

        const old_vehicle = (await storage.vehicle.find({ vehicle_id, company: company_id }))[0]

        if (old_vehicle) {
            return next(new AppError(403, 'wehicle_id_403'))
        }

        let company: ICompany

        if (role === 'company') {
            company = await storage.company.findOne({ _id: id })

            if (company.type !== 'only_company') {
                return next(new AppError(401, 'auth_401'))
            }

            req.body.company = id
        } else {
            company = await storage.company.findOne({ _id: company_id, service: id })

            req.body.company = company_id

            req.body.service = company.service
        }

        if (driver_id) {
            driver = await storage.driver.findOne({
                _id: driver_id,
                company: company_id,
                is_active: true
            })
            req.body.drivers.push(driver_id)
        }

        const vehicle = await storage.vehicle.create(req.body)

        if (driver) {
            driver.vehicle = vehicle._id
            await driver.save()
        }

        company.total_vehicles++
        await company.save()

        if (company?.service) {
            await storage.service.update({ _id: company.service }, { $inc: { total_vehicles: 1 } })
        }

        res.status(201).json({
            success: true,
            data: {
                vehicle
            },
            message: message('vehicle_created_201', lang)
        })

        next()
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { driver_id, status } = req.body, { lang, role, id } = res.locals, _id = req.params.id

        let vehicle = await storage.vehicle.findOne({ _id })


        if (role === 'company' && vehicle.company !== id) {
            const company = await storage.company.findOne({ _id: id, status: 'active' })

            if (company.type !== 'only_company') {
                return next(new AppError(401, 'auth_401'))
            }
        } else if (role === 'service' && vehicle.service !== id) {
            return next(new AppError(401, 'auth_401'))
        }

        if (vehicle.drivers.length > 0) {
            const driver = await storage.driver.find({ vehicle: vehicle._id })

            driver.map(dr => {
                if (dr.status === 'on' || dr.status === 'dr' || dr.status === 'sb') {
                    if (status === 'inactive' || status === 'active') {
                        return next(new AppError(404, 'vehicle_notUpdated_404'))
                    }
                }
            })

        }

        // if (driver_id && !vehicle.drivers.includes(driver_id)) {
        //     const driver = await storage.driver.findOne({ _id: driver_id, is_active: true })
        //
        //     if (driver.vehicle) {
        //         const e_vehicle = await storage.vehicle.findOne({ _id: driver.vehicle, company: driver.company })
        //         const index = e_vehicle.drivers.indexOf(driver._id)
        //         if (index > -1) e_vehicle.drivers.splice(index)
        //         await e_vehicle.save()
        //         // await storage.vehicle.update({ _id: driver.vehicle }, { driver: '' } as IVehicle)
        //     }
        //
        //     vehicle.drivers.push(driver._id)
        //
        //     driver.vehicle = vehicle._id
        //     await driver.save()
        // }

        if (status === 'inactive') {
            if (vehicle.drivers) {
                await storage.driver.updateMany({ _id: vehicle._id }, {
                    vehicle: ''
                } as IDriver)
            }

            vehicle.drivers = []
        }

        vehicle = await storage.vehicle.update(
            { _id },
            {
                ...req.body,
                drivers: vehicle.drivers
                // driver: vehicle.driver
            }
        )

        res.status(200).json({
            success: true,
            data: {
                vehicle
            },
            message: message('driver_updated_200', lang)
        })

        next()
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, role, id } = res.locals,
            _id = req.params.id

        const exist_vehicle = await storage.vehicle.findOne({ _id })

        const iftas = await storage.ifta.find({ vehicle: _id })

        if (iftas.length > 0) {
            return next(new AppError(404, 'vehicle_notDeleted_404'))
        }

        if (exist_vehicle.drivers) {
            const driver = await storage.driver.find({
                vehicle: exist_vehicle._id,
                company: exist_vehicle.company,
                is_active: true
            })

            driver.map(async dr => {
                if (dr.status === 'on' || dr.status === 'dr' || dr.status === 'sb') {
                    return next(new AppError(404, 'vehicle_notDeleted_404'))
                }
            })
        }

        let vehicle: IVehicle

        if (role === 'company') {
            const company = await storage.company.findOne({ _id: id })

            if (company.type !== 'only_company') {
                return next(new AppError(401, 'auth_401'))
            }

            vehicle = await storage.vehicle.delete({ _id, company: id })
        } else {
            vehicle = await storage.vehicle.delete({ _id, service: id })
        }

        await storage.company.update({ _id: vehicle.company }, { $inc: { total_vehicles: -1 } })

        if (vehicle?.service) {
            await storage.service.update({ _id: vehicle.service }, { $inc: { total_vehicles: -1 } })
        }

        if (vehicle.drivers) {
            await storage.driver.updateMany({ _id: vehicle._id }, { vehicle: '' } as IDriver)
        }

        res.status(200).json({
            success: true,
            message: message('vehicle_deleted_200', lang)
        })

        next()
    })
}
