import { IDriver } from '../../models/Driver'

export interface DriverRepo {
    find(query: Object): Promise<IDriver[]>
    findOne(query: Object): Promise<IDriver>
    create(payload: IDriver): Promise<IDriver>
    update(query: Object, payload: IDriver): Promise<IDriver>
    updateMany(query: Object, payload: IDriver): Promise<Object>
    delete(query: Object): Promise<IDriver>
    count(query: Object): Promise<number>
}
