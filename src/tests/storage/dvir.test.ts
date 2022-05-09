import { IDvir } from '../../models/DVIR'
import { DvirStorage } from '../../storage/mongo/dvir'
import Database from '../../core/db'

const storage = new DvirStorage()

beforeAll(async () => {
    const db = new Database()
    await db.connect()
})

describe('Checking storage.dvir', () => {
    const dvir = {
        _id: '93664746-60e4-42ba-b544-6a8a5bcf4f8f',
        company: '93664746-60e4-42ba-b544-6a8a5bcf4f8f',
        vehicle: '93664746-60e4-42ba-b544-6a8a5bcf4f8f',
        driver: '93664746-60e4-42ba-b544-6a8a5bcf4f8f',
        trailer: 'asasas',
        location: 'asasas',
        date: 121212,
        odometer: 21212
    }

    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca952a56'

    test('Create new dvir: succes', () => {
        return storage.create(dvir as IDvir).then((data) => {
            expect(data._id).toEqual(dvir._id)
        })
    })

    test('Get all dvir: success', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('Get one dvir: success', () => {
        return storage.findOne({ _id: dvir._id }).then((data) => {
            expect(data._id).toEqual(dvir._id)
        })
    })

    test('Get one dvir: fail', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })


    test('Get delete dvir: succes', () => {
        return storage.delete(dvir._id).then((data) => {
            expect(data._id).toEqual(dvir._id)
        })
    })

    test('Get delete dvir: fail', () => {
        return storage.delete(fake_id).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })
})
