import express, { Router } from 'express'
import path from 'path'
import serviceRouter from './service'
import userRouter from './user'
import sampleRouter from './sample'
import adminRouter from './admin'
import driverRouter from './driver'
import vehicleRouter from './vehicle'
import companyRouter from './company'
import dvirRouter from './dvir'
import iftaRouter from './ifta'
import logRouter from './log'
import authRouter from './auth'

const router = Router({ mergeParams: true })

router.use('/api/file', express.static(path.join(__dirname, '../../../uploads')))

router.use('/admin', adminRouter)
router.use('/service', serviceRouter)
router.use('/company', companyRouter)
router.use('/driver', driverRouter)
router.use('/vehicle', vehicleRouter)
router.use('/user', userRouter)
router.use('/log', logRouter)
router.use('/sample', sampleRouter)
router.use('/dvir', dvirRouter)
router.use('/ifta', iftaRouter)
router.use('/auth', authRouter)

export default router
