import { Router } from 'express'
import { CompanyController } from '../controllers/company'
import { CompanyValidator } from '../validators/company'
import { AuthMiddleware } from '../middleware/auth'

const router = Router({ mergeParams: true })
const controller = new CompanyController()
const validator = new CompanyValidator()
const middleware = new AuthMiddleware()

router.route('/all').get(middleware.auth(['admin', 'service']), controller.getAll)
router
    .route('/create')
    .post(middleware.auth(['admin', 'service']), validator.create, controller.create)
router
    .route('/:id')
    .get(middleware.auth(['admin', 'service', 'company']), controller.getOne)
    .patch(middleware.auth(['admin', 'service']), validator.update, controller.update)
    .delete(middleware.auth(['admin', 'service']), controller.delete)

export default router
