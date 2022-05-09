import { Schema, Document, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IDvir extends Document {
    _id: string
    service: string
    company: string
    vehicle: string
    driver: string
    trailer: string
    defects: {
        trailer: string[]
        unit: string[]
    }
    location: string
    date: number
    odometer: number
    defect_comment: string
    signature: string
    created_at: number
}

const dvirSchema = new Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    service: {
        type: String
    },
    company: {
        type: String,
        required: true
    },
    vehicle: {
        type: String,
        required: true
    },
    driver: {
        type: String,
        required: true
    },
    trailer: {
        type: String,
        required: true
    },
    defects: {
        trailer: {
            type: [String]
        },
        unit: {
            type: [String]
        }
    },
    location: {
        type: String,
        required: true
    },
    date: {
        type: Number,
        required: true
    },
    odometer: {
        type: Number,
        required: true
    },
    defect_comment: {
        type: String
    },
    signature: {
        type: String
    },
    created_at: {
        type: Number,
        default: Date.now
    }
})

export default model<IDvir>('Dvir', dvirSchema)
