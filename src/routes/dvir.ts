import { Router } from 'express'
import { DvirController } from '../controllers/dvir'
import { DvirValidator } from '../validators/dvir'
import { AuthMiddleware } from '../middleware/auth'
import multer from '../middleware/multer'

const router = Router({ mergeParams: true })
const controller = new DvirController()
const validator = new DvirValidator()
const middleware = new AuthMiddleware()
const upload = multer(['image/png', 'image/jpeg'], 20).single('signature')

router.route('/all').get(middleware.auth(['admin','service', 'company', 'driver']), controller.getAll)
router
    .route('/create')
    .post(upload,middleware.auth(['driver']),validator.create, controller.create)
router
    .route('/:id')
    .get(middleware.auth(['admin','service','company','driver']), controller.getOne)
    .delete(middleware.auth(['driver']), controller.delete)

export default router
