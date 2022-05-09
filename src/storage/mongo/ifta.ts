import { IFTARepo } from '../repo/ifta'
import IFTA, { IIFTA } from '../../models/IFTA'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class IFTAStorage implements IFTARepo {
    private scope = 'storage.ifta'

    async find(query: Object): Promise<IIFTA[]> {
        try {
            const iftas = await IFTA.find(query).populate("vehicle")

            return iftas
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IIFTA> {
        try {
            const ifta = await IFTA.findOne(query).populate("vehicle")

            if (!ifta) {
                logger.warn(`${this.scope}.get failed to findOne`)
                throw new AppError(404, 'ifta_notFound_404')
            }

            return ifta
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IIFTA): Promise<IIFTA> {
        try {
            const ifta = await IFTA.create(payload)

            return ifta
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IIFTA): Promise<IIFTA> {
        try {
            const ifta = await IFTA.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!ifta) {
                logger.warn(`${this.scope}.update failed to findOneAndUpdate`)
                throw new AppError(404, 'ifta_notUpdated_404')
            }

            return ifta
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IIFTA> {
        try {
            const ifta = await IFTA.findOneAndDelete(query)

            if (!ifta) {
                logger.warn(`${this.scope}.delete failed to findOneAndDelete`)
                throw new AppError(404, 'ifta_notDeleted_404')
            }

            return ifta
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
