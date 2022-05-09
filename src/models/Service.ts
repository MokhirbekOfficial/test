import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IService extends Document {
    _id: string
    email: string
    password: string
    name: {
        first_name: string
        last_name: string
    }
    timezone: string
    dot_number: number
    total_companies: number
    total_drivers: number
    total_vehicles: number
    status: string
    created_at: number
}

const serviceSchema = new Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        first_name: {
            type: String,
            required: true
        },
        last_name: {
            type: String,
            required: true
        }
    },
    timezone: {
        type: String,
        required: true
    },
    dot_number: {
        type: Number,
        required: true
    },
    total_companies: {
        type: Number,
        default: 0
    },
    total_drivers: {
        type: Number,
        default: 0
    },
    total_vehicles: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    created_at: {
        type: Number,
        default: Date.now
    }
})

export default mongoose.model<IService>('Service', serviceSchema)
