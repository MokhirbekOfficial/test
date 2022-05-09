import { NextFunction, Request, Response } from 'express'
import { storage } from '../storage/main'
import AppError from '../utils/appError'
import catchAsync from '../utils/catchAsync'
import { message } from '../locales/get_message'
import { IIFTA } from '../models/IFTA'

export class IFTAController {
    getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let filter = {}, iftas: IIFTA[]
        const { lang, id, role } = res.locals, search = req.query.search as string
        delete req.query.search

        if (search) {
            filter = {
                ...req.query,
                $or: [
                    { name: { $regex: search.trim(), $options: 'i' } },
                    { type: { $regex: search.trim(), $options: 'i' } }
                ]
            }
        }

        if (role === 'company') {
            iftas = await storage.ifta.find({ ...filter, company: id })
        } else if (role === 'service') {
            iftas = await storage.ifta.find({ ...filter, service: id })
        } else {
            iftas = await storage.ifta.find(filter)
        }

        res.status(200).json({
            success: true,
            data: {
                iftas
            },
            message: message('ifta_getAll_200', lang)
        })
    })

    getOne = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let ifta
        const { lang, role, id } = res.locals,
            _id = req.params.id

        if (role === 'company') {
            ifta = await storage.ifta.findOne({ _id, company: id })
        } else if (role === 'service') {
            ifta = await storage.ifta.findOne({ _id, service: id })
        } else {
            ifta = await storage.ifta.findOne({ _id })
        }

        res.status(200).json({
            success: true,
            data: {
                ifta
            },
            message: message('ifta_getOne_200', lang)
        })
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        let company
        const { lang, role, id } = res.locals, { vehicle_id, company_id } = req.body

        if (role === 'company') {
            company = await storage.company.findOne({ _id: company_id, status: 'active' })

            if (company?.service) {
                req.body.service = company.service
            }

            req.body.company = id
        } else {
            company = await storage.company.findOne({ _id: company_id, service: id, status: 'active' })

            req.body.company = company._id

            req.body.service = company.service
        }

        const vehicle = await storage.vehicle.findOne({ _id: vehicle_id, company: company_id, status: 'active' })

        req.body.vehicle = vehicle._id

        const ifta = await storage.ifta.create(req.body)

        res.status(201).json({
            success: true,
            data: {
                ifta
            },
            message: message('ifta_created_201', lang)
        })
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, role, id } = res.locals, { vehicle_id, status } = req.body, _id = req.params.id

        let ifta = await storage.ifta.findOne({ _id })

        if (
            (role === 'company' && ifta.company !== id) ||
            (role === 'service' && ifta.service !== id)
        ) {
            return next(new AppError(401, 'auth_401'))
        }

        if (vehicle_id && vehicle_id !== ifta.vehicle) {
            const vehicle = await storage.vehicle.findOne({
                _id: vehicle_id,
                company: ifta.company,
                status: 'active'
            })

            req.body.vehicle = vehicle._id
        }

        ifta = await storage.ifta.update({ _id }, req.body)

        res.status(200).json({
            success: true,
            data: {
                ifta
            },
            message: message('ifta_updated_200', lang)
        })
    })

    delete = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { lang, role, id } = res.locals, _id = req.params.id

        if (role === 'company') {
            await storage.ifta.delete({ _id, company: id })
        } else {
            await storage.ifta.delete({ _id, service: id })
        }

        res.status(200).json({
            success: true,
            message: message('ifta_deleted_200', lang)
        })
    })
}
