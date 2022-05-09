import { ILog } from '../../models/Log'

export interface LogRepo {
    find(query: Object): Promise<ILog[]>
    findOne(query: Object): Promise<ILog>
    create(payload: ILog): Promise<ILog>
    update(query: Object, payload: ILog): Promise<ILog>
    deleteOne(query: Object): Promise<Object>
}
