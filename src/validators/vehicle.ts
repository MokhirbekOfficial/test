import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class VehicleValidator {
    private createSchema = Joi.object({
        vehicle_id: Joi.string().required(),
        company_id: Joi.string().uuid().required(),
        driver_id: Joi.string().uuid(),
        make: Joi.string().allow(''),
        model: Joi.string().allow(''),
        vin_code: Joi.string().allow(''),
        year: Joi.number().integer(),
        licence_plate: Joi.object({
            number: Joi.number().integer().required(),
            state: Joi.string().required()
        }),
        eld: Joi.object({
            id: Joi.string().allow('').required(),
            provider: Joi.string().required()
        }),
        fuel_type: Joi.string().allow(''),
        notes: Joi.string().allow('')
    })

    private updateSchema = Joi.object({
        driver_id: Joi.string().when('status', {
            is: 'inactive',
            then: Joi.forbidden()
        }),
        vehicle_id: Joi.forbidden(),
        vin_code: Joi.forbidden(),
        make: Joi.string().allow(''),
        model: Joi.string().allow(''),
        year: Joi.number().integer(),
        licence_plate: Joi.object({
            number: Joi.number().integer().required(),
            state: Joi.string().required()
        }),
        eld: Joi.object({
            id: Joi.string().required(),
            provider: Joi.string().required()
        }),
        fuel_type: Joi.string().allow(''),
        notes: Joi.string().allow(''),
        status: Joi.string().valid('inactive', 'active')
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.createSchema.validate(req.body)
        if (error) return next(error)

        next()
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.updateSchema.validate(req.body)
        if (error || !req.body.length) return next(error)

        next()
    })
}
