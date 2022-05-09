import { IDriver } from '../../models/Driver'
import { DriverStorage } from '../../storage/mongo/driver'
import Database from '../../core/db'

const storage = new DriverStorage()

beforeAll(async () => {
    const db = new Database()
    await db.connect()
})

describe('Checking storage.driver', () => {
    const driver = {
        _id: '8bf5fc5c-0558-408c-a12-5995dca952a0cd',
        company: 'yutechnologies',
        vehicle: '48bf5fc5c-0558-408c-a12-5995dca952a0cd4',
        co_driver: 'Somali',
        current_position: {
            location: 'Madrid',
            date: 12
        },
        carrier: 'Olib boruvchi',
        email: 'nyunusov2221@mail.ru',
        password: 'admin',
        name: {
            first_name: 'qwerty',
            last_name: 'qwerty'
        },
        phone_number: 998971231815,
        licence: {
            number: '9781',
            issuing_state: 'Canada'
        },
        terminal_address: 'ABD',
        notes: 'Haydovchilarning eng yaxshilaridan'
    }

    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca952a56'

    test('Create new driver: success', () => {
        return storage.create(driver as IDriver).then((data) => {
            expect(data._id).toEqual(driver._id)
        })
    })

    test('Get all driver: success', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('Get one driver: success', () => {
        return storage.findOne({ _id: driver._id }).then((data) => {
            expect(data._id).toEqual(driver._id)
        })
    })

    test('Get one driver: fail', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get update driver: success', () => {
        const company = 'YU_HOLDING'
        return storage.update(driver._id, { company } as IDriver).then((data) => {
            expect(data._id).toEqual(driver._id)
        })
    })

    test('Get update driver: fail', () => {
        const company = 'YU_HOLDING'
        return storage.update(fake_id, { company } as IDriver).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get delete driver: success', () => {
        return storage.delete(driver._id).then((data) => {
            expect(data._id).toEqual(driver._id)
        })
    })

    test('Get delete driver: fail', () => {
        return storage.delete(fake_id).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })
})
