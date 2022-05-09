import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface ILog extends Document {
    _id: string
    service: string
    company: string
    driver: string
    vehicle: string
    co_driver: string
    status: string
    location: {
        name: string
        lat: string
        long: string
    }
    odometer: number
    engine_hours: number
    trailers: string
    documents: string
    notes: string
    faults: string[]
    warnings: string[]
    hours: number
    created_at: number
}

const logSchema = new Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    service: String,
    company: {
        type: String,
        required: true
    },
    driver: {
        type: String,
        required: true,
        ref: 'Driver'
    },
    vehicle: {
        type: String,
        required: true,
        ref: 'Vehicle'
    },
    co_driver: {
        type: String,
        ref: 'Driver'
    },
    status: {
        type: String,
        enum: ['on', 'dr', 'sb', 'off(pc)', 'on(ym)', 'off', 'intermediate(dr)', 'intermediate(yard)', 'sertify', 'login', 'logout', 'power on', 'power off'],
        required: true
    },
    location: {
        name: {
            type: String,
            required: true
        },
        lat: {
            type: String,
            required: true
        },
        long: {
            type: String,
            required: true
        }
    },
    odometer: {
        type: Number,
        required: true
    },
    engine_hours: {
        type: Number,
        required: true
    },
    trailers: {
        type: String,
        required: true
    },
    documents: {
        type: String,
        required: true
    },
    notes: {
        type: String
    },
    faults: {
        type: [String]
    },
    warnings: {
        type: [String]
    },
    hours: {
        type: Number
    },
    created_at: {
        type: Number,
        default: Date.now
    }
})

export default mongoose.model<ILog>('Log', logSchema)
