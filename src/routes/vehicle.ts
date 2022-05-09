import { Router } from 'express'
import {VehicleController} from '../controllers/vehicle'
import { VehicleValidator } from '../validators/vehicle'
import { AuthMiddleware } from '../middleware/auth'
import {get, set, clear} from '../middleware/cache'

const router = Router({ mergeParams: true })
const controller = new VehicleController()
const validator = new VehicleValidator()
const middleware = new AuthMiddleware()

router
    .route('/all')
    .get(middleware.auth(['admin',  'company', 'service']), get(), controller.getAll, set())
router
    .route('/create')
    .post(middleware.auth(['company', 'service']), validator.create, controller.create, clear())
router
    .route('/:id')
    .get(middleware.auth(['admin',  'company', 'service']), controller.getOne)
    .patch(middleware.auth(['company', 'service']), validator.update, controller.update, clear())
    .delete(middleware.auth(['company', 'service']), controller.delete, clear())

export default router
