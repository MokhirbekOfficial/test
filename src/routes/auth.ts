import { Router } from 'express'
import { AuthController } from '../controllers/auth'
import { AuthMiddleware } from './../middleware/auth'
import { AuthValidator } from '../validators/auth'

const router = Router({ mergeParams: true })
const controller = new AuthController()
const middleware = new AuthMiddleware()
const validator = new AuthValidator()

router.route('/login').post(validator.login, controller.login)
router.route('/profile').get(middleware.auth(['admin', 'service', 'company']), controller.profile)

export default router
