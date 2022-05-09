import { DvirRepo } from '../repo/dvir'
import Dvir, { IDvir } from '../../models/DVIR'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class DvirStorage implements DvirRepo {
    private scope = 'storage.service'

    async find(query: Object): Promise<IDvir[]> {
        try {
            const dvir = await Dvir.find({ ...query })

            return dvir
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IDvir> {
        try {
            const dvir = await Dvir.findOne({ ...query })

            if (!dvir) {
                logger.warn(`${this.scope}.get failed to findOne`)
                throw new AppError(404, 'dvir_404')
            }

            return dvir
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IDvir): Promise<IDvir> {
        try {
            const dvir = await Dvir.create(payload)

            return dvir
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IDvir> {
        try {
            const dvir = await Dvir.findOneAndDelete(query)

            if (!dvir) {
                logger.warn(`${this.scope}.delete failed to findOneAndDelete`)
                throw new AppError(404, 'dvir_404')
            }

            return dvir
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
