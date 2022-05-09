import { Schema, Document, model } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IIFTA extends Document {
    _id: string
    date: number
    service: string
    company: string
    vehicle: string
    states: string[]
    status: string
    type: string
    name: string
    created_at: number
}

const iftaSchema = new Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    date: {
        type: Number,
        required: true
    },
    service: {
        type: String
    },
    company: {
        type: String,
        ref: 'Company',
        required: true
    },
    vehicle: {
      type: String,
      ref: 'Vehicle',
      required: true
    },
    states: [{
        type: String,
        required: true
    }],
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    },
    type: {
        type: String,
    },
    name: {
        type: String,
        required: true
    },
    created_at: {
        type: Number,
        default: Date.now
    }
})

export default model<IIFTA>('IFTA', iftaSchema)
