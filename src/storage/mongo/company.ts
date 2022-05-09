import { CompanyRepo } from '../repo/company'
import Company, { ICompany } from '../../models/Company'
import { logger } from '../../config/logger'
import AppError from '../../utils/appError'

export class CompanyStorage implements CompanyRepo {
    private scope = 'storage.company'

    async find(query: Object): Promise<ICompany[]> {
        try {
            const companies = await Company.find(query).populate('service', 'name')

            return companies
        } catch (error) {
            logger.error(`${this.scope}.find: finished with error: ${error}`)
            throw error
        }
    }

    async findOne(query: Object): Promise<ICompany> {
        try {
            const company = await Company.findOne(query)

            if (!company) {
                logger.warn(`${this.scope}.get failed to findOne`)
                throw new AppError(404, 'company_404')
            }

            return company
        } catch (error) {
            logger.error(`${this.scope}.findOne: finished with error: ${error}`)
            throw error
        }
    }

    async create(payload: ICompany): Promise<ICompany> {
        try {
            const company = await Company.create(payload)

            return company
        } catch (error) {
            logger.error(`${this.scope}.create: finished with error: ${error}`)
            throw error
        }
    }

    async update(query: object, payload: ICompany | Object): Promise<ICompany> {
        try {
            const company = await Company.findOneAndUpdate(query, payload, {
                new: true
            })

            if (!company) {
                logger.warn(`${this.scope}.update failed to findOneAndUpdate`)
                throw new AppError(404, 'company_404')
            }

            return company
        } catch (error) {
            logger.error(`${this.scope}.update: finished with error: ${error}`)
            throw error
        }
    }

    async updateMany(query: object, payload: ICompany): Promise<Object> {
        try {
            const db_res = await Company.updateMany(query, payload)

            return db_res
        } catch (error) {
            logger.error(`${this.scope}.updateMany: finished with error: ${error}`)
            throw error
        }
    }

    async deleteOne(query: Object): Promise<Object> {
        try {
            const company = await Company.findOneAndDelete(query)

            if (!company) {
                logger.warn(`${this.scope}.delete failed to find one and delete`)
                throw new AppError(404, 'company_404')
            }

            return company
        } catch (error) {
            logger.error(`${this.scope}.delete: finished with error: ${error}`)
            throw error
        }
    }
}
