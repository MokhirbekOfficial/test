import { Router } from 'express'
import { UserController } from '../controllers/user'
import { UserValidator } from '../validators/user'
import { AuthMiddleware } from '../middleware/auth'
import {get, set, clear} from '../middleware/cache'

const router = Router({ mergeParams: true })
const controller = new UserController()
const validator = new UserValidator()
const middleware = new AuthMiddleware()

router.route('/all').get(middleware.auth(['admin', 'service', 'company']), get(), controller.getAll, set())
router
    .route('/create')
    .post(middleware.auth(['company', 'service']), validator.create, controller.create, clear())
router
    .route('/:id')
    .get(middleware.auth(['admin', 'service', 'company']), controller.getOne)
    .patch(middleware.auth(['service', 'company']), validator.update, controller.update, clear())
    .delete(middleware.auth(['service', 'company']), controller.delete, clear())

export default router
