import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'
import { unlink } from 'fs/promises'
import { join } from 'path'
import { ILog } from '../models/Log'

export class LogController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals

        let logs
        if (role === 'service') {
            logs = await storage.log.find({ service: id })
        } else if (role === 'company') {
            logs = (await storage.log.find({ company: id }))
        } else if (role === 'driver') {
            logs = (await storage.log.find({ driver: id }))
        } else {
            logs = await storage.log.find({})
        }

        res.status(200).json({
            success: true,
            data: {
                logs
            },
            message: message('log_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals, _id = req.params.id

        let log: ILog
        if (role === 'service') {
            log = await storage.log.findOne({ _id, service: id })
        } else if (role === 'company') {
            log = await storage.log.findOne({ _id, company: id })
        } else if (role === 'driver') {
            log = await storage.log.findOne({ _id, driver: id })
        } else {
            log = await storage.log.findOne({ _id })
        }

        res.status(200).json({
            success: true,
            data: {
                log
            },
            message: message('log_get_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals, { odometer, engine_hours } = req.body
        let { status } = req.body

        let driver = await storage.driver.findOne({ _id: id })
        let co_driver = driver.co_driver
        let last_log = (await storage.log.find({ vehicle: driver.vehicle }))[0]
        let vehicle = await storage.vehicle.findOne({ _id: driver.vehicle })

        if (!req.file && !driver.signature) {
            return next(new AppError(400, 'Signature is required!'))
        }

        if (driver.service) {
            req.body.service = driver.service
        }

        req.body.company = driver.company
        req.body.driver = id
        req.body.co_driver = driver.co_driver
        req.body.vehicle = driver.vehicle


        // // ************ ERROR CONDITIONS ************

        if (!last_log && status !== 'login') {
            return next(new AppError(400, 'log_400'))
        }

        if (last_log) {
            if (
                ((!['dr', 'on(ym)', 'off(pc)'].includes(last_log.status)) && status === 'intermediate') ||
                (last_log.status !== 'on' && status === 'dr')
            ) {
                return next(new AppError(400, 'log_400'))
            }
            if (status === 'intermediate') {
                if (last_log.status === 'dr') {
                    status = 'intermediate(dr)'
                } else if (last_log.status === 'on(ym)') {
                    status = 'intermediate(ym)'
                } else if (last_log.status === 'off(pc)') {
                    status = 'intermediate(pc)'
                }
            }

            // ************ FAULT CONDITIONS ************

            // fault with odometer
            // req.body.faults = []
            // if (
            //     (status === 'intermediate' && last_log.odometer === +odometer) ||
            //     (last_log.status === 'on' && status === 'off' && last_log.odometer !== +odometer) ||
            //     ((status === 'on' || status === 'sb' || status === 'dr') &&
            //         last_log.odometer !== +odometer)
            // ) {
            //     req.body.faults.push('There is something wrong with the odometer!')
            // }

            // faults with engine hours
            // if (
            //     (status === 'intermediate' && last_log.engine_hours === +engine_hours) ||
            //     ((status === 'on' || status === 'sb') && last_log.engine_hours !== +engine_hours)
            // ) {
            //     req.body.faults.push('There is something wrong with the engine hours!')
            // }

            // ************ WARNING CONDITIONS ************

            req.body.warnings = []
            if ((['on', 'on(ym)', 'off(pc)', 'dr'].includes(status)) && (odometer + 1 > last_log.odometer)) {
                req.body.warnings.push('odometer warning!')
            }
            if ((['on', 'on(ym)', 'off(pc)', 'power on', 'dr'].includes(status)) && (odometer + 1 > last_log.odometer)) {
                req.body.warnings.push('odometer warning!')
            }
        }

        // // ************ SIGNATURE PICTURE UPLOAD ************

        // if (req.file) {
        //     const signature = `images/${req.file?.fieldname}-${uuidv4()}.png`
        //     await sharp(req.file?.buffer)
        //         .png()
        //         .toFile(join(__dirname, '../../../uploads', signature))

        //     if (driver.signature) {
        //         await unlink(join(__dirname, '../../../uploads', driver.signature))
        //     }

        //     driver.signature = signature
        // }

        // const log = await storage.log.create(req.body)

        // if (last_log && log) {
        //     last_log.hours = log.created_at - last_log.created_at
        //     // last_log.hours = moment().subtract(log.created_at - last_log.created_at).milliseconds()
        //     await last_log.save()
        // }


        // if (driver.co_driver !== co_driver_id) {
        //     driver.co_driver = co_driver.driver_id
        //     co_driver.co_driver = driver.driver_id

        //     if (co_driver.vehicle) {
        //         let e_vehicle = await storage.vehicle.findOne({_id: co_driver.vehicle})
        //         const item = e_vehicle.drivers.indexOf(co_driver.driver_id)
        //         if (item > -1) e_vehicle.drivers.splice(item)
        //         await e_vehicle.save()
        //     }

        //     co_driver.vehicle = driver.vehicle

        //     await co_driver.save()



        //     const index = vehicle.drivers.indexOf(co_driver.driver_id)
        //     if (index <= -1) vehicle.drivers.push(co_driver.driver_id)
        //     await vehicle.save()
        // }


        // driver.signature = driver.signature
        // driver.current_position.location = log.location.name
        // driver.current_position.date = log.created_at
        // if (status !== 'intermediate') driver.status = status
        // await driver.save()

        // res.status(201).json({
        //     success: true,
        //     data: {
        //         log
        //     },
        //     message: message('log_create_201', lang)
        // })
    })
}
