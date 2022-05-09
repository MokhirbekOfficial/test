import { Router } from 'express'
import { ServiceController } from '../controllers/service'
import { ServiceValidator } from '../validators/service'
import { AuthMiddleware } from '../middleware/auth'
import {set, get, clear} from '../middleware/cache'

const router = Router({ mergeParams: true })
const controller = new ServiceController()
const validator = new ServiceValidator()
const middleware = new AuthMiddleware()

router.route('/all').get(middleware.auth(['admin']), get(), controller.getAll, set())
router.route('/create').post(middleware.auth(['admin']), validator.create, controller.create, clear())
router
    .route('/:id')
    .get(middleware.auth(['admin', 'service']), controller.getOne)
    .patch(middleware.auth(['admin']), validator.update, controller.update, clear())
    .delete(middleware.auth(['admin']), controller.delete, clear())

export default router
