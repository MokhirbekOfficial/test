import { DriverRepo } from '../repo/driver'
import Driver, { IDriver } from '../../models/Driver'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class DriverStorage implements DriverRepo {
    private scope = 'storage.driver'

    async find(query: object): Promise<IDriver[]> {
        try {
            return await Driver.find(query)
                .populate([
                    { path: 'vehicle', select: '-__v' },
                    { path: 'service', select: 'name' },
                    { path: 'company', select: 'name' },
                    { path: 'co_driver', select: 'name' }
                ])
                .select('-password -__v').sort({ created_at: -1 })
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IDriver> {
        try {
            const driver = await Driver.findOne(query).populate('vehicle').select('-__v')

            if (!driver) {
                logger.warn(`${this.scope}.get failed to findOne`)
                throw new AppError(404, 'driver_notFound_404')
            }

            return driver
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IDriver): Promise<IDriver> {
        try {
            return await Driver.create(payload)
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IDriver): Promise<IDriver> {
        try {
            const driver = await Driver.findOneAndUpdate(query, payload, { new: true }).select(
                '-password -__v'
            )

            if (!driver) {
                logger.warn(`${this.scope}.update failed to findOneAndUpdate`)
                throw new AppError(404, 'driver_notUpdated_404')
            }

            return driver
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async updateMany(query: Object, payload: IDriver): Promise<Object> {
        try {
            const db_res = await Driver.updateMany(query, payload)

            return db_res
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IDriver> {
        try {
            const driver = await Driver.findOneAndDelete(query).select('-password -__v')

            if (!driver) {
                logger.warn(`${this.scope}.delete failed to findOneAndDelete`)
                throw new AppError(404, 'driver_notDeleted_404')
            }

            return driver
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }

    async count(query: Object): Promise<number> {
        try {
            return await Driver.countDocuments(query)
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
