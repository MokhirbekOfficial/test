import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class UserValidator {
    createSchema = Joi.object({
        name: Joi.object({
            first_name: Joi.string().required(),
            last_name: Joi.string().required()
        }).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(5).max(10).required(),
        phone_number: Joi.number().required(),
        type: Joi.string().valid('service', 'company').required(),
        type_id: Joi.string().uuid().required()
    })

    updateSchema = Joi.object({
        name: Joi.object({
            first_name: Joi.string().required(),
            last_name: Joi.string().required()
        }),
        email: Joi.string().email(),
        phone_number: Joi.number(),
        old_password: Joi.string().min(5).max(10).when('new_password', {
            is: Joi.exist(),
            then: Joi.required(),
            otherwise: Joi.forbidden()
        }),
        new_password: Joi.string().min(5).max(10).when('status', {
            is: 'inactive',
            then: Joi.forbidden()
        }),
        status: Joi.string().valid('active', 'inactive'),
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.createSchema.validate(req.body)
        if (error) return next(error)

        next()
    })

    update = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { error } = this.updateSchema.validate(req.body)
        if (error) return next(error)

        next()
    })
}
