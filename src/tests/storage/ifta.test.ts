import { IIFTA } from '../../models/IFTA'
import { IFTAStorage } from '../../storage/mongo/ifta'
import Database from '../../core/db'

const storage = new IFTAStorage()

beforeAll(async () => {
    const db = new Database()
    await db.connect()
})

describe('Checking storage.ifta', () => {
    const ifta = {
        _id: '8bf5fc5c-0558-408c-a12f-95dca952a56',
        date: Date.now(),
        service: 'ecc785de-7216-458a-bf6b-54266b47a2b7',
        company: 'ecc785de-7216-458a-bf6b-54266b47a2a9',
        vehicle: 'b988efac-127d-4244-a6f0-4e9a8ebfff90',
        states: ['Vashington', 'Montana', 'Minisota', 'Missuri'],
        type: 'Yetkazib berish',
        name: 'Export'
    }

    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca952a56'

    test('Create new ifta: success', () => {
        return storage.create(ifta as IIFTA).then((data) => {
            expect(data._id).toEqual(ifta._id)
        })
    })

    test('Get all iftas: success', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('Get one ifta: success', () => {
        return storage.findOne({ _id: ifta._id }).then((data) => {
            expect(data._id).toEqual(ifta._id)
        })
    })

    test('Get one ifta: fail', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get update ifta: success', () => {
        const name = 'Import'
        return storage.update(ifta._id, { name } as IIFTA).then((data) => {
            expect(data._id).toEqual(ifta._id)
        })
    })

    test('Get update ifta: fail', () => {
        const name = 'Import'
        return storage.update(fake_id, { name } as IIFTA).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get delete ifta: success', () => {
        return storage.delete(ifta._id).then((data) => {
            expect(data._id).toEqual(ifta._id)
        })
    })

    test('Get delete ifta: fail', () => {
        return storage.delete(fake_id).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })
})
