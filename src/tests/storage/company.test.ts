import { ICompany } from '../../models/Company'
import { CompanyStorage } from '../../storage/mongo/company'
import Database from '../../core/db'

const storage = new CompanyStorage()

beforeAll(async () => {
    const db = new Database()
    await db.connect()
})

describe('Checking storage.company', () => {
    const company = {
        _id: 'cd4f1b46-f9ea-4628-a91d-fb414f02a66e',
        service: '67be67bc-9479-4e5d-ae23-af87c4956d4f',
        name: 'Company Name',
        email: 'company@gmai.com',
        password: '$2b$10$hiCzZvSsTE8ddnSlbPYrnOmL8Co46zKYedDDWUxDfV6zd1rZqGc1.',
        dot_number: 123456,
        phone_number: 12345678,
        address: 'Company Address',
        terminal: {
            address: 'Terminal Address',
            zone: 'Terminal Zone'
        },
        type: 'company'
    }

    const fake_id = '8bf5fc5c-0558-408c-a12f-95dca952a56'

    test('Create new company: succes', () => {
        return storage.create(company as ICompany).then((data) => {
            expect(data._id).toEqual(company._id)
        })
    })

    test('Get all company: success', () => {
        return storage.find({}).then((data) => {
            expect(data.length > 0).toBeTruthy()
        })
    })

    test('Get one company: success', () => {
        return storage.findOne({ _id: company._id }).then((data) => {
            expect(data._id).toEqual(company._id)
        })
    })

    test('Get one company: fail', () => {
        return storage.findOne({ _id: fake_id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get update company: success', () => {
        const email = 'doe@gmail.com'
        return storage.update({ _id: company._id }, { email } as ICompany).then((data) => {
            expect(data._id).toEqual(company._id)
        })
    })

    test('Get update company: fail', () => {
        const email = 'doe@gmail.com'
        return storage.update({ _id: fake_id }, { email } as ICompany).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })

    test('Get delete company: succes', () => {
        return storage.deleteOne({ _id: company._id }).then((data: any) => {
            expect(data._id).toEqual(company._id)
        })
    })

    test('Get delete company: fail', () => {
        return storage.deleteOne({ _id: company._id }).catch((error) => {
            expect(error.statusCode).toEqual(404)
        })
    })
})
