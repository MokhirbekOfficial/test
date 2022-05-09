import mongoose, { Schema, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IUser extends Document {
    _id: string
    name: {
        first_name: string
        last_name: string
    }
    email: string
    password: string
    phone_number: number
    service: string
    status: string
    type: string
    type_id: string
    created_at: number
}

const userSchema = new Schema({
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
    phone_number: {
        type: Number,
        required: true
    },
    service: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    type: {
        type: String,
        enum: ['service', 'company'],
        required: true
    },
    type_id: {
        type: String,
        required: true
    },
    created_at: {
        type: Number,
        default: Date.now
    }
})

export default mongoose.model<IUser>('User', userSchema)
