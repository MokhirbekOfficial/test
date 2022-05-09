import { Router } from 'express'
import { DriverController } from '../controllers/driver'
import { DriverValidator } from '../validators/driver'
import { AuthMiddleware } from '../middleware/auth'
import { get, set, clear } from '../middleware/cache'

const router = Router({ mergeParams: true })
const controller = new DriverController()
const validator = new DriverValidator()
const middleware = new AuthMiddleware()

router
    .route('/all')
    .get(middleware.auth(['admin', 'service', 'company']), get(), controller.getAll, set())
router
    .route('/create')
    .post(middleware.auth(['service', 'company']), validator.create, controller.create, clear())
router
    .route('/statusCount')
    .get(middleware.auth(['admin', 'service', 'company']), controller.getStatusCounts)
router.route('/login').post(validator.login, controller.login)
router
    .route('/:id')
    .get(middleware.auth(['admin', 'service', 'company', 'driver']), controller.getOne)
    .patch(middleware.auth(['service', 'company']), validator.update, controller.update, clear())
    .delete(middleware.auth(['service', 'company']), controller.delete, clear())

export default router
