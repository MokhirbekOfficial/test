import { IAdmin } from '../../models/Admin'
import { AdminStorage } from '../../storage/mongo/admin'
import Database from '../../core/db'

const storage = new AdminStorage()

beforeAll(async () => {
    const db = new Database()
    await db.connect()
})

describe('Checking storage.admin', () => {
    const admin = {
        name: {
            first_name: "Jhon",
            last_name: "Doe"
        },
        type: "admin",
        _id: "cd4f1b46-f9ea-4628-a91d-fb414f02a66e",
        email: "jhon@gmail.com",
        password: "$2b$10$hiCzZvSsTE8ddnSlbPYrnOmL8Co46zKYedDDWUxDfV6zd1rZqGc1."
    }

    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca952a56'

    test('Create new admin: succes', () => {
        return storage.create(admin as IAdmin).then((data) => {
            expect(data._id).toEqual(admin._id)
        })
    })

    test('Get all admin: success', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('Get one admin: success', () => {
        return storage.findOne({ _id: admin._id }).then((data) => {
            expect(data._id).toEqual(admin._id)
        })
    })

    test('Get one admin: fail', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get update admin: success', () => {
        const email = 'doe@gmail.com'
        return storage.update(admin._id, {email} as IAdmin).then((data) => {
            expect(data._id).toEqual(admin._id)
        })
    })

    test('Get update admin: fail', () => {
        const email = 'doe@gmail.com'
        return storage.update(fake_id, { email } as IAdmin).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get delete admin: succes', () => {
        return storage.delete(admin._id).then((data) => {
            expect(data._id).toEqual(admin._id)
        })
    })

    test('Get delete admin: fail', () => {
        return storage.delete(fake_id).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })
})
