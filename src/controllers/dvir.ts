import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import path from 'path'
import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'

export class DvirController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        if (role === 'service') {
            req.query = {
                service: id
            }
        } else if (role === 'company') {
            req.query = {
                company: id
            }
        } else if (role === 'driver') {
            req.query = {
                driver: id
            }
        }
        const dvir = await storage.dvir.find(req.query)
        res.status(200).json({
            success: true,
            data: {
                dvir
            },
            message: message('dvir_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id, role } = res.locals
        const dvir = await storage.dvir.findOne({ _id: req.params.id })
        if (
            (role === 'service' && dvir.service !== id) ||
            (role === 'company' && dvir.company !== id) ||
            (role === 'driver' && dvir.driver !== id)
        ) {
            return next(new AppError(400, 'dvir_400'))
        }
        res.status(200).json({
            success: true,
            data: {
                dvir
            }
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        const driver = await storage.driver.findOne({ _id: id })
        const file = req.file
        if (!driver.vehicle || ['sb', 'dv'].includes(driver.status)) {
            return next(new AppError(400, 'dvir_400'))
        }
        if (!file && !driver.signature) {
            return next(new AppError(404, 'dvir_signature_404'))
        }

        if (file) {
            const photo = `images/${file.fieldname}-${uuidv4()}.png`

            await sharp(file.buffer)
                .png()
                .toFile(path.join(__dirname, '../../../uploads', photo))

            driver.signature = photo
            req.body.signature = photo
        } else {
            req.body.signature = driver.signature
        }

        if (driver.service) {
            req.body.service = driver.service
        }

        req.body.vehicle = driver.vehicle
        req.body.driver = id
        req.body.company = driver.company
        const dvir = await storage.dvir.create(req.body)
        await driver.save()

        res.status(201).json({
            success: true,
            data: {
                dvir
            },
            message: message('dvir_create_201', lang)
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, id } = res.locals
        await storage.dvir.delete({ _id: req.params.id, driver: id })
        res.status(201).json({
            success: true,
            message: message('dvir_deleted_200', lang)
        })
    })
}
