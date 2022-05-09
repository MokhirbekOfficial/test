import { IDvir } from '../../models/DVIR'

export interface DvirRepo {
    find(query: Object): Promise<IDvir[]>
    findOne(query: Object): Promise<IDvir>
    create(payload: IDvir): Promise<IDvir>
    delete(query: Object): Promise<IDvir>
}
