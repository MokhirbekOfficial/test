import { Schema, Document, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IAdmin extends Document {
    _id: string
    name: {
        first_name: string
        last_name: string
    }
    email: string
    password: string
    status: string
    type: string
    created_at: number
}

const adminSchema = new Schema({
    _id: {
        type: String,
        default: uuidv4
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
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    type: {
        type: String,
        enum: ['admin', 'super_admin'],
        default: 'admin'
    },
    created_at: {
        type: Number,
        default: Date.now
    }
})

export default model<IAdmin>('Admin', adminSchema)
