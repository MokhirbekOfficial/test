import { IVehicle } from '../../models/Vehicle'
import { VehicleStorage } from '../../storage/mongo/vehicle'
import Database from '../../core/db'

const storage = new VehicleStorage()

beforeAll(async () => {
    const db = new Database()
    await db.connect()
})

describe('Checking storage.vehicle', () => {

    const vehicle = {
        "_id": "'8bf5fc5c-0558-408c-a12f-95dca952a56'",
        'company': 'argun holding',
        'driver': '48bf5fc5c-0558-408c-a12-5995dca952a0cd4',
        'make': 'Otokar',
        'model': 'Not heavy',
        'vin_code': '564545',
        'year': 2020,
        'licence_plate': {
            'number': 54,
            'state': 'Moscow'
        },
        'eld': {
            'id': '2314351',
            'provider': 'Moscow-Minsk'
        },
        'fuel_type': 'Benzin',
        'notes': 'Yaxshi mashina'
    }

    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca952a56'

    test('Create new vehicle: success', () => {
        return storage.create(vehicle as IVehicle).then((data) => {
            expect(data._id).toEqual(vehicle._id)
        })
    })

    test('Get all vehicle: success', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('Get one vehicle: success', () => {
        return storage.findOne({ _id: vehicle._id }).then((data) => {
            expect(data._id).toEqual(vehicle._id)
        })
    })

    test('Get one vehicle: fail', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get update vehicle: success', () => {
        const company = 'YU_HOLDING'
        return storage.update(vehicle._id, { company } as IVehicle).then((data) => {
            expect(data._id).toEqual(vehicle._id)
        })
    })

    test('Get update vehicle: fail', () => {
        const company = 'YU_HOLDING'
        return storage.update(fake_id, { company } as IVehicle).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get delete vehicle: success', () => {
        return storage.delete(vehicle._id).then((data) => {
            expect(data._id).toEqual(vehicle._id)
        })
    })

    test('Get delete vehicle: fail', () => {
        return storage.delete(fake_id).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })
})
