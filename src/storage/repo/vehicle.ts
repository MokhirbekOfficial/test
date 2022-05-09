import { IVehicle } from '../../models/Vehicle'

export interface VehicleRepo {
    find(query: Object): Promise<IVehicle[]>
    findOne(query: Object): Promise<IVehicle>
    create(payload: IVehicle): Promise<IVehicle>
    update(query: Object, payload: IVehicle): Promise<IVehicle>
    updateMany(query: Object, payload: IVehicle): Promise<Object>
    delete(query: Object): Promise<IVehicle>
}
