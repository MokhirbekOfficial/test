import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface ICompany extends Document {
    _id: string
    service: string
    name: string
    email: string
    password: string
    dot_number: number
    phone_number: number
    address: string
    terminal: {
        address: string
        zone: string
    }
    total_drivers: number
    total_vehicles: number
    status: string
    type: string
    created_at: number
}

const companySchema = new Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    service: {
        type: String,
        ref: 'Service'
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    dot_number: {
        type: Number,
        required: true
    },
    phone_number: {
        type: Number,
        unique: true,
        required: true
    },
    address: {
        type: String,
        requried: true
    },
    terminal: {
        address: {
            type: String,
            required: true
        },
        zone: {
            type: String,
            required: true
        }
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
    type: {
        type: String,
        enum: ['only_company', 'company'],
        required: true
    },
    created_at: {
        type: Number,
        default: Date.now
    }
})

export default mongoose.model<ICompany>('Company', companySchema)
