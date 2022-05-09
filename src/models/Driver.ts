import { Schema, model, Document } from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

export interface IDriver extends Document {
    _id: string
    driver_id: string
    service: string
    company: string
    vehicle: string
    co_driver: string
    current_position: {
        location: string
        date: number
    }
    email: string
    password: string
    name: {
        first_name: string
        last_name: string
    }
    username: string
    phone_number: number
    licence: {
        number: string
        issuing_state: string
    }
    terminal_address: string
    notes: string
    signature: string
    status: string
    is_active: boolean
    activated_date: number
    terminated_date: number
    phone_data: {
        device: string
        battery: number
        bluetooth: boolean
        eld_connection: boolean
        gsp_permission: boolean
        location: boolean
        microphone: boolean
        storage: boolean
        system_sound: boolean
        system_time: number
        app_version: string
    }
    created_at: number
}

const driverSchema = new Schema({
    _id: {
        type: String,
        default: uuidv4
    },
    driver_id: {
        type: String,
        required: true
    },
    service: {
        type: String,
        ref: 'Service'
    },
    company: {
        type: String,
        required: true,
        ref: 'Company'
    },
    vehicle: {
        type: String,
        ref: 'Vehicle'
    },
    co_driver: {
        type: String,
        ref: 'Driver'
    },
    current_position: {
        location: {
            type: String
        },
        date: {
            type: Number
        }
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
    username: {
        type: String,
        required: true
    },
    phone_number: {
        type: Number,
        required: true,
        unique: true
    },
    licence: {
        number: {
            type: String
        },
        issuing_state: {
            type: String
        }
    },
    terminal_address: {
        type: String
    },
    notes: {
        type: String
    },
    signature: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        enum: ['on', 'dr', 'sb', 'off'],
    },
    is_active: {
        type: Boolean,
        default: true
    },
    activated_date: {
        type: Number,
        default: Date.now
    },
    terminated_date: {
        type: Number
    },
    phone_data: {
        device: {
            type: String
        },
        battery: {
            type: Number
        },
        bluetooth: {
            type: Boolean,
            default: false
        },
        eld_connection: {
            type: Boolean,
            default: false
        },
        gsp_permission: {
            type: Boolean,
            default: false
        },
        location: {
            type: Boolean,
            default: false
        },
        microphone: {
            type: Boolean,
            default: false
        },
        storage: {
            type: Boolean,
            default: false
        },
        system_sound: {
            type: Boolean,
            default: false
        },
        system_time: {
            type: Number
        },
        app_version: {
            type: String
        }
    },
    created_at: {
        type: Number,
        default: Date.now
    }
})

export default model<IDriver>('Driver', driverSchema)
