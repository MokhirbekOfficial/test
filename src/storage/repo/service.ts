import { IService } from '../../models/Service'

export interface ServiceRepo {
    find(query: Object): Promise<IService[]>
    findOne(query: Object): Promise<IService>
    create(payload: IService): Promise<IService>
    update(query: Object, payload: Object): Promise<IService>
    delete(query: Object): Promise<IService>
}
