import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class DriverValidator {
    private loginSchema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(5).max(10).required()
    })

    private createSchema = Joi.object({
        driver_id: Joi.string().required(),
        company_id: Joi.string().required(),
        vehicle_id: Joi.string().allow(''),
        co_driver: Joi.string().allow(''),
        service: Joi.string(),
        email: Joi.string().email().required(),
        password: Joi.string().min(5).max(10).required(),
        name: Joi.object({
            first_name: Joi.string().required(),
            last_name: Joi.string().required()
        }).required(),
        username: Joi.string().required(),
        phone_number: Joi.number().integer().required(),
        licence: Joi.object({
            number: Joi.string().required(),
            issuing_state: Joi.string().required()
        }).required(),
        terminal_address: Joi.string().allow(''),
        notes: Joi.string().allow('')
    })

    private updateSchema = Joi.object({
        vehicle_id: Joi.string().when('is_active', {
            is: false,
            then: Joi.forbidden()
        }).allow(''),
        driver_id: Joi.forbidden(),
        co_driver_id: Joi.string().uuid().allow(''),
        current_position: Joi.object({
            location: Joi.string().required(),
            date: Joi.number().required()
        }),
        email: Joi.string().email(),
        password: Joi.string().min(5).max(10).when('is_active', {
            is: false,
            then: Joi.forbidden()
        }),
        name: Joi.forbidden(),
        username: Joi.forbidden(),
        phone_number: Joi.number().integer(),
        licence: Joi.object({
            number: Joi.string().required(),
            issuing_state: Joi.string().required()
        }),
        terminal_address: Joi.string().allow(''),
        notes: Joi.string().allow(''),
        status: Joi.string().valid('on', 'off', 'dr', 'sb'),
        is_active: Joi.boolean(),
        phone_data: Joi.object({
            device: Joi.string(),
            battery: Joi.number().integer(),
            bluetooth: Joi.boolean(),
            eld_connection: Joi.boolean(),
            gsp_permission: Joi.boolean(),
            location: Joi.boolean(),
            microphone: Joi.boolean(),
            storage: Joi.boolean(),
            system_sound: Joi.boolean(),
            system_time: Joi.number(),
            app_version: Joi.string()
        })
    })

    login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.loginSchema.validate(req.body)
        if (error) return next(error)

        next()
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
