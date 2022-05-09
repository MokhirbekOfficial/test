import { ServiceStorage } from './mongo/service'
import { UserStorage } from './mongo/user'
import { SampleStorage } from './mongo/sample'
import { AdminStorage } from './mongo/admin'
import { VehicleStorage } from './mongo/vehicle'
import { DriverStorage } from './mongo/driver'
import { CompanyStorage } from './mongo/company'
import { DvirStorage } from './mongo/dvir'
import { IFTAStorage } from './mongo/ifta'
import { LogStorage } from './mongo/log'

interface IStorage {
    service: ServiceStorage
    user: UserStorage
    sample: SampleStorage
    admin: AdminStorage
    vehicle: VehicleStorage
    driver: DriverStorage
    company: CompanyStorage
    dvir: DvirStorage
    ifta: IFTAStorage
    log: LogStorage
}

export let storage: IStorage = {
    service: new ServiceStorage(),
    user: new UserStorage(),
    sample: new SampleStorage(),
    admin: new AdminStorage(),
    vehicle: new VehicleStorage(),
    driver: new DriverStorage(),
    company: new CompanyStorage(),
    dvir: new DvirStorage(),
    ifta: new IFTAStorage(),
    log: new LogStorage()
}
