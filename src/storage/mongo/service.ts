import { ServiceRepo } from '../repo/service'
import Service, { IService } from '../../models/Service'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class ServiceStorage implements ServiceRepo {
    private scope = 'storage.service'

    async find(query: Object): Promise<IService[]> {
        try {
            const service = await Service.find({ ...query })

            return service
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IService> {
        try {
            const service = await Service.findOne({ ...query })

            if (!service) {
                logger.warn(`${this.scope}.get failed to findOne`)
                throw new AppError(404, 'service_404')
            }

            return service
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IService): Promise<IService> {
        try {
            const service = await Service.create(payload)

            return service
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IService | Object): Promise<IService> {
        try {
            const service = await Service.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!service) {
                logger.warn(`${this.scope}.update failed to findOneAndUpdate`)
                throw new AppError(404, 'service_404')
            }

            return service
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IService> {
        try {
            const service = await Service.findOneAndDelete(query)

            if (!service) {
                logger.warn(`${this.scope}.delete failed to findOneAndDelete`)
                throw new AppError(404, 'service_404')
            }

            return service
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
