import { Router } from 'express'
import { LogController } from '../controllers/log'
import { LogValidator } from '../validators/log'
import { AuthMiddleware } from '../middleware/auth'
import multer from '../middleware/multer'

const router = Router({ mergeParams: true })
const controller = new LogController()
const validator = new LogValidator()
const middleware = new AuthMiddleware()

const upload = multer(['image/png', 'image/jpg', 'image/jpeg'], 5).single('signature')

router
    .route('/create')
    .post(middleware.auth(['driver']), upload, validator.create, controller.create)
router
    .route('/all')
    .get(middleware.auth(['admin', 'service', 'company', 'driver']), controller.getAll)
router
    .route('/:id')
    .get(middleware.auth(['admin', 'service', 'company', 'driver']), controller.getOne)
export default router
