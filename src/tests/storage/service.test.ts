import { IService } from '../../models/Service'
import { ServiceStorage } from '../../storage/mongo/service'
import Database from '../../core/db'

const storage = new ServiceStorage()

beforeAll(async () => {
    const db = new Database()
    await db.connect()
})

describe('Checking storage.service', () => {
    const service = {
        _id: '93664746-60e4-42ba-b544-6a8a5bcf4f8f',
        email: 'jh@gmail.com',
        password: '$2b$10$hiCzZvSsTE8ddnSlbPYrnOmL8Co46zKYedDDWUxDfV6zd1rZqGc1.',
        name: 'Nimadur',
        dot_number: 12123
    }

    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca952a56'

    test('Create new service: succes', () => {
        return storage.create(service as IService).then((data) => {
            expect(data._id).toEqual(service._id)
        })
    })

    test('Get all service: success', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('Get one service: success', () => {
        return storage.findOne({ _id: service._id }).then((data) => {
            expect(data._id).toEqual(service._id)
        })
    })

    test('Get one service: fail', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get update service: success', () => {
        const email = 'doe@gmail.com'
        return storage.update(service._id, { email } as IService).then((data) => {
            expect(data._id).toEqual(service._id)
        })
    })

    test('Get update service: fail', () => {
        const email = 'doe@gmail.com'
        return storage.update(fake_id, { email } as IService).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get delete service: succes', () => {
        return storage.delete(service._id).then((data) => {
            expect(data._id).toEqual(service._id)
        })
    })

    test('Get delete service: fail', () => {
        return storage.delete(fake_id).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })
})
