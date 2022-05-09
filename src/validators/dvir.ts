import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import catchAsync from '../utils/catchAsync'

export class DvirValidator {
    createSchema = Joi.object({
        trailer: Joi.string().required(),
        defects: Joi.object({
            trailer: Joi.array().items(Joi.string()),
            unit: Joi.array().items(Joi.string())
        }),
        location: Joi.string().required(),
        date: Joi.number().required(),
        odometer: Joi.number().required(),
        defect_comment: Joi.string()
    })

    create = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const defects = req.body.defects
        if(defects){
            req.body.defects = JSON.parse(defects)
        }
        const { error } = this.createSchema.validate(req.body)
        if (error) return next(error)

        next()
    })
}
