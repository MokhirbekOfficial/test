import { Schema, model, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

// @ts-ignore
export interface IVehicle extends Document {
    _id: string
    vehicle_id: string
    service: string
    company: string
    drivers: string[]
    make: string
    model: string
    vin_code: string
    year: number
    licence_plate: {
        number: number
        state: string
    }
    eld: {
        id: string
        provider: string
    }
    fuel_type: string
    notes: string
    status: string
    created_at: number
}

const vehicleSchema = new Schema<IVehicle>({
    _id: {
        type: String,
        default: uuidv4
    },
    vehicle_id: {
        type: String,
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
    drivers: [{
        type: String,
        ref: 'Driver',
        default: []
    }],
    make: {
        type: String
    },
    model: {
        type: String
    },
    vin_code: {
        type: String
    },
    year: {
        type: Number
    },
    licence_plate: {
        number: {
            type: Number
        },
        state: {
            type: String
        }
    },
    eld: {
        id: {
            type: String
        },
        provider: {
            type: String
        }
    },
    fuel_type: {
        type: String
    },
    notes: {
        type: String
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

export default model<IVehicle>('Vehicle', vehicleSchema)
