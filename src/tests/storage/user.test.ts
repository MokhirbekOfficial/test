import { IUser } from '../../models/User'
import { UserStorage } from '../../storage/mongo/user'
import Database from '../../core/db'

const storage = new UserStorage()

beforeAll(async () => {
    const db = new Database()
    await db.connect()
})

describe('Checking storage.user', () => {
    const user = {
        _id: 'cd4f1b46-f9ea-4628-a91d-fb414f02a66t',
        name: {
            first_name: "Kimdur",
            last_name: "Nimadurovich"
        },
        email: "kimdur@gmail.com",
        password: "$2b$10$hiCzZvSsTE8ddnSlbPYrnOmL8Co46zKYedDDWUxDfV6zd1rZqGc1.",
        phone_number: 1231223,
        type: "service",
        type_id: "cd4f1b46-f9ea-4628-a91d-fb414f02a66e"
    }

    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca952a56'

    test('Create new user: succes', () => {
        return storage.create(user as IUser).then((data) => {
            expect(data._id).toEqual(user._id)
        })
    })

    test('Get all user: success', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('Get one user: success', () => {
        return storage.findOne({ _id: user._id }).then((data) => {
            expect(data._id).toEqual(user._id)
        })
    })

    test('Get one user: fail', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get update user: success', () => {
        const email = 'doe@gmail.com'
        return storage.update(user._id, { email } as IUser).then((data) => {
            expect(data._id).toEqual(user._id)
        })
    })

    test('Get update user: fail', () => {
        const email = 'doe@gmail.com'
        return storage.update(fake_id, { email } as IUser).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get delete user: succes', () => {
        return storage.delete(user._id).then((data) => {
            expect(data._id).toEqual(user._id)
        })
    })

    test('Get delete user: fail', () => {
        return storage.delete(fake_id).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })
})
