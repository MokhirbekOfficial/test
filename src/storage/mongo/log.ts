import { LogRepo } from '../repo/log'
import Log, { ILog } from '../../models/Log'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class LogStorage implements LogRepo {
    private scope = 'storage.log'

    async find(query: Object): Promise<ILog[]> {
        try {
            const logs = await Log.find(query).sort({ created_at: -1 })
            return logs
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<ILog> {
        try {
            const log = await Log.findOne(query).sort({ created_at: -1 })

            if (!log) {
                logger.warn(`${this.scope}.get failed to findOne`)
                throw new AppError(404, 'log_404')
            }

            return log
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: ILog): Promise<ILog> {
        try {
            const log = await Log.create(payload)

            return log
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: object, payload: ILog | Object): Promise<ILog> {
        try {
            const log = await Log.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!log) {
                logger.warn(`${this.scope}.update failed to findByIdAndUpdate`)
                throw new AppError(404, 'log_404')
            }

            return log
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async updateMany(query: object, payload: ILog): Promise<Object> {
        try {
            const db_res = await Log.updateMany(query, payload)

            return db_res
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async deleteOne(query: Object): Promise<Object> {
        try {
            const log = await Log.findOneAndDelete(query)

            if (!log) {
                logger.warn(`${this.scope}.delete failed to find one and delete`)
                throw new AppError(404, 'log_404')
            }

            return log
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
