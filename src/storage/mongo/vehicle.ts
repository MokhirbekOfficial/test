import { VehicleRepo } from '../repo/vehicle'
import Vehicle, { IVehicle } from '../../models/Vehicle'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class VehicleStorage implements VehicleRepo {
    private scope = 'storage.vehicle'

    async find(query: Object): Promise<IVehicle[]> {
        try {
            return await Vehicle.find(query).populate('driver').select('-__v').sort({ created_at: -1 })
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<IVehicle> {
        try {
            const vehicle = await Vehicle.findOne(query).populate('driver').select('-__v')

            if (!vehicle) {
                logger.warn(`${this.scope}.get failed to findOne`)
                throw new AppError(404, 'vehicle_notFound_404')
            }

            return vehicle
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: IVehicle): Promise<IVehicle> {
        try {
            return await Vehicle.create(payload)
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: Object, payload: IVehicle): Promise<IVehicle> {
        try {
            const vehicle = await Vehicle.findOneAndUpdate(query, payload, { new: true })

            if (!vehicle) {
                logger.warn(`${this.scope}.update failed to findOneAndUpdate`)
                throw new AppError(404, 'vehicle_notUpdated_404')
            }

            return vehicle
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async updateMany(query: Object, payload: IVehicle): Promise<Object> {
        try {
            const db_res = await Vehicle.updateMany(query, payload)

            return db_res
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async delete(query: Object): Promise<IVehicle> {
        try {
            const vehicle = await Vehicle.findOneAndDelete(query)

            if (!vehicle) {
                logger.warn(`${this.scope}.delete failed to findOneAndDelete`)
                throw new AppError(404, 'vehicle_notDeleted_404')
            }

            return vehicle
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
