import dotenv from 'dotenv'

dotenv.config()

interface Config {
    HttpPort: string
    MongoPort: number
    MongoDatabase: string
    JwtSecret: string
    NodeEnv: string
    Lifetime: string
}

let config: Config = {
    HttpPort: getConf('HTTP_PORT', '8000'),
    MongoPort: parseInt(getConf('MONGO_PORT', '27017')),
    MongoDatabase: getConf('MONGO_DATABASE', 'tmk_eld_project'),
    JwtSecret: getConf('JWT_SECRET', 'my_secret'),
    NodeEnv: getConf('NODE_ENV', 'development'),
    Lifetime: getConf('LIFETIME', '30d')
}

function getConf(name: string, def: string = ''): string {
    if (process.env[name]) {
        return process.env[name] || ''
    }

    return def
}

export default config
