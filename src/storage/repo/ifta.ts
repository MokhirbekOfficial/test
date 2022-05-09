import { IIFTA } from '../../models/IFTA'

export interface IFTARepo {
    find(query: Object): Promise<IIFTA[]>
    findOne(query: Object): Promise<IIFTA>
    create(payload: IIFTA): Promise<IIFTA>
    update(id: string, payload: IIFTA): Promise<IIFTA>
    delete(id: string): Promise<IIFTA>
}
