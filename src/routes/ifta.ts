import { Router } from 'express'
import { IFTAController } from '../controllers/ifta'
import { IFTAValidator } from '../validators/ifta'
import { AuthMiddleware } from '../middleware/auth'

const router = Router({ mergeParams: true })
const controller = new IFTAController()
const validator = new IFTAValidator()
const middleware = new AuthMiddleware()

router.route('/all').get(middleware.auth(['admin', 'service', 'company']), controller.getAll)
router
    .route('/create')
    .post(middleware.auth(['service', 'company']), validator.create, controller.create)
router
    .route('/:id')
    .get(middleware.auth(['admin', 'service', 'company']), controller.getOne)
    .patch(middleware.auth(['service', 'company']), validator.update, controller.update)
    .delete(middleware.auth(['service', 'company']), controller.delete)

export default router
